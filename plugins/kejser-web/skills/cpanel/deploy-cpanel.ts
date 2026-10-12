import { existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';
import AdmZip from 'adm-zip';

export interface CpanelTarget {
	host: string;
	port: number;
	user: string;
	password: string;
	siteUrl: string;
}

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
	return name.replace(/^@[^/]+\//, '').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
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
