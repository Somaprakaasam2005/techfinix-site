# Techfinix'25 — Static Site Scaffold

This folder contains a minimal static scaffold for the "Techfinix'25" college symposium website. It uses Tailwind CSS via CDN and includes basic interactivity (countdown, lightbox, back-to-top).

Files:
- `index.html` — main page with sections: hero, about, events, venue, speakers, gallery, registration, footer.
- `assets/styles.css` — small custom CSS.
- `assets/script.js` — countdown, lightbox, simple form handler.

How to run locally
1. Open `g:/TECHFINEX/techfinix-site/index.html` in your browser. No build is required (Tailwind is loaded from CDN).

Notes and next steps

Serverless registration (Netlify Functions)

This scaffold includes a simple Netlify Functions template at `functions/register.js`. When deployed to Netlify with Functions enabled the front-end form will POST JSON to `/.netlify/functions/register` and the function will return a JSON acknowledgement.

How to enable on Netlify:
- Create a new site on Netlify and link the repo or drag-and-drop the `techfinix-site` folder.
- Netlify will auto-detect the `functions/` folder for serverless functions. Alternatively, configure `netlify.toml` to point to `functions = "functions"`.
- Deploy. The registration endpoint will be available at `https://<your-site>.netlify.app/.netlify/functions/register`.

Local testing:
- Option 1 (quick): keep using the static preview — the form will attempt to POST to `/.netlify/functions/register` which will 404 locally. You can still see the frontend behaviour (validation, UI messages).
- Option 2 (recommended): install the Netlify CLI and run functions locally:

```powershell
# install netlify-cli (one-time)
npm install -g netlify-cli

# from inside the project folder
netlify dev
```

The CLI will serve the static files and run the function on localhost so you can test end-to-end.

Next steps for production:
- Replace the console.log in the function with a real integration: write to a database, append to Google Sheets, or send an email (SendGrid / Mailgun) upon registration.
- Add CAPTCHA or rate-limiting to prevent spam.

Design choices
- Theme colors: Royal Blue `#0047AB` and Gold `#FFD700`.
- Font: Poppins via Google Fonts.
- Animations: AOS for scroll animations, Feather icons for icons.
