const systemFiles = new Set([
  'antares-cli.md',
  'antares-models.md',
  'anthropic-claude-code.md',
  'background-execution.md',
  'browser-use.md',
  'cisco-foundry-security-spec.md',
  'claude-projects.md',
  'coding-harnesses.md',
  'computer-use.md',
  'firered-openstoryline.md',
  'openai-codex.md',
  'operating-arrangements.md',
  'playwright-test-agents.md',
  'realtime-voice.md',
  'agent-evaluation.md',
  'TEMPLATE.md',
]);

const routeMap = new Map([
  ['../examples/approved-artifact-handoff/README.md', '/apply/example/'],
  ['../mappings/codex-app-server-0.157.0.md', '/systems/openai-codex/'],
  ['../mappings/claude-code-cli-2.1.282.md', '/systems/anthropic-claude-code/'],
  ['../reference/standards.md', '/standards/'],
  ['../comparisons/methodology.md', '/apply/comparison-methodology/'],
  ['../comparisons/data/systems.json', '/data/systems.json'],
  ['../systems/README.md', '/systems/'],
  ['systems/README.md', '/systems/'],
  ['index.json', '/systems/index.json'],
  ['../patterns/model-informed-decisions.md', '/apply/patterns/model-informed-decisions/'],
  ['approval-valid-at-execution-time.md', '/apply/patterns/approval-valid-at-execution-time/'],
  ['stop-revoke-and-recover.md', '/apply/patterns/stop-revoke-and-recover/'],
  ['model-informed-decisions.md', '/apply/patterns/model-informed-decisions/'],
]);

for (const file of systemFiles) {
  const slug = file === 'TEMPLATE.md' ? 'template' : file.replace(/\.md$/, '');
  routeMap.set(file, `/systems/${slug}/`);
  routeMap.set(`../systems/${file}`, `/systems/${slug}/`);
}

export function remarkSpecLinks() {
  return function transform(tree) {
    walk(tree);
  };
}

function walk(node) {
  if (!node || typeof node !== 'object') return;

  if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
    const [base, fragment = ''] = node.url.split('#', 2);
    const mapped = routeMap.get(base);
    if (mapped) {
      node.url = fragment ? `${mapped}#${fragment}` : mapped;
    } else {
      const referenceMatch = base.match(/^\.\.\/reference\/([A-Za-z0-9_-]+)\.md$/);
      if (referenceMatch) {
        node.url = `/${referenceMatch[1]}/${fragment ? '#' + fragment : ''}`;
      } else {
        const match = base.match(/^(?:\.\/)?([A-Za-z0-9_-]+)\.md$/);
        if (match) {
          const [, slug] = match;
          node.url = `/${slug}/${fragment ? '#' + fragment : ''}`;
        }
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}
