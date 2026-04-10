# Wedding Site

A simple static wedding website you can customize and deploy quickly.

## Files

- `index.html` - the page content
- `styles.css` - the styling

## Customize

Search for and replace these placeholders:

- `Emma & Noah`
- `Saturday, September 19, 2026`
- `Austin, Texas`
- venue name and address
- hotel block details
- registry links
- RSVP email or form link

You can also replace the hero background image in `styles.css` with your own photo.

## Local preview

Because this is a plain static site, you can preview it by opening `index.html` in a browser.

## Deploy recommendation

I recommend **Azure Static Web Apps** if you already know Azure.

Why:
- dead simple for static HTML/CSS sites
- cheap or free for small personal sites
- automatic deploys from GitHub
- custom domain support when you're ready

## Deploy to Azure Static Web Apps

1. Put this folder in a GitHub repo.
2. In Azure, create a **Static Web App**.
3. Connect it to your GitHub repo.
4. Use these build settings:
   - **App location:** `/wedding-site`
   - **Output location:** `.`
   - **Build preset:** Custom
5. Finish setup and let Azure deploy it.

Because this site is plain HTML/CSS, there is no build step needed.

## Other good hosting options

- **Netlify**: probably the easiest overall
- **Cloudflare Pages**: fast and inexpensive
- **GitHub Pages**: very simple, but a little less polished for custom workflows

If you want, the next thing I can do is:

1. personalize this with your names, story, colors, and schedule
2. add an RSVP form
3. make it look more elegant, modern, playful, or minimal
