# Katakana Quest

A tiny, browser-only daily katakana practice site.

## Play online

<https://maxbye3.github.io/japanese/>

## Run locally

From this folder, run:

```bash
python3 -m http.server
```

Then open <http://localhost:8000>.

Progress is stored in `localStorage` on the current browser and device. A word is reserved as soon as it appears, so refreshing the page or answering incorrectly will never serve that word again.
