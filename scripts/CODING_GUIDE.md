# StudyTime deep coding course guide

You are writing a REAL coding course for StudyTime (a Duolingo-style app). A learner who finishes it must actually be able to write programs in the language. Teach every core topic a good intro book / official tutorial covers, in order, with no gaps (e.g. for C++: I/O, types, operators, control flow, functions, arrays, strings, vectors, references, pointers, memory, structs, classes, constructors, inheritance, polymorphism, templates, STL containers/algorithms, iterators, exceptions, file I/O, smart pointers, move semantics, lambdas, building multi-file programs). Use your own knowledge of the official docs / standard textbooks. Do not web search. Every answer must be unambiguously correct.

## Output
One JSON file per course at the path given: `{ "<course id>": { "name": "...", "units": [ ... ] } }`.
Write it with a Python script (json.dump, ensure_ascii=False, indent=1) so escaping is always right. Build it unit by unit.

Each unit:
```json
{
  "title": "If Statements",
  "period": "Python basics",
  "learn": [ { "h": "Making decisions", "b": "2-4 plain sentences.", "code": "age = 16\nif age >= 13:\n    print('teen')" } ],
  "qs": [ ...8 questions... ],
  "lab": [ ...2-3 challenge tasks... ]
}
```
- `learn`: 4 cards. Teach clearly for a teen; `code` (optional, multi-line, use \n) shows a short example (max ~10 lines). The cards must teach everything the questions and lab need.
- `qs` (exactly 8): 2 × mc, 1 × mc WITH a `code` snippet ("What does this print?"), 1 × tf, 1 × match, 1 × input, 1 × parsons, 1 × order.
- `lab` (2 or 3 tasks): the hands-on "Challenge" node. For runnable languages (python, javascript, lua, sql) include at least 1 `code` task per unit (2 is better), plus optionally 1 input/parsons. For other languages use 2-3 tasks of `input` / `parsons` / mc-with-code that make the learner WRITE or READ code (e.g. "Type the line that declares an int named score set to 10"). Gamify the wording: "Challenge: …".

Question shapes (copy exactly):
```json
{ "t": "mc", "q": "Question?", "o": ["A","B","C","D"], "a": 2, "why": "One sentence." }
{ "t": "mc", "q": "What does this print?", "code": "x = 3\nprint(x * 2)", "o": ["6","32","x*2","Error"], "a": 0, "why": "..." }
{ "t": "tf", "q": "A statement.", "a": false, "why": "..." }
{ "t": "match", "q": "Match each ... to ...", "pairs": [["a","b"],["a","b"],["a","b"],["a","b"]] }
{ "t": "order", "q": "Put these steps in order", "items": [["first",1],["second",2],["third",3],["fourth",4]] }
{ "t": "input", "q": "Type the keyword that ...", "a": ["elif"], "hint": "optional", "why": "..." }
{ "t": "parsons", "q": "Arrange the lines to print 1 to 3", "lines": ["for i in range(1, 4):", "    print(i)"], "why": "..." }
{ "t": "code", "lang": "python", "q": "Challenge: write an if/else that prints 'adult' if age is 18 or more, otherwise 'kid'. The variable age is already set.",
  "starter": "# age is already set\n", "tests": [ { "pre": "age = 20", "expect": "adult" }, { "pre": "age = 7", "expect": "kid" } ],
  "hint": "Use if age >= 18: ... else: ...", "solution": "if age >= 18:\n    print('adult')\nelse:\n    print('kid')", "why": "..." }
```
Rules:
- mc: 4 distinct options, vary the correct index.
- input: `a` lists every acceptable answer (comparison ignores case, extra spaces and most punctuation, so prefer short answers: a keyword, a value, a short expression or the exact printed output). Never ask for something with many valid spellings.
- parsons: 3-8 lines, listed in the CORRECT order, every line unique (add a comment or different value to make duplicates unique). Indentation is part of the line.
- order: correct order with numbers 1,2,3,4.
- code tasks: the program run is `pre + "\n" + learner code + "\n" + post` for each test; output (stdout) must equal `expect` exactly (trailing spaces ignored). Use 2-3 tests with different inputs so hard-coding fails. `pre` sets inputs (variables) or `post` calls the learner's function, e.g. post: "print(add(2, 3))". `starter` must NOT already pass. Keep it doable in under 10 lines.
  - python: standard Python 3, print().
  - javascript: plain JS run in Node/browser worker, use console.log. No DOM, no require/import.
  - lua: plain Lua 5.3 (the Luau course uses this for logic challenges: no type annotations, no +=, no `continue`, no Roblox APIs inside code tasks). print with multiple args separates with a tab; prefer single-value prints, use integer math (// for floor division) to avoid 3.0-style float output.
  - sql: SQLite. Put CREATE TABLE + INSERTs in `setup`; the learner writes ONE query; `tests` is `[ { "expect": "..." } ]` where each output row is the column values joined with | and rows separated by \n. Always use ORDER BY when more than one row so order is fixed.
- No markdown, no HTML tags in text, no backticks. Keep question text under ~30 words.

## Finish
Run `node /home/claude/studytime/scripts/validate.mjs <file>` for each file. It also RUNS every code task's solution and checks it passes its tests. Fix everything until each file prints OK. Reply with only the OK lines. Do not edit any other file in the repo. Use your own scratch folder for scripts (given in your task).
