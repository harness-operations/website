import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const release = JSON.parse(await readFile(resolve('SPEC_RELEASE.json'), 'utf8'));

if (!/^v\d+\.\d+(?:\.\d+)?$/.test(release.version)) {
  throw new Error(`Invalid release version: ${release.version}`);
}
if (!/^[0-9a-f]{40}$/.test(release.commit)) {
  throw new Error(`Invalid release commit: ${release.commit}`);
}
if (Number.isNaN(Date.parse(release.published_at))) {
  throw new Error(`Invalid release publication date: ${release.published_at}`);
}

console.log(
  `Release metadata valid: ${release.version} @ ${release.commit} published ${release.published_at}`,
);
