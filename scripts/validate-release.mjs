import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const release = JSON.parse(await readFile(resolve('SPEC_RELEASE.json'), 'utf8'));
const pkg = JSON.parse(await readFile(resolve('package.json'), 'utf8'));

if (!/^v\d+\.\d+(?:\.\d+)?$/.test(release.version)) {
  throw new Error(`Invalid release version: ${release.version}`);
}
if (!/^[0-9a-f]{40}$/.test(release.commit)) {
  throw new Error(`Invalid release commit: ${release.commit}`);
}
if (Number.isNaN(Date.parse(release.published_at))) {
  throw new Error(`Invalid release publication date: ${release.published_at}`);
}

const displayVersion = release.version.slice(1);
if (pkg.version !== `${displayVersion}.0`) {
  throw new Error(
    `package.json version ${pkg.version} does not match Reference Model ${displayVersion}`,
  );
}

for (const path of ['README.md', 'astro.config.mjs', 'src/content/docs/index.mdx']) {
  const body = await readFile(resolve(path), 'utf8');
  const matches = [...body.matchAll(/Reference Model (\d+\.\d+)/g)].map((match) => match[1]);
  const stale = matches.filter((version) => version !== displayVersion);
  if (stale.length > 0) {
    throw new Error(
      `${path} contains stale displayed Reference Model version(s): ${[...new Set(stale)].join(', ')}`,
    );
  }
}

console.log(
  `Release metadata valid: ${release.version} @ ${release.commit} published ${release.published_at}`,
);
