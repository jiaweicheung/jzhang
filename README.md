# Academic Static Modern (no Hugo/Jekyll)

A clean, modern academic website built with plain HTML/CSS/JS.
- No build system
- Responsive
- Dark-mode friendly
- Publications list rendered from `/assets/js/pubs.json` with search + status filter

## Edit content
- Replace "Your Name" and affiliation in the HTML files.
- Optional avatar: `assets/img/avatar.jpg`
- Replace placeholder PDFs:
  - `assets/cv.pdf`
  - `assets/papers/*.pdf`
  - `assets/slides/*.pdf`
- Edit publications:
  - `assets/js/pubs.json`

## Local preview
Python:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Deploy
GitHub Pages: push this folder as your repo root, then enable Pages (deploy from `main` / root).
