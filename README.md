# Max's Japanese Listening Website

A tiny, browser-only site for katakana, Japanese listening, and everyday kanji practice.

Correct katakana answers automatically show the next unused word, clear and focus the input, and keep a success message identifying the answer just checked. Wrong answers keep their correction on screen until you tap “Next word”. Blank submissions do not advance. The tenth correct answer still finishes the daily quest and awards its stamp rather than introducing another word.

If katakana grading rejects an answer you know was right, choose “I got this right” beside the feedback. It credits the answer once, removes that word from review, and can earn the tenth-answer stamp. The button remains available after Next or a reload until you check another answer or the day changes. Correcting a previous answer preserves the next question and any translation being typed.

After each nonblank katakana or kanji guess is checked, the browser’s Japanese speech voice automatically reads the word aloud, whether the answer was right or wrong. Kanji uses the stored kana reading, including during retests. Blank submissions, hints, moving to the next question, and reloading do not trigger pronunciation. Audio requires browser speech support and a Japanese voice on the device.

The N4 listening tab picks 10 audio-only Japanese phrases each day from a curated bank of 120 everyday sentences. Each new daily set puts saved misses first, most recently missed first, then fills the remaining places with fresh phrases. Reviews count towards the daily ten and its usual stamp. Each set contains ten distinct phrases, even with more than ten saved misses. Fresh selections avoid previously selected phrases until the bank is exhausted, then begin a new shuffled cycle. Each local calendar day has a saved set: refreshing or practising again keeps the same ten, and changes to review do not reroll an existing set. The day changes automatically, including in an open tab.

Audio uses your browser's Japanese speech voice, so no microphone or account is needed. Submit your English translation, or tap “Not sure” to reveal the Japanese and suggested meaning without typing an answer. Replay the audio and tap kanji for their meanings before choosing “Yes, I got it” or “Save for review”. Either choice records your answer and immediately opens the next audio-only phrase, without a separate confirmation or Next button. The tenth answer finishes the set and earns the listening stamp immediately. Reloading resumes at the next unanswered phrase; a new day or restarted set clears the transcript. Saved phrases remain in review across days until you mark them understood or reset progress. Progress and selection history are saved on the current browser and device.

Everyday kanji introduces unseen signs or kanji words from a bank of 120 useful entries found around Japan. Answer ten signs, including reviews, to earn the daily reward, then keep going with no daily cap. Translate the displayed sign into English; its reading is revealed after answering, or earlier if you request a hint. New signs never repeat. When the bank is exhausted, new practice stops instead of recycling signs; saved misses remain available for retests.

If automatic kanji grading rejects an answer you consider correct, choose “I got this right” beside the feedback. The correction remains available on the next question until you check another answer. For a correct answer, use “Mark previous as wrong” to undo its grade. Corrections update the review list and daily correct total without adding an attempt or changing the sign being practised. Meaning reveals still count as assisted. Correcting a retest updates that review attempt’s contribution to the daily score without changing earlier attempts. Corrections persist across reloads and apply only to the current day.

The “Need a hint?” button works in both new practice and retests. It reveals a sign-specific clue first, the kana reading second, and the English meaning last. Hints preserve any translation being typed and do not advance progress. Revealed hint levels persist across reloads for the current question. Clues and readings do not penalise correct answers, but checking an answer after revealing its meaning saves the sign for another retest, even if you type it correctly. Daily summaries count correct answers without full meaning reveals; completing ten answers across new signs and reviews still earns the usual kanji stamp.

Tap an individual kanji in a quiz sign or a revealed listening transcript to see its dictionary meanings in a tooltip. Kana and punctuation remain ordinary text, and the full sign or sentence remains unchanged. Press Enter or Space on a focused character to open it; tap again, tap outside, move focus away, or press Escape to dismiss it. Only one tooltip is open at a time, and changing questions closes it. Character meanings are not necessarily the translation of a compound word. Character lookups do not affect scores for multi-character words or listening; looking up a single-character quiz answer before checking it counts as a meaning reveal and keeps that sign for review, including after a reload.

The bundled [KANJIDIC2](https://www.edrdg.org/wiki/KANJIDIC_Project.html) subset contains English meanings for all 321 kanji currently used in the sign and listening banks. It is copyright Jim Breen and the Electronic Dictionary Research and Development Group, used under [CC BY-SA 4.0](https://www.edrdg.org/edrdg/licence.html). No dictionary request is made when you tap. See [dictionary attribution and maintenance](KANJI-DICTIONARY.md). Refresh at least monthly and whenever either bank changes with `node scripts/update-kanji-meanings.mjs`; coverage tests reject missing entries.

Missed kanji are saved and automatically retested before new practice when you next open the category, reload and return, or start a new day. Each review round asks every saved sign once, hiding readings and meanings until you answer or request hints. Correct review answers without a meaning reveal remove the sign from the pending list; another miss or full reveal keeps it for your next visit. A fresh review round starts with hints hidden again. Review rounds resume across reloads. Each checked review answer counts towards the daily ten and the daily score without consuming a new sign. New practice and reviews together earn one kanji stamp per date; blank answers, hints, reloading, and moving to the next sign do not add attempts.

Kanji history and review have separate browser storage and survive the katakana/listening reset. Clearing browser data or using another browser removes access to that history, so the never-repeat rule applies within the saved browser profile. Individual characters may appear in different words; each complete sign or word is one quiz entry.

The sign bank covers the everyday sign vocabulary illustrated by the Japan Foundation's [Irodori word lists](https://www.irodori.jpf.go.jp/en/resources.html) and railway terminology used by [JR Central](https://global.jr-central.co.jp/en/tickets/type/combinations.html).

The calendar awards separate stamps: coral カ for completing 10 correct katakana words, teal ♪ for completing all 10 listening translations, and gold 漢 for answering at least 10 kanji questions, including reviews. Once you answer more than ten questions on a date, its kanji stamp includes your total correct answers that day (for example, “漢 17”). Wrong answers and full meaning reveals do not count as correct; clues and reading hints are allowed. Retest answers are included in both the correct count and total attempted. The accessible calendar label also states the correct count and total attempted. Scores update as you continue and are archived across reloads and local-day rollover. Older stamps without surviving answers keep their plain symbol rather than inventing a score. On upgrade, answers still present in a saved review round are credited once; older completed review rounds cannot be reconstructed. A date can hold all three stamps. The calendar badge and total count category stamps, not extra answers. Replaying a listening set preserves its earned stamp without adding another.

Listening and kanji completions are archived by local date, so stamps remain after a new daily set arrives. Existing saved katakana completions and any completed listening/kanji daily sessions still in storage are backfilled. Earlier sessions that were already replaced before this feature cannot be reconstructed. Resetting katakana/listening clears their stamps; kanji stamps remain with the protected kanji history.

## Streak capsules

Earn a calendar stamp in any practice mode on seven consecutive local dates to unlock a sushi capsule (🍣). Fourteen consecutive dates unlock a ramen capsule (🍜). A month of practice, defined as 30 consecutive dates, unlocks a little Mount Fuji. A date counts once even if you earn all three category stamps, and you can switch modes from day to day. The streak strip shows your current and best streak; today remains available to continue a streak ending yesterday. Missing a whole day resets the current streak.

Your capsule collection appears below the practice area. Click an unlocked capsule, or focus it and press Enter or Space, to reveal its collectible. Each milestone unlocks once. Earned capsules, unopened rewards, opened collectibles, and your best streak are stored separately in `localStorage` under `katakana-quest-gacha-v1`, survive reloads, and stay earned after a streak breaks or katakana/listening practice is reset. Clearing browser data removes them; the collection is local to this browser and device. Existing saved stamped dates count automatically, including older qualifying streaks.

## Play online

<https://maxbye.co/japanese/>

## Run locally

From this folder, run:

```bash
python3 -m http.server
```

Then open <http://localhost:8000>.

Progress is stored in `localStorage` on the current browser and device. A word is reserved as soon as it appears, so refreshing the page or answering incorrectly will never serve that word again.
Missed katakana words and the answers you typed stay in the review list until you correct their grade or reset progress. Kanji misses and checked, fully revealed answers stay pending until you answer them correctly in a retest without revealing the meaning.

## Check daily practice

Run `node --test tests/*.test.cjs` to check daily selection, saved progress, rollover, retesting, migration, bank exhaustion, no repeats among new kanji, and calendar stamps for all three categories.
