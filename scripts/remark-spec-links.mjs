export function remarkSpecLinks() {
  return function transform(tree) {
    walk(tree);
  };
}

function walk(node) {
  if (!node || typeof node !== 'object') return;

  if ((node.type === 'link' || node.type === 'definition') && typeof node.url === 'string') {
    const match = node.url.match(/^(?:\.\/)?([A-Za-z0-9_-]+)\.md(#[^\s]*)?$/);

    if (match) {
      const [, slug, fragment = ''] = match;
      node.url = `/${slug}/${fragment}`;
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child);
  }
}
