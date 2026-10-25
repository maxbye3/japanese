# Four Score · Gettysburg practice

A separate version of the practice site at `/japanese/gettysburg/`. Open `index.html` through a static web server. It needs no backend, build, account, dependencies, or API keys.

Write the Gettysburg Address from the beginning in the textarea, adding as little or as much as you remember. Click **Check my words**, or use Ctrl/Cmd + Enter. The checker accepts correct prefixes; it never fills words in for you. At the first incorrect word it shows the next two expected words. Correct the text yourself, then continue. It ignores extra numbers, case, punctuation, and spacing, and accepts “cannot” for “can not” and “battle-field” for “battlefield”. The Bliss text is from the [National Park Service](https://www.nps.gov/linc/learn/historyculture/gettysburgaddress.htm); Lincoln’s speech is public domain. The normalized checker counts 271 words. Digits can appear before, after, or within the text without affecting the check. Number words such as “four” and “seven” still need to be written as words; digits do not replace them.

Completing the entire speech, including words revealed through hints, earns one top hat dated using the browser’s local calendar date at completion. Checking or reloading that finished attempt cannot award it twice. **Write it again** starts a new attempt; completing it earns another hat even on the same day. Calendar days show up to three individual hats and retain the exact count for larger totals. Month navigation includes year boundaries. Hats stay earned when a draft is restarted.

Draft text saves as you type. Hints, checked progress, and completion history persist under the separate `gettysburg-practice-v1` localStorage key; Japanese data is untouched. Storage failures show a visible notice, and unreadable saved data recovers to a fresh draft. This is browser-local storage; clearing site data removes the history. Earned hats are merged across open tabs; the most recently saved draft is the draft restored on reload.

Run the checker and persistence tests with `node --test tests/gettysburg.test.cjs` from the repository root. The app also supports keyboard operation and reduced motion.
