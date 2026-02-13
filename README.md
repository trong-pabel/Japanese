# Japanese (Vite + React + TypeScript)

This project is configured for deployment to GitHub Pages at:

`https://<username>.github.io/Japanese/`

## Local development

This repository contains `bun.lockb`, so Bun is the primary package manager.

```sh
bun install
bun run dev
```

If you prefer npm:

```sh
npm ci
npm run dev
```

## Build locally

```sh
bun run build
```

The production output is generated in `dist/`.

## GitHub Pages deployment (automatic on push to `main`)

The workflow file is:

`.github/workflows/deploy-pages.yml`

It will:

1. Check out code.
2. Set up Node.js.
3. Install dependencies (`bun install` when `bun.lockb` exists, otherwise `npm ci`).
4. Build the site.
5. Upload `dist/` as the Pages artifact.
6. Deploy using official GitHub Pages actions.

## One-time GitHub setup

1. Open your repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main` (or trigger the workflow manually from the `Actions` tab).
5. Wait for the `Deploy to GitHub Pages` workflow to complete.

## Where to find the deployed URL

Use either location:

1. `Settings` -> `Pages` (shows the live site link).
2. `Actions` -> `Deploy to GitHub Pages` -> `deploy` job output (`page_url`).

Expected pattern:

`https://<username>.github.io/Japanese/`

## Troubleshooting

Blank page after deploy is usually a base path mismatch.

1. Verify `vite.config.ts` uses `base: "/Japanese/"` for production builds.
2. Verify router basename uses `import.meta.env.BASE_URL` in `src/App.tsx`.
3. Rebuild/redeploy after any base-path change.

If workflow deployment fails:

1. Confirm repository `Actions` are enabled.
2. Confirm Pages source is `GitHub Actions`.
3. Confirm workflow permissions include `pages: write` and `id-token: write`.
