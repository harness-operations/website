const appliedRoutes = new Map([
  ['../examples/approved-artifact-handoff/README.md', '/apply/example/'],
  ['../mappings/codex-app-server-0.157.0.md', '/apply/mappings/codex-app-server/'],
  ['../mappings/claude-code-cli-2.1.282.md', '/apply/mappings/claude-code-cli/'],
  ['approval-valid-at-execution-time.md', '/apply/patterns/approval-valid-at-execution-time/'],
  ['stop-revoke-and-recover.md', '/apply/patterns/stop-revoke-and-recover/'],
  ['model-informed-decisions.md', '/apply/patterns/model-informed-decisions/'],
]);

export function remarkSpecLinks() {
  return function transform(tree) {
    walk(tree);
  };
}

function walk(node) {
  if (!node || typeof node !== 'object') return;

  if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
    const [base, fragment = ''] = node.url.split('#', 2);
    const appliedRoute = appliedRoutes.get(base);
    if (appliedRoute) {
      node.url = fragment ? `${appliedRoute}#${fragment}` : appliedRoute;
    } else {
      const match = node.url.match(/^(?:\.\/)?([A-Za-z0-9_-]+)\.md(#[^\s]*)?$/);
      if (match) {
        const [, slug, hash = ''] = match;
        node.url = `/${slug}/${hash}`;
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}
