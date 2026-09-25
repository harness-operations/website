import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const repository = 'harness-operations/specification';
const releaseFile = resolve('SPEC_RELEASE.json');
const outputDirectory = resolve('src/content/docs');
const dataDirectory = resolve('src/data');

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
  ['examples/approved-artifact-handoff/README.md', 'apply/example.md', 'Approved artifact handoff', 'Executable example for approval, enforcement, uncertainty, and evidence.'],
  ['patterns/approval-valid-at-execution-time.md', 'apply/patterns/approval-valid-at-execution-time.md', 'Approval valid at execution time', 'Bind approval to the material action and revalidate at the enforcement boundary.'],
  ['patterns/stop-revoke-and-recover.md', 'apply/patterns/stop-revoke-and-recover.md', 'Stop, revoke, and recover', 'Treat interruption, revocation, side effects, and uncertain outcomes as distinct operational facts.'],
  ['patterns/model-informed-decisions.md', 'apply/patterns/model-informed-decisions.md', 'Model-informed decisions, code-enforced consequences', 'Keep model judgment, policy, authority, and enforcement distinct.'],
  ['mappings/codex-app-server-0.157.0.md', 'apply/mappings/codex-app-server.md', 'Codex App Server 0.157.0', 'Version-scoped Harness Operations mapping for OpenAI Codex App Server.'],
  ['mappings/claude-code-cli-2.1.282.md', 'apply/mappings/claude-code-cli.md', 'Claude Code CLI 2.1.282', 'Version-scoped Harness Operations mapping for Anthropic Claude Code CLI.'],
  ['comparisons/methodology.md', 'apply/comparison-methodology.md', 'Comparison methodology', 'How capability, evidence, freshness, scope, and interoperability claims are classified.'],
  ['reviews/v0.3-status.md', 'apply/external-validation.md', 'External validation status', 'What v0.3 does and does not claim about independent review and reproduction.'],
].map(([source, target, title, description]) => ({ source, target, title, description }));

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

const fetchedDocuments = await Promise.all(
  documents.map(async (document) => ({ ...document, body: await fetchText(document.source) })),
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
  await writeFile(targetPath, `${frontmatter}${document.body}`, 'utf8');
}

const landscapeBody = await fetchText('comparisons/data/landscape.json');
const landscape = JSON.parse(landscapeBody);
if (landscape.reference_model !== version) {
  throw new Error(
    `Comparison dataset references ${landscape.reference_model}; website is pinned to ${version}`,
  );
}
await mkdir(dataDirectory, { recursive: true });
await writeFile(resolve(dataDirectory, 'landscape.json'), JSON.stringify(landscape, null, 2) + '\n', 'utf8');

console.log(
  `Synchronized ${fetchedDocuments.length} canonical documents and ${landscape.observations.length} comparison observations from ${repository}@${version} (${commit}).`,
);
