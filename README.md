# Academic Static Modern (no Hugo/Jekyll)

A clean, modern academic website built with plain HTML/CSS/JS.
- No build system
- Responsive
- Dark-mode friendly
- Publications list rendered from `/assets/js/pubs.json` with search + status filter

## Edit content
- Edit profile and section copy in the HTML files.
- Update the portrait in `assets/img/` and the CV at `assets/cv.pdf`.
- Edit publication data in `assets/js/pubs.json`.
- Keep the pre-rendered publication cards in `index.html` and `papers/index.html` in sync with the JSON. The static cards make the research readable to search crawlers and remain as a fallback when JavaScript is unavailable; JavaScript progressively enhances them with search and filtering.

## SEO and Google Search Console

- The canonical site URL is `https://jiaweizhang1.com/` (HTTPS, without `www`). Keep canonical links, internal links, the CV, and external profiles consistent with it.
- `robots.txt` advertises `sitemap.xml`. Update a page's `<lastmod>` date in the sitemap only after a meaningful content change.
- Keep page titles and descriptions unique and keep the homepage `ProfilePage`/`Person` JSON-LD accurate, especially affiliations, research areas, ORCID, and profile links.
- The archived `papers/jmp.html` route is intentionally marked `noindex` until it is replaced with a complete, current paper page.
- In Google Search Console, add a Domain property for `jiaweizhang1.com`, verify it with the DNS record Google provides, submit `https://jiaweizhang1.com/sitemap.xml`, and inspect/request indexing for `/` and `/papers/` after deployment.

## Local preview
Python:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Deploy
GitHub Pages: push this folder as your repo root, then enable Pages (deploy from `main` / root).
