import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repository = 'harness-operations/specification';
const version = process.argv[2];

if (!version || !/^v\d+\.\d+(?:\.\d+)?$/.test(version)) {
  throw new Error('Usage: node scripts/prepare-release.mjs vX.Y[.Z]');
}

async function githubJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'harness-operations-release-prep',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub lookup failed: ${response.status} ${response.statusText} (${url})`);
  }
  return response.json();
}

const release = await githubJson(
  `https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(version)}`,
);
if (release.draft || release.prerelease || !release.published_at) {
  throw new Error(`${version} must be a published, non-prerelease GitHub release`);
}

const ref = await githubJson(
  `https://api.github.com/repos/${repository}/git/ref/tags/${encodeURIComponent(version)}`,
);
let commit;
if (ref.object?.type === 'commit') {
  commit = ref.object.sha;
} else if (ref.object?.type === 'tag' && ref.object?.url) {
  const tag = await githubJson(ref.object.url);
  if (tag.object?.type !== 'commit') {
    throw new Error(`Annotated tag ${version} does not resolve directly to a commit`);
  }
  commit = tag.object.sha;
} else {
  throw new Error(`Unsupported tag object for ${version}`);
}

const metadata = {
  version,
  commit,
  published_at: release.published_at,
};
await writeFile(resolve('SPEC_RELEASE.json'), JSON.stringify(metadata, null, 2) + '\n');

const pkgPath = resolve('package.json');
const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
const parts = version.slice(1).split('.');
pkg.version = parts.length === 2 ? `${version.slice(1)}.0` : version.slice(1);
await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Prepared website metadata for ${version} @ ${commit}`);
