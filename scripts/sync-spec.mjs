import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repository = 'harness-operations/specification';
const releaseFile = resolve('SPEC_RELEASE.json');
const outputDirectory = resolve('src/content/docs');

const release = JSON.parse(await readFile(releaseFile, 'utf8'));
const { version, commit } = release;

if (!/^v\d+\.\d+(?:\.\d+)?$/.test(version)) {
  throw new Error(`Invalid specification version: ${version}`);
}
if (!/^[0-9a-f]{40}$/.test(commit)) {
  throw new Error(`Invalid specification commit SHA: ${commit}`);
}

async function githubJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'harness-operations-website-build',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub metadata lookup failed: ${response.status} ${response.statusText} (${url})`);
  }
  return response.json();
}

async function resolveReleaseCommit() {
  const ref = await githubJson(
    `https://api.github.com/repos/${repository}/git/ref/tags/${encodeURIComponent(version)}`,
  );

  if (ref.object?.type === 'commit') return ref.object.sha;
  if (ref.object?.type !== 'tag' || !ref.object?.url) {
    throw new Error(`Unsupported tag object for ${version}`);
  }

  const tag = await githubJson(ref.object.url);
  if (tag.object?.type !== 'commit' || !tag.object?.sha) {
    throw new Error(`Annotated tag ${version} does not resolve directly to a commit`);
  }
  return tag.object.sha;
}

const resolvedCommit = await resolveReleaseCommit();
if (resolvedCommit !== commit) {
  throw new Error(
    `Pinned specification mismatch: ${version} resolves to ${resolvedCommit}, expected ${commit}`,
  );
}

const documents = [
  ['reference/overview.md', 'overview.md', 'Overview', 'What Harness Operations is and where the operational problem begins.'],
  ['reference/principles.md', 'principles.md', 'Principles', 'Design principles for operating heterogeneous harness systems.'],
  ['reference/model.md', 'model.md', 'Reference Model', 'Core concepts and relationships in the Harness Operations Reference Model.'],
  ['reference/governance.md', 'governance.md', 'Governance', 'Authority, policy, delegation, approvals, exceptions, limits, and accountability.'],
  ['reference/landscape.md', 'landscape.md', 'Standards Landscape', 'Interoperability boundaries with existing standards and adjacent disciplines.'],
  ['reference/terminology.md', 'terminology.md', 'Scope and Terminology', 'Shared scope, boundaries, and vocabulary for the reference model.'],
].map(([source, target, title, description]) => ({ source, target, title, description }));

async function fetchDocument(document) {
  const sourceUrl = `https://raw.githubusercontent.com/${repository}/${commit}/${document.source}`;
  const response = await fetch(sourceUrl, {
    headers: { 'user-agent': 'harness-operations-website-build' },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${document.source} from ${version} (${commit}): ${response.status} ${response.statusText}`,
    );
  }
  return { ...document, body: await response.text() };
}

const fetchedDocuments = await Promise.all(documents.map(fetchDocument));
await mkdir(outputDirectory, { recursive: true });

for (const document of fetchedDocuments) {
  const editUrl = `https://github.com/${repository}/blob/${commit}/${document.source}`;
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(document.title)}`,
    `description: ${JSON.stringify(document.description)}`,
    `editUrl: ${JSON.stringify(editUrl)}`,
    '---',
    '',
  ].join('\n');

  await writeFile(resolve(outputDirectory, document.target), `${frontmatter}${document.body}`, 'utf8');
}

console.log(
  `Synchronized ${fetchedDocuments.length} canonical documents from ${repository}@${version} (${commit}).`,
);
