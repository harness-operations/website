# Harness Operations Website

Documentation-first publication site for Harness Operations.

Canonical reference content lives in [`harness-operations/specification`](https://github.com/harness-operations/specification). The exact immutable specification release rendered by the site is recorded in [`SPEC_RELEASE.json`](SPEC_RELEASE.json).

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

`npm run dev` validates the release pin and synchronizes canonical Markdown/data from the exact specification commit before starting Astro.

Build the static production site with:

```bash
npm run build
npm run preview
```

Production builds fail if the pinned tag does not resolve to the pinned commit or if required canonical content cannot be fetched. Generated reference pages/data are ignored by Git; substantive reference prose and evidence remain owned by the `specification` repository.

## Deployment

The site deploys as a static GitHub Pages artifact from `main` using [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

The canonical production domain is `https://harness-operations.com`.

## Publishing a specification release

1. Publish the immutable tag/GitHub release in `harness-operations/specification`.
2. Promote that exact tag into `SPEC_RELEASE.json` on a review branch.
3. Let CI validate the pinned release, synchronize the canonical content/data, build the site, and run browser smoke tests.
4. Merge the promotion PR to `main`; the Pages workflow deploys that exact release.

The website package version is independent from the specification release version. The release pin—not `package.json`—is the publication identity.
