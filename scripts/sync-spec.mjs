import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const repository = 'harness-operations/specification';
const releaseFile = resolve('SPEC_RELEASE.json');
const outputDirectory = resolve('src/content/docs');
const dataDirectory = resolve('src/data');
const publicSystemsDirectory = resolve('public/systems');
const publicDataDirectory = resolve('public/data');

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

async function fetchText(source) {
  const sourceUrl = `https://raw.githubusercontent.com/${repository}/${commit}/${source}`;
  const response = await fetch(sourceUrl, {
    headers: { 'user-agent': 'harness-operations-website-build' },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${source} from ${version} (${commit}): ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

function stripLeadingTitle(body) {
  return body.replace(/^#\s+[^\n]+\n+/, '');
}

function titleFromMarkdown(body, fallback) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

const staleGenerated = [
  resolve(outputDirectory, 'landscape.md'),
  resolve(outputDirectory, 'standards.md'),
  resolve(outputDirectory, 'systems'),
  resolve(outputDirectory, 'apply/example.md'),
  resolve(outputDirectory, 'apply/patterns'),
  resolve(outputDirectory, 'apply/mappings'),
  resolve(outputDirectory, 'apply/comparison-methodology.md'),
  resolve(outputDirectory, 'apply/external-validation.md'),
  resolve(dataDirectory, 'landscape.json'),
  resolve(dataDirectory, 'systems.json'),
  resolve(dataDirectory, 'systems-index.json'),
  resolve(publicSystemsDirectory, 'index.json'),
  resolve(publicDataDirectory, 'systems.json'),
];
for (const path of staleGenerated) {
  await rm(path, { recursive: true, force: true });
}

const systemsIndexBody = await fetchText('systems/index.json');
const systemsIndex = JSON.parse(systemsIndexBody);
const systemSources = [
  'systems/README.md',
  'systems/TEMPLATE.md',
  'systems/operating-arrangements.md',
  ...systemsIndex.subjects.map((subject) => subject.document_path),
];
const uniqueSystemSources = [...new Set(systemSources)];

const staticDocuments = [
  ['reference/overview.md', 'overview.md', 'Overview', 'What Harness Operations is and where the operational problem begins.'],
  ['reference/principles.md', 'principles.md', 'Principles', 'Design principles for operating heterogeneous Harness systems.'],
  ['reference/model.md', 'model.md', 'Reference Model', 'Deeper conceptual vocabulary for definition, execution, evidence, and governance.'],
  ['reference/governance.md', 'governance.md', 'Governance', 'Authority, policy, delegation, approvals, exceptions, limits, and accountability.'],
  ['reference/standards.md', 'standards.md', 'Standards and Boundaries', 'Boundaries with MCP, ACP, A2A, Code Mode, telemetry, and adjacent standards.'],
  ['reference/terminology.md', 'terminology.md', 'Scope and Terminology', 'Shared scope and vocabulary for the descriptive Reference Model.'],
  ['examples/approved-artifact-handoff/README.md', 'apply/example.md', 'Approved artifact handoff', 'Executable example for approval, enforcement, uncertainty, and evidence.'],
  ['patterns/approval-valid-at-execution-time.md', 'apply/patterns/approval-valid-at-execution-time.md', 'Approval valid at execution time', 'Bind approval to the material action and revalidate at the enforcement boundary.'],
  ['patterns/stop-revoke-and-recover.md', 'apply/patterns/stop-revoke-and-recover.md', 'Stop, revoke, and recover', 'Treat interruption, revocation, side effects, and uncertain outcomes as distinct operational facts.'],
  ['patterns/model-informed-decisions.md', 'apply/patterns/model-informed-decisions.md', 'Model-informed decisions, code-enforced consequences', 'Keep model judgment, policy, authority, and enforcement distinct.'],
  ['comparisons/methodology.md', 'apply/comparison-methodology.md', 'Comparison methodology', 'How capability, evidence, freshness, scope, and interoperability claims are classified.'],
  ['reviews/v0.3-status.md', 'apply/external-validation.md', 'External validation status', 'Historical status of independent review and reproduction for the earlier applied work.'],
].map(([source, target, title, description]) => ({ source, target, title, description }));

const systemDocuments = uniqueSystemSources.map((source) => ({
  source,
  target:
    source === 'systems/README.md'
      ? 'systems/index.md'
      : source === 'systems/TEMPLATE.md'
        ? 'systems/template.md'
        : source,
  title: null,
  description:
    source === 'systems/README.md'
      ? 'Canonical concrete reference for Harnesses and adjacent systems.'
      : source === 'systems/TEMPLATE.md'
        ? 'Authoring contract for evidence-backed Systems reference entries.'
        : source === 'systems/operating-arrangements.md'
          ? 'Recurring ways Harnesses and adjacent systems operate independently and together.'
          : 'Evidence-backed Systems reference entry from the canonical specification.',
}));

const documents = [...staticDocuments, ...systemDocuments];

const fetchedDocuments = await Promise.all(
  documents.map(async (document) => {
    const body = await fetchText(document.source);
    return {
      ...document,
      title: document.title ?? titleFromMarkdown(body, document.source),
      body,
    };
  }),
);

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

  const targetPath = resolve(outputDirectory, document.target);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${frontmatter}${stripLeadingTitle(document.body)}`, 'utf8');
}

const comparisonBody = await fetchText('comparisons/data/systems.json');
const comparison = JSON.parse(comparisonBody);

await mkdir(dataDirectory, { recursive: true });
await writeFile(resolve(dataDirectory, 'systems.json'), JSON.stringify(comparison, null, 2) + '\n', 'utf8');
await writeFile(
  resolve(dataDirectory, 'systems-index.json'),
  JSON.stringify(systemsIndex, null, 2) + '\n',
  'utf8',
);

await mkdir(publicSystemsDirectory, { recursive: true });
await mkdir(publicDataDirectory, { recursive: true });
await writeFile(resolve(publicSystemsDirectory, 'index.json'), systemsIndexBody, 'utf8');
await writeFile(resolve(publicDataDirectory, 'systems.json'), comparisonBody, 'utf8');

console.log(
  `Synchronized ${fetchedDocuments.length} canonical documents, ${systemsIndex.subjects.length} Systems subjects, and ${comparison.observations.length} comparison observations from ${repository}@${version} (${commit}).`,
);
