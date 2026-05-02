# Wedding Site

A React + Vite wedding website you can customize and deploy quickly.

## Project structure

- `index.html` - Vite entry HTML
- `src/App.jsx` - main page structure and content
- `src/main.jsx` - React app bootstrap
- `src/styles.css` - the active stylesheet for the site

## Customize

Update content in `src/App.jsx`, including:

- names
- date and location
- story and schedule details
- travel notes
- registry links
- RSVP destination

Update presentation in `src/styles.css`, including colors, spacing, typography, and layout.

## Local preview

Install dependencies and run the Vite dev server:

```bash
npm install
npm run dev
```

To preview the production build locally:

```bash
npm run build
npm run preview
```

## Deploy recommendation

I recommend **Azure Static Web Apps** if you already know Azure.

Why:
- works well with Vite apps
- cheap or free for small personal sites
- automatic deploys from GitHub
- custom domain support when you're ready

## Deploy to Azure Static Web Apps

1. Put this folder in a GitHub repo.
2. In Azure, create a **Static Web App**.
3. Connect it to your GitHub repo.
4. Use these build settings:
   - **App location:** `/wedding-site`
   - **Output location:** `dist`
   - **Build preset:** `Vite`
5. Finish setup and let Azure deploy it.

## Other good hosting options

- **Netlify**: probably the easiest overall
- **Cloudflare Pages**: fast and inexpensive
- **GitHub Pages**: simple for user/org pages; for project pages under `/<repo>/`, set Vite's `base` to match the repo path
- **Vercel**: also a solid fit for Vite projects
