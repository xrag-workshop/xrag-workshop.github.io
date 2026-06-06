# XRAG '26 Website

Static website for **XRAG '26 — Agentic AI for Extended Reality**, a proposed IEEE ISMAR 2026 workshop in Bari, Italy.

All content is driven by a single JSON file. **You do not need to touch HTML or CSS to update the workshop info.** Just edit `data.json` and refresh.

Layout uses **Bootstrap 5** (loaded from jsDelivr CDN), so the site is fully responsive on phones, tablets, and desktop without any build step.

## Files

| File          | Purpose                                                    |
|---------------|------------------------------------------------------------|
| `index.html`  | Single-page layout (Bootstrap 5 grid + anchored sections)  |
| `styles.css`  | Theme layer on top of Bootstrap (banner palette: cream / brown / blue / red / yellow) |
| `app.js`      | Loads `data.json` and renders all sections                 |
| `data.json`   | **All editable content** — workshop info, dates, people, etc. |
| `assets/`     | Banner image and organizer photos                          |

## Editing content

Open `data.json` and change the field you need. The file is grouped by section so it's easy to find:

| Section in JSON          | Where it appears on the page              |
|--------------------------|-------------------------------------------|
| `workshop`               | Title, dates, venue, banner image path    |
| `nav`                    | Top navigation links                      |
| `hero`                   | Hero blurb and CTA buttons                |
| `about`                  | Workshop thesis + 4 pillar cards          |
| `topics`                 | Topic chips                               |
| `callForPapers`          | CfP categories, review criteria, publication |
| `importantDates`         | Timeline of dates                         |
| `submission`             | Format, templates, submission URL, notes  |
| `program`                | Half-day agenda                           |
| `organizers.members`     | Organizer cards (name, affiliation, email, image) |
| `committee.members`      | Program committee list (name, affiliation) |
| `sponsors.items`         | Institutional logos / links               |
| `contact`                | Contact email                             |
| `footer`                 | Footer text and links                     |

### Adding an organizer

```json
"organizers": {
  "members": [
    {
      "name": "Your Name",
      "affiliation": "Your University, Country",
      "email": "you@example.com",
      "image": "assets/organizers/your-photo.jpg",
      "website": "https://your-site.example.com"
    }
  ]
}
```

Drop the photo into `assets/organizers/` and reference it by relative path. Any image format works (jpg, png, svg, webp).

### Adding a committee member

```json
"committee": {
  "members": [
    { "name": "Jane Doe", "affiliation": "Some University" }
  ]
}
```

### Adding a date

```json
"importantDates": {
  "items": [
    { "date": "Sept 1, 2026", "title": "Camera-ready", "text": "Final PDF due." }
  ]
}
```

### Changing the banner image

Save your banner image as `assets/banner.png` (or any path) and update `workshop.bannerImage` in `data.json`. If the file is missing the banner area is hidden automatically.

## Local preview

`index.html` fetches `data.json` over HTTP, so you must serve the folder — opening the file directly with `file://` will fail.

```powershell
cd website
python -m http.server 8000
```

Then visit <http://localhost:8000>.

Any static server works (`npx serve`, VS Code Live Server, etc.).

## GitHub Pages deployment

Two options:

### Option A — Serve from `/website` on `main`

1. Repository **Settings → Pages**.
2. **Source**: *Deploy from a branch*.
3. **Branch**: `main`, **Folder**: `/website`.
4. Save. The site will appear at `https://<user>.github.io/<repo>/`.

### Option B — GitHub Actions

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy XRAG website
on:
  push:
    branches: [main]
permissions:
  pages: write
  id-token: write
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./website
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in **Settings → Pages**, set **Source** to *GitHub Actions*.

## Theming

Colors live in CSS variables at the top of `styles.css`:

```css
:root {
  --cream:    #fbedd3;   /* page background  */
  --ink:      #3d2718;   /* primary text     */
  --blue:     #4a95cc;   /* blue accent      */
  --red:      #e55b4a;   /* red accent       */
  --yellow:   #f4c447;   /* yellow accent    */
  --orange:   #e89146;   /* orange accent    */
}
```

Tweak there to retheme everything.
