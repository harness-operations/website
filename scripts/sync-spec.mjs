import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const repository = 'harness-operations/specification';
const versionFile = resolve('SPEC_VERSION');
const outputDirectory = resolve('src/content/docs');

const version = (process.env.SPEC_VERSION || (await readFile(versionFile, 'utf8'))).trim();

if (!/^v\d+\.\d+(?:\.\d+)?$/.test(version)) {
  throw new Error(`Invalid specification version: ${version}`);
}

const documents = [
  {
    source: 'reference/overview.md',
    target: 'overview.md',
    title: 'Overview',
    description: 'What Harness Operations is and where the operational problem begins.',
  },
  {
    source: 'reference/principles.md',
    target: 'principles.md',
    title: 'Principles',
    description: 'Design principles for operating heterogeneous harness systems.',
  },
  {
    source: 'reference/model.md',
    target: 'model.md',
    title: 'Reference Model',
    description: 'Core concepts and relationships in the Harness Operations Reference Model.',
  },
  {
    source: 'reference/governance.md',
    target: 'governance.md',
    title: 'Governance',
    description: 'Authority, policy, delegation, approvals, exceptions, limits, and accountability.',
  },
  {
    source: 'reference/landscape.md',
    target: 'landscape.md',
    title: 'Standards Landscape',
    description: 'Interoperability boundaries with existing standards and adjacent disciplines.',
  },
  {
    source: 'reference/terminology.md',
    target: 'terminology.md',
    title: 'Scope and Terminology',
    description: 'Shared scope, boundaries, and vocabulary for the reference model.',
  },
];

function yamlString(value) {
  return JSON.stringify(value);
}

async function fetchDocument(document) {
  const sourceUrl = `https://raw.githubusercontent.com/${repository}/${version}/${document.source}`;
  const response = await fetch(sourceUrl, {
    headers: {
      'user-agent': 'harness-operations-website-build',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${document.source} from ${version}: ${response.status} ${response.statusText}`);
  }

  return {
    ...document,
    body: await response.text(),
  };
}

const fetchedDocuments = await Promise.all(documents.map(fetchDocument));
await mkdir(outputDirectory, { recursive: true });

for (const document of fetchedDocuments) {
  const editUrl = `https://github.com/${repository}/blob/${version}/${document.source}`;
  const frontmatter = [
    '---',
    `title: ${yamlString(document.title)}`,
    `description: ${yamlString(document.description)}`,
    `editUrl: ${yamlString(editUrl)}`,
    '---',
    '',
  ].join('\n');

  // The canonical Markdown body is written exactly as fetched. The website adds
  // presentation metadata only; it does not rewrite reference-model prose.
  await writeFile(resolve(outputDirectory, document.target), `${frontmatter}${document.body}`, 'utf8');
}

console.log(`Synchronized ${fetchedDocuments.length} canonical documents from ${repository}@${version}.`);
