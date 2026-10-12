import { existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { Client, FTPError } from 'basic-ftp';
import AdmZip from 'adm-zip';

export interface CpanelTarget {
	host: string;
	port: number;
	user: string;
	password: string;
	siteUrl: string;
}

const PHP_HANDLER =
	/^# php -- BEGIN cPanel-generated handler.*$[\s\S]*?^# php -- END cPanel-generated handler.*$/m;

/** Reads `<PREFIX>_FTP_HOST`, `_FTP_PORT`, `_FTP_USER`, `_FTP_PWD` and `_SITE_URL`; the prefix defaults to the package name. */
export function cpanelTargetFromEnv(prefix = envPrefix()): CpanelTarget {
	const read = (name: string, fallback?: string): string => {
		const value = process.env[`${prefix}_${name}`] ?? fallback;
		if (!value) {
			throw new Error(`${prefix}_${name} is not set`);
		}
		return value;
	};
	return {
		host: read('FTP_HOST'),
		port: Number(read('FTP_PORT', '21')),
		user: read('FTP_USER'),
		password: read('FTP_PWD'),
		siteUrl: read('SITE_URL').replace(/\/+$/, '')
	};
}

/** `my-site` in package.json becomes `MY_SITE`. */
export function envPrefix(): string {
	const { name } = JSON.parse(readFileSync('package.json', 'utf8')) as { name: string };
	return name
		.replace(/^@[^/]+\//, '')
		.replace(/[^A-Za-z0-9]+/g, '_')
		.toUpperCase();
}

/** Uploads `buildDir` as one zip over FTPS, then has a one-shot PHP script unpack it in the FTP account's root. */
export async function deployToCpanel(target: CpanelTarget, buildDir = 'build'): Promise<void> {
	if (!existsSync(buildDir)) {
		throw new Error(`${buildDir}/ does not exist; build first`);
	}

	const token = randomBytes(16).toString('hex');
	const zipName = `deploy-${token}.zip`;
	const phpName = `deploy-${token}.php`;

	const zip = new AdmZip();
	zip.addLocalFolder(buildDir);

	const client = new Client(60_000);
	try {
		await client.access({
			host: target.host,
			port: target.port,
			user: target.user,
			password: target.password,
			secure: true
		});
		assertPhpHandlerKept(await downloadText(client, '.htaccess'), buildDir);

		await client.uploadFrom(Readable.from(zip.toBuffer()), zipName);
		await client.uploadFrom(Readable.from(unpackScript(zipName)), phpName);

		const response = await fetch(`${target.siteUrl}/${phpName}`);
		const body = (await response.text()).trim();
		if (!response.ok || body !== 'deployed') {
			throw new Error(`unpack failed: HTTP ${response.status}: ${body.slice(0, 500)}`);
		}
	} finally {
		for (const name of [zipName, phpName]) {
			await client.remove(name, true).catch(() => {});
		}
		client.close();
	}
}

/** The unpack script needs cPanel's PHP handler, so a build `.htaccess` that would overwrite the server's must carry it. */
function assertPhpHandlerKept(serverHtaccess: string, buildDir: string): void {
	const handler = serverHtaccess.match(PHP_HANDLER)?.[0];
	const buildHtaccess = join(buildDir, '.htaccess');
	if (!handler || !existsSync(buildHtaccess)) {
		return;
	}
	if (!readFileSync(buildHtaccess, 'utf8').includes(handler)) {
		throw new Error(
			`${buildHtaccess} would remove cPanel's PHP handler, which the deploy needs.\n` +
				`Copy this block from the server into static/.htaccess:\n\n${handler}\n`
		);
	}
}

async function downloadText(client: Client, path: string): Promise<string> {
	const chunks: Buffer[] = [];
	const sink = new Writable({
		write(chunk: Buffer, _encoding, done) {
			chunks.push(chunk);
			done();
		}
	});
	try {
		await client.downloadTo(sink, path);
	} catch (error) {
		if (error instanceof FTPError && error.code === 550) {
			return '';
		}
		throw error;
	}
	return Buffer.concat(chunks).toString('utf8');
}

function unpackScript(zipName: string): string {
	return `<?php
header('Content-Type: text/plain');
$zip = new ZipArchive();
$ok = $zip->open(__DIR__ . '/${zipName}') === true && $zip->extractTo(__DIR__);
if ($ok) { $zip->close(); }
@unlink(__DIR__ . '/${zipName}');
@unlink(__FILE__);
http_response_code($ok ? 200 : 500);
echo $ok ? 'deployed' : 'unzip failed';
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const target = cpanelTargetFromEnv(process.argv[2]);
	await deployToCpanel(target, process.argv[3]);
	console.log(`deployed to ${target.siteUrl}`);
}
