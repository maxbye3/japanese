# Katakana Quest

A tiny, browser-only site for katakana, Japanese listening, and everyday kanji practice.

The N4 listening tab picks 10 audio-only Japanese phrases each day from a curated bank of 120 everyday sentences. Each local calendar day has a saved random set: refreshing or practising again keeps the same ten. New daily sets avoid previously selected phrases until the bank is exhausted, then begin a new shuffled cycle. The day changes automatically, including in an open tab.

Audio uses your browser's Japanese speech voice, so no microphone or account is needed. Compare your English translation with a suggested meaning, then mark it as understood or save it for audio replay in the review list. Saved phrases remain there across days until you mark them understood or reset progress. Progress and selection history are saved on the current browser and device.

Everyday kanji introduces up to 10 unseen signs or kanji words each day from a bank of 120 useful entries found around Japan. Translate the displayed sign into English; its reading is revealed after answering. Missed signs stay in review. Each entry is reserved when first shown, and never becomes a new quiz question again. Refreshing resumes an unfinished question or its answer feedback. When the bank is exhausted, the quiz stops instead of recycling signs.

Kanji history and review have separate browser storage and survive the katakana/listening reset. Clearing browser data or using another browser removes access to that history, so the never-repeat rule applies within the saved browser profile. Individual characters may appear in different words; each complete sign or word is one quiz entry.

The sign bank covers the everyday sign vocabulary illustrated by the Japan Foundation's [Irodori word lists](https://www.irodori.jpf.go.jp/en/resources.html) and railway terminology used by [JR Central](https://global.jr-central.co.jp/en/tickets/type/combinations.html).

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

## Check daily practice

Run `node --test tests/*.test.cjs` to check daily selection, saved progress, rollover, review, migration, bank exhaustion, and permanent kanji non-repetition.
