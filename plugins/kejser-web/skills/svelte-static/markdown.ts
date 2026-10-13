import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { error } from '@sveltejs/kit';
import matter from 'gray-matter';
import { Marked, type MarkedExtension, type Token, type Tokens } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import markedShiki from 'marked-shiki';
import {
	bundledLanguages,
	createHighlighter,
	type BundledTheme,
	type Highlighter,
	type LanguageRegistration
} from 'shiki';

export interface MarkdownOptions {
	/** Folder holding the collections; defaults to `src/content`. */
	root?: string;
	/** Extra `marked` extensions, applied after the built-in ones. */
	extensions?: MarkedExtension[];
	/** Custom TextMate grammars, registered once on the shared highlighter. */
	languages?: LanguageRegistration[];
	/** Fence names mapped to a language, e.g. `{ postgres: 'sql' }`. */
	languageAliases?: Record<string, string>;
	/** Code themes; the page's `color-scheme` picks between them. */
	themes?: { light: BundledTheme; dark: BundledTheme };
	/** Leave the `#` heading out of `html`, for layouts that render `title` themselves. */
	stripTitle?: boolean;
	/** Site path for a content path; defaults to `pages/<slug>` → `/<slug>`, otherwise `/<path>`. */
	urlFor?: (name: string) => string;
}

export interface MarkdownDocument {
	/** Content path without extension, e.g. `posts/first-post`. */
	name: string;
	slug: string;
	/** Raw front matter; each collection module validates its own fields. */
	frontMatter: Record<string, unknown>;
	/** Text of the single `#` heading, if the file has one. */
	title: string | undefined;
	html: string;
	/** `marked` tokens of the body, for summaries, reading time and the like. */
	tokens: Token[];
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

let highlighter: Promise<Highlighter> | undefined;

/** Reads `<root>/<name>.md`, e.g. `loadMarkdown('pages/about')`; a missing file is a 404. */
export async function loadMarkdown(
	name: string,
	options: MarkdownOptions = {}
): Promise<MarkdownDocument> {
	const path = join(options.root ?? 'src/content', `${name}.md`);
	if (!existsSync(path)) {
		error(404, `${path} does not exist`);
	}
	return renderMarkdown(name, readFileSync(path, 'utf8'), options);
}

/** Content paths of every `.md` file in a collection, e.g. `['posts/a', 'posts/b']`. */
export function listMarkdown(collection: string, options: MarkdownOptions = {}): string[] {
	return readdirSync(join(options.root ?? 'src/content', collection))
		.filter((file) => file.endsWith('.md'))
		.map((file) => `${collection}/${file.slice(0, -'.md'.length)}`)
		.sort();
}

/** Renders Markdown already in hand, such as an `import.meta.glob` `?raw` import; `name` is its content path. */
export async function renderMarkdown(
	name: string,
	source: string,
	options: MarkdownOptions = {}
): Promise<MarkdownDocument> {
	const slug = name.slice(name.lastIndexOf('/') + 1);
	if (!SLUG.test(slug)) {
		throw new Error(`${name}.md: file name must be lowercase kebab-case`);
	}
	const { data, content } = matter(source);
	if (content.trim() === '') {
		throw new Error(`${name}.md: body is empty`);
	}

	const marked = new Marked(
		gfmHeadingId(),
		markedShiki({ highlight: await highlightFor(name, options) }),
		contentLinks(name, options.urlFor ?? defaultUrlFor),
		...(options.extensions ?? [])
	);
	const tokens = marked.lexer(content);
	const titles = tokens.filter(
		(token): token is Tokens.Heading => token.type === 'heading' && token.depth === 1
	);
	if (titles.length > 1) {
		throw new Error(`${name}.md: has ${titles.length} # headings; a file has at most one`);
	}
	const body = options.stripTitle ? content.replace(titles[0]?.raw ?? '', '') : content;

	return {
		name,
		slug,
		frontMatter: data,
		title: titles[0]?.text,
		html: await marked.parse(body, { async: true }),
		tokens
	};
}

function defaultUrlFor(name: string): string {
	return name.startsWith('pages/') ? `/${name.slice('pages/'.length)}` : `/${name}`;
}

/** Relative `.md` links become site paths; local images are root-relative paths that exist in `static/`. */
function contentLinks(name: string, urlFor: (name: string) => string): MarkedExtension {
	return {
		walkTokens(token) {
			if (token.type === 'image' && !/^[a-z][a-z0-9+.-]*:/i.test(token.href)) {
				if (!token.href.startsWith('/')) {
					throw new Error(`${name}.md: image ${token.href} must be a path into static/`);
				}
				if (!existsSync(join('static', decodeURI(token.href)))) {
					throw new Error(`${name}.md: image ${token.href} is not in static/`);
				}
			}
			if (token.type !== 'link' || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(token.href)) {
				return;
			}
			const [path, hash] = token.href.split('#', 2);
			if (!path.endsWith('.md')) {
				throw new Error(`${name}.md: relative link ${token.href} must point to a .md file`);
			}
			const target = posix.join(posix.dirname(name), path.slice(0, -'.md'.length));
			if (target.startsWith('../')) {
				throw new Error(`${name}.md: link ${token.href} leaves the content folder`);
			}
			token.href = urlFor(target) + (hash ? `#${hash}` : '');
		}
	};
}

async function highlightFor(name: string, options: MarkdownOptions) {
	const themes = options.themes ?? DEFAULT_THEMES;
	highlighter ??= createHighlighter({ themes: [], langs: [] });
	const shiki = await highlighter;
	for (const theme of Object.values(themes)) {
		if (!shiki.getLoadedThemes().includes(theme)) {
			await shiki.loadTheme(theme);
		}
	}
	for (const language of options.languages ?? []) {
		if (!shiki.getLoadedLanguages().includes(language.name)) {
			await shiki.loadLanguage(language);
		}
	}

	return async (code: string, fence: string): Promise<string> => {
		const lang = options.languageAliases?.[fence] ?? (fence || 'text');
		if (
			!['text', 'plaintext', 'txt'].includes(lang) &&
			!shiki.getLoadedLanguages().includes(lang)
		) {
			if (!(lang in bundledLanguages)) {
				throw new Error(`${name}.md: unknown code language "${fence}"`);
			}
			await shiki.loadLanguage(lang as keyof typeof bundledLanguages);
		}
		return shiki.codeToHtml(code, { lang, themes, defaultColor: 'light-dark()' });
	};
}
