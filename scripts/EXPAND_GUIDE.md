# StudyTime: expand an existing course

Each course you are given already has 4 units in an existing file. Your job: make it a complete course with no missing topics.

1. Load the existing course JSON (path given). Keep its 4 units (fix any wrong fact you notice).
2. Add a `lab` (the hands-on "Challenge" node) to EVERY unit, old and new.
3. Add more units so the course reaches the unit count you are given, covering every remaining major topic of that course's real curriculum (Common Core / NGSS / AP Course and Exam Description / CEFR / standard textbook). Order all units from basics to hardest; you may reorder or retitle old units to fit.
4. Write the result to the NEW output path given, as `{ "<course id>": { "name": ..., "units": [...] } }`, using a Python script (json.dump, ensure_ascii=False, indent=1). Do not modify the original file.

New units follow /home/claude/studytime/scripts/CONTENT_GUIDE.md (3 learn cards, exactly 7 qs: 4 mc, 1 tf, 1 match, 1 order). Learn cards may have an optional "code" field only for code; otherwise plain text.

`lab`: 3 tasks per unit, mostly `input` (the learner TYPES the answer: that is the point of the challenge), plus optionally 1 mc or parsons. Shapes:
```json
{ "t": "input", "q": "Challenge: solve 3x + 5 = 20. x = ?", "a": ["5"], "hint": "Subtract 5, then divide by 3.", "why": "3x = 15, so x = 5." }
{ "t": "parsons", "q": "Challenge: put the steps of solving 2x - 4 = 10 in order", "lines": ["2x - 4 = 10", "2x = 14", "x = 7"], "why": "..." }
```
- input answers are compared ignoring case, accents, extra spaces and punctuation other than . and -. List every acceptable form in `a` (e.g. ["0.5", "1/2"] won't match each other automatically — list both; ["7", "seven"]; for languages list common correct translations with and without articles, e.g. ["el gato", "gato"]). Keep answers short (a number, word or short phrase) with one clearly correct meaning.
- Math: real computation problems (word problems too); numbers must be exactly right — check them with Python.
- Languages: translate short phrases English→target and target→English, fill the missing word, conjugate a verb. For non-Latin scripts accept the native script AND the romanization in `a`.
- Science / social studies / English / money / tech: recall-and-apply tasks: type the term, the year, the result of a calculation (interest, percent, density), or the word that fits.
- parsons lines: 3-8 unique lines in the correct order.

Validate with `node /home/claude/studytime/scripts/validate.mjs <output>` until it prints OK, then reply with only the OK lines. Use the scratch folder given for your scripts. Do not edit any other repo file.
