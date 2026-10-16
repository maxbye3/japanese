# Character dictionary attribution

`kanji-meanings.js` is a selected extract of the English meanings in KANJIDIC2, copyright Jim Breen and the Electronic Dictionary Research and Development Group (EDRDG). It is not original dictionary data from this project. The selection includes only characters in the app's sign and listening banks and retains up to four English glosses per character.

The dictionary extract is distributed under Creative Commons Attribution-ShareAlike 4.0. This applies to the dictionary extract, not the separately written application code. EDRDG does not endorse this application. The dictionary data is supplied without warranty.

- [KANJIDIC project documentation](https://www.edrdg.org/wiki/KANJIDIC_Project.html)
- [EDRDG dictionary licence, copyright and conditions](https://www.edrdg.org/edrdg/licence.html)
- [Creative Commons Attribution-ShareAlike 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode)
- [Upstream KANJIDIC2 data](https://www.edrdg.org/kanjidic/kanjidic2.xml.gz)

## Updating the subset

Refresh the data at least monthly and when the sign or listening bank changes:

```bash
node scripts/update-kanji-meanings.mjs
node --test tests/*.test.cjs
```

The script downloads the current source, extracts the needed English glosses, fails if any character lacks a meaning, and regenerates only the small bundled subset. An optional path to a previously downloaded `.xml.gz` file supports offline regeneration. Review, commit and publish the generated file with any bank changes. Do not hand-edit generated glosses.
