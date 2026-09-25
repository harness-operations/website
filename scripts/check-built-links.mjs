import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve('dist');
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}
await walk(root);

function routeFor(path) {
  const rel = relative(root, path).replaceAll('\\\\', '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function fileForPathname(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === '/') return join(root, 'index.html');
  if (decoded.endsWith('/')) return join(root, decoded, 'index.html');
  if (extname(decoded)) return join(root, decoded);
  return join(root, decoded, 'index.html');
}

const failures = [];
for (const sourcePath of htmlFiles) {
  const html = await readFile(sourcePath, 'utf8');
  const base = new URL(routeFor(sourcePath), 'https://harness-operations.com');

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (!href || /^(mailto:|tel:|javascript:)/.test(href)) continue;

    const url = new URL(href, base);
    if (url.origin !== base.origin) continue;

    const targetPath = fileForPathname(url.pathname);
    let targetHtml;
    try {
      targetHtml = await readFile(targetPath, 'utf8');
    } catch {
      failures.push(`${routeFor(sourcePath)} -> ${href}: missing target`);
      continue;
    }

    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      const escaped = id.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?:id|name)=["']${escaped}["']`);
      if (!pattern.test(targetHtml)) {
        failures.push(`${routeFor(sourcePath)} -> ${href}: missing anchor`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated internal links/anchors across ${htmlFiles.length} built HTML pages.`);
