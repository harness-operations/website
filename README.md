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

## Deployment

The site deploys as a static GitHub Pages artifact from `main` using [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

The canonical production domain is `https://harness-operations.com`, recorded both in Astro's `site` configuration and [`public/CNAME`](public/CNAME).

Repository setup required for the first deployment:

1. Enable **Settings → Pages → Source: GitHub Actions**.
2. Configure the apex domain DNS for GitHub Pages and optionally `www` as the recommended companion CNAME.
3. Enable HTTPS once GitHub has issued the certificate.

## Publishing a later reference-model version

1. Publish the new immutable release/tag in `harness-operations/specification`.
2. Update [`SPEC_VERSION`](SPEC_VERSION) in a website pull request.
3. Let CI prove that the pinned specification resolves and the complete static site builds.
4. Merge the pull request to `main`; the Pages workflow deploys that exact version.

The deployment workflow never falls back from the pinned specification version to `main`.
