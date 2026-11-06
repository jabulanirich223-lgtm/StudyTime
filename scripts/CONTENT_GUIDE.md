# StudyTime course content guide

You are writing lesson content for StudyTime, a Duolingo-style study app. Write it from your own knowledge of standard curricula (Common Core math/ELA, NGSS science, AP course frameworks, CEFR for languages, standard intro syllabi for coding/finance/tech). Do NOT web search. Be accurate: every answer must be unambiguously correct; if unsure of a fact, write a different question.

## Output
One JSON file (path given in your task), shaped as an object keyed by course id:

```json
{
  "math-g6": {
    "name": "Grade 6 Math",
    "units": [
      {
        "title": "Ratios and Rates",
        "period": "Grade 6",
        "learn": [
          { "h": "What is a ratio?", "b": "2-4 short, plain sentences that teach the idea, with a tiny example." }
        ],
        "qs": [ ...questions... ]
      }
    ]
  }
}
```

Rules per course:
- Exactly 4 units, ordered from basics to harder, covering the main topics of that course/level.
- `period`: short subtitle shown on the unit banner (e.g. "Grade 6", "Beginner", "Python basics", "Personal finance"). For history it can be a date range.
- `learn`: 3 cards per unit. Short, friendly, teach what the questions test. Write simply (the user is a teen; English may not be the learner's first language).
- `qs`: exactly 7 questions per unit, mixing types like: 4 × mc, 1 × tf, 1 × match, 1 × order.

Question types (copy the shape exactly):
```json
{ "t": "mc", "q": "Question text?", "o": ["A", "B", "C", "D"], "a": 2, "why": "One sentence why the answer is right." }
{ "t": "tf", "q": "A statement.", "a": false, "why": "One sentence." }
{ "t": "match", "q": "Match each term to its meaning", "pairs": [["term", "meaning"], ["term", "meaning"], ["term", "meaning"], ["term", "meaning"]] }
{ "t": "order", "q": "Put these steps in order", "items": [["first step", 1], ["second", 2], ["third", 3], ["fourth", 4]] }
```
- mc: 4 distinct options, `a` is the 0-based index of the correct one. Vary which position is correct (don't always use 0). Distractors must be plausible but clearly wrong.
- order: items listed in the CORRECT order with strictly increasing numbers. For history events use the real year as the number (negative for BCE). For everything else use 1,2,3,4 (steps, sizes, sequence).
- match: exactly 4 pairs; keep each side short (under ~6 words).
- Keep question text under ~25 words. No images, no markdown, no HTML.
- Math: write expressions in plain text (x^2, 3/4, sqrt(16), ≤). Make sure the arithmetic is right.
- Languages: the learner speaks English. Ask translation/meaning/grammar questions. For non-Latin scripts include the romanization in parentheses, e.g. "こんにちは (konnichiwa)". Beginner = A1 basics (greetings, numbers, food, family, verbs to be/have); Intermediate = A2–B1 (past tense, directions, travel, opinions).
- Coding: questions about syntax, what code prints, concepts, best practices. Write code inline with backticks-free plain text, e.g. "What does print(len('hi')) output?". Keep code to one line.

## Finish
Run `node /home/claude/studytime/scripts/validate.mjs <your file>` and fix every problem until it prints OK. Then reply with ONLY the OK line (course/unit/question counts). Do not edit any other file.
