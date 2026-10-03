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
- RSVP copy and flow

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

## RSVP architecture

The site now supports a custom RSVP flow:

- guest enters their own name
- site finds the household tied to that guest
- guest responds for each invited person
- dietary restrictions are collected only for attending guests

## GitHub Pages + backend

You can keep the website on **GitHub Pages**, but the RSVP flow still needs a backend for:

- guest lookup
- response validation
- writing RSVP submissions

This repo includes a Supabase-oriented scaffold under `supabase/`.

## Local demo mode

Without a configured API, the RSVP UI runs in demo mode with sample guest names:

- `Jeff Smith`
- `Casey Smith`
- `Avery Taylor`

To force demo mode:

```bash
cp .env.example .env
```

Then set:

```
VITE_RSVP_USE_MOCK=true
```

## Connect the real backend

Create a `.env` file and set:

```
VITE_RSVP_API_BASE_URL=https://<your-project-ref>.functions.supabase.co
VITE_RSVP_USE_MOCK=false
```

The frontend expects these endpoints:

- `POST /rsvp-lookup`
- `POST /rsvp-submit`

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Replace the sample guests and households with your real guest list.
4. Deploy the Edge Functions in:
   - `supabase/functions/rsvp-lookup`
   - `supabase/functions/rsvp-submit`
5. Point `VITE_RSVP_API_BASE_URL` at your Supabase Functions base URL.

### Exporting RSVPs

The schema creates a readable export view at `public.rsvp_export_readable`.

For a CSV-friendly export after guests have replied, run:

```sql
select *
from public.rsvp_export_readable
order by household_name, guest_sort_order, submitted_guest_name;
```

That result includes the invited guest name, the submitted guest name, a readable `Attending` or `Declined` response, dietary restrictions, confirmation code, and submission timestamp.

## Important constraint with name-only RSVP

Because you want guest-name lookup, every invited guest name in your guest list needs to be unique after normalization.

Examples that would conflict:

- `Jeff Smith`
- `jeff smith`

If you have duplicate guest names, a pure name-only lookup cannot tell those guests apart safely.

- The practical fix is invite codes
- Or a second required field like email or ZIP code

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
