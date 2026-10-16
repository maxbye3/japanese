# Katakana Quest

A tiny, browser-only katakana and Japanese listening practice site.

The N4 listening tab has five audio-only Japanese phrases to translate into English. It uses your browser's Japanese speech voice, so no microphone or account is needed. Compare your translation with a suggested meaning, then mark it as understood or save it for audio replay in the review list. Saved phrases remain there across practice rounds until you mark them understood or reset progress.

## Play online

<https://maxbye.co/japanese/>

## Run locally

From this folder, run:

```bash
python3 -m http.server
```

Then open <http://localhost:8000>.

Progress is stored in `localStorage` on the current browser and device. A word is reserved as soon as it appears, so refreshing the page or answering incorrectly will never serve that word again.
Missed words and the answers you typed stay in the review list until you reset progress.
