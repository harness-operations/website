# Harness Operations Website

Documentation-first publication site for the Harness Operations Reference Model.

Canonical reference content lives in [`harness-operations/specification`](https://github.com/harness-operations/specification). Reference Model 0.1 is published at tag [`v0.1`](https://github.com/harness-operations/specification/releases/tag/v0.1).

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

`npm run dev` synchronizes canonical reference Markdown from the version pinned in [`SPEC_VERSION`](SPEC_VERSION) before starting Astro.

Build the static production site with:

```bash
npm run build
npm run preview
```

Production builds fail if the pinned specification release or any required canonical document cannot be resolved. Generated reference pages are ignored by Git; substantive reference prose remains owned by the `specification` repository.

To prepare a later reference-model release for the website, update `SPEC_VERSION` in a reviewable pull request and verify the resulting build.
