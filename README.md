# Harness Operations Website

Documentation-first publication site for the Harness Operations Reference Model.

Canonical reference content lives in [`harness-operations/specification`](https://github.com/harness-operations/specification). Reference Model 0.1 is published at tag [`v0.1`](https://github.com/harness-operations/specification/releases/tag/v0.1).

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Build the static production site with:

```bash
npm run build
npm run preview
```

The current navigation pages are bootstrap placeholders only. Website issue #3 will replace them at build time with canonical Markdown synchronized from `harness-operations/specification@v0.1`.
