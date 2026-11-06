# StudyTime

A gamified history study app for **AP World History** and **AP US History**, built as a Windows desktop app.
Lessons are laid out on a path like a language-learning app, but for school subjects, with short Khan-style notes before each unit.

![Learn path](docs/learn.png)

## What's inside

- **Lesson path**: 20 units (AP World units 1–9 + 2 ancient bonus units, AP US History periods 1–9). Each unit has Learn, Practice 1, Practice 2, Unit Test and a treasure chest.
- **Question types**: multiple choice, true/false, tap-to-match pairs, put-events-in-order, AP source (stimulus) questions.
- **AP Prep**: timed Exam Sim with a 1–5 score estimate, Source Drills, Unit Focus.
- **Cram**: Lightning Round (60 s), Date Dash, Flashcards, Cram Sheet.
- **Game layer**: XP, levels, gems, hearts, streaks, streak freezes, combos, weekly leagues, 12 badges, a shop, confetti and sound effects.
- **Read aloud**: every question, explanation and note can be read out loud, with voice, speed and pitch settings (press **R** in a lesson).
- **Characters**: Tock the hourglass explorer (vector mascot, 7 moods) and a study crew of 7 original characters who ask the questions.

| Lesson | Results | Phone width |
| --- | --- | --- |
| ![Lesson](docs/lesson.png) | ![Results](docs/results.png) | ![Phone](docs/phone.png) |

## Get the app

Every push to `main` builds a Windows installer on GitHub Actions:
**Actions → Build Windows app → latest run → Artifacts → StudyTime-Windows**.
Tagging a version (for example `v1.0.0`) also attaches the installer to a GitHub Release.

## Develop

```bash
npm install
npm run dev     # open in the browser at http://localhost:5173
npm run app     # build and open in the desktop window
npm run dist    # build the Windows installer into release/
```

Tech: React 19, TypeScript, Vite, Zustand (progress saved locally), Electron + electron-builder.

## Project layout

```
electron/main.cjs        desktop window
src/data/subjects.json   all course content (units, notes, questions)
src/data/index.ts        unit colors and icons
src/data/cast.ts         the study crew
src/lib/                 game state, sounds, read-aloud, launchers
src/views/               Learn, Lesson, AP, Cram, Leagues, Shop, Review, Profile, Onboarding
src/components/Tock.tsx  the mascot (SVG, 7 moods)
src/assets/              character and icon art (made locally with ComfyUI + FLUX)
```

## Adding questions

Questions live in `src/data/subjects.json`. Each unit has `learn` notes and `qs` questions:

```json
{ "t": "mc", "q": "Question?", "o": ["A", "B", "C", "D"], "a": 0, "why": "Explanation." }
{ "t": "tf", "q": "Statement.", "a": true, "why": "Explanation." }
{ "t": "match", "q": "Match each…", "pairs": [["Left", "Right"]] }
{ "t": "order", "q": "Put in order", "items": [["Event", 1453]] }
```
