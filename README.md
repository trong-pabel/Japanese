# Japanese (Vite + React + TypeScript)

This project is configured for deployment to GitHub Pages at:

https://<username>.github.io/Japanese/

------------------------------------------------------------
Local Development
------------------------------------------------------------

This project uses npm as the package manager.

Install dependencies:

npm install

Start development server:

npm run dev

Open the local URL shown in the terminal (usually):

http://localhost:5173/

------------------------------------------------------------
Production Build (Local Test)
------------------------------------------------------------

Build the production version:

npm run build

The production output is generated in:

dist/

Preview the production build locally:

npm run preview

------------------------------------------------------------
GitHub Pages Deployment
------------------------------------------------------------

Deployment runs automatically on push to the main branch.

The workflow file:

.github/workflows/deploy-pages.yml

It will:

1. Check out code.
2. Set up Node.js.
3. Install dependencies using npm ci.
4. Build the site.
5. Upload dist/ as the Pages artifact.
6. Deploy using official GitHub Pages actions.

------------------------------------------------------------
One-time GitHub Setup
------------------------------------------------------------

1. Open your repository on GitHub.
2. Go to Settings → Pages.
3. Under Build and deployment, set:

   Source → GitHub Actions

4. Push to main (or trigger workflow manually from the Actions tab).
5. Wait for the Deploy to GitHub Pages workflow to complete.

------------------------------------------------------------
Deployed URL
------------------------------------------------------------

After successful deployment, your site will be available at:

https://<username>.github.io/Japanese/

You can find the live URL in:

- Settings → Pages
- or Actions → Deploy to GitHub Pages → deploy job output

------------------------------------------------------------
Troubleshooting
------------------------------------------------------------

Blank page after deploy is usually caused by base path mismatch.

Verify vite.config.ts contains:

export default defineConfig({
  base: process.env.NODE_ENV === 'production'
    ? '/Japanese/'
    : '/',
})

If you change base, rebuild and redeploy.

------------------------------------------------------------

If deployment fails, check:

1. Repository Actions are enabled.
2. Pages source is set to GitHub Actions.
3. Workflow permissions include:

permissions:
  pages: write
  id-token: write
