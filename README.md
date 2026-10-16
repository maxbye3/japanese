# Katakana Quest

A tiny, browser-only katakana and Japanese listening practice site.

The N4 listening tab picks 10 audio-only Japanese phrases each day from a curated bank of 120 everyday sentences. Each local calendar day has a saved random set: refreshing or practising again keeps the same ten. New daily sets avoid previously selected phrases until the bank is exhausted, then begin a new shuffled cycle. The day changes automatically, including in an open tab.

Audio uses your browser's Japanese speech voice, so no microphone or account is needed. Compare your English translation with a suggested meaning, then mark it as understood or save it for audio replay in the review list. Saved phrases remain there across days until you mark them understood or reset progress. Progress and selection history are saved on the current browser and device.

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

## Check daily listening

Run `node --test tests/listening.test.cjs` to check daily selection, saved progress, rollover, review, migration, and bank exhaustion.
