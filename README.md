# Katakana Quest

A tiny, browser-only site for katakana, Japanese listening, and everyday kanji practice.

The N4 listening tab picks 10 audio-only Japanese phrases each day from a curated bank of 120 everyday sentences. Each local calendar day has a saved random set: refreshing or practising again keeps the same ten. New daily sets avoid previously selected phrases until the bank is exhausted, then begin a new shuffled cycle. The day changes automatically, including in an open tab.

Audio uses your browser's Japanese speech voice, so no microphone or account is needed. Compare your English translation with a suggested meaning, then mark it as understood or save it for audio replay in the review list. Saved phrases remain there across days until you mark them understood or reset progress. Progress and selection history are saved on the current browser and device.

Everyday kanji introduces unseen signs or kanji words from a bank of 120 useful entries found around Japan. Answer ten new signs to earn the daily reward, then keep going with no daily cap. Translate the displayed sign into English; its reading is revealed after answering, or earlier if you request a hint. New signs never repeat. When the bank is exhausted, new practice stops instead of recycling signs; saved misses remain available for retests.

The “Need a hint?” button works in both new practice and retests. It reveals a sign-specific clue first, the kana reading second, and the English meaning last. Hints preserve any translation being typed and do not advance progress. Revealed hint levels persist across reloads for the current question. Clues and readings do not penalise correct answers, but checking an answer after revealing its meaning saves the sign for another retest, even if you type it correctly. Daily summaries count correct answers without full meaning reveals; completing ten new signs still earns the usual kanji stamp.

Missed kanji are saved and automatically retested before new practice when you next open the category, reload and return, or start a new day. Each review round asks every saved sign once, hiding readings and meanings until you answer or request hints. Correct review answers without a meaning reveal remove the sign from the pending list; another miss or full reveal keeps it for your next visit. A fresh review round starts with hints hidden again. Review rounds resume across reloads, and do not consume new signs, count towards the ten new daily signs, or award extra calendar stamps.

Kanji history and review have separate browser storage and survive the katakana/listening reset. Clearing browser data or using another browser removes access to that history, so the never-repeat rule applies within the saved browser profile. Individual characters may appear in different words; each complete sign or word is one quiz entry.

The sign bank covers the everyday sign vocabulary illustrated by the Japan Foundation's [Irodori word lists](https://www.irodori.jpf.go.jp/en/resources.html) and railway terminology used by [JR Central](https://global.jr-central.co.jp/en/tickets/type/combinations.html).

The calendar awards separate stamps: coral カ for completing 10 correct katakana words, teal ♪ for completing all 10 listening translations, and gold 漢 for answering at least 10 new kanji signs. Once you answer more than ten new signs on a date, its kanji stamp includes your total correct answers that day (for example, “漢 17”). Wrong answers and full meaning reveals do not count as correct; clues and reading hints are allowed. Retests do not inflate this score. The accessible calendar label also states the correct count and total attempted. Scores update as you continue and are archived across reloads and local-day rollover. Older stamps without surviving answers keep their plain symbol rather than inventing a score. A date can hold all three stamps. The calendar badge and total count category stamps, not extra answers. Replaying a listening set preserves its earned stamp without adding another.

Listening and kanji completions are archived by local date, so stamps remain after a new daily set arrives. Existing saved katakana completions and any completed listening/kanji daily sessions still in storage are backfilled. Earlier sessions that were already replaced before this feature cannot be reconstructed. Resetting katakana/listening clears their stamps; kanji stamps remain with the protected kanji history.

## Play online

<https://maxbye.co/japanese/>

## Run locally

From this folder, run:

```bash
python3 -m http.server
```

Then open <http://localhost:8000>.

Progress is stored in `localStorage` on the current browser and device. A word is reserved as soon as it appears, so refreshing the page or answering incorrectly will never serve that word again.
Missed katakana words and the answers you typed stay in the review list until you reset progress. Kanji misses and checked, fully revealed answers stay pending until you answer them correctly in a retest without revealing the meaning.

## Check daily practice

Run `node --test tests/*.test.cjs` to check daily selection, saved progress, rollover, retesting, migration, bank exhaustion, no repeats among new kanji, and calendar stamps for all three categories.
