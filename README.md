# 🔥 LearnFerno

A fiery study companion — make **flashcards** and **quizzes**, then drill them with fast, fun **games**. Styled after the GradeFlow design system, with fiery colors by default. Sign in and your sets **sync to the cloud** across devices, and you can **import/export** them anytime.

🔥 **Live:** https://chezburgar.github.io/learnferno/

## Features

- **Flashcard decks** — create decks of cards (front term / back answer), edit inline, or bulk-paste a whole list.
- **Quizzes** — multiple choice, true/false, and short-answer questions, mixed freely in one quiz.
- **Study games**
  - **Flip** — flip cards in 3D and rate how well you knew each one.
  - **Type Recall** — see the term, type the answer (forgiving matching).
  - **Match** — timed memory grid: pair every term with its answer.
  - **Quiz** — work through a quiz and get a graded score with review.
  - **Inferno Blitz** — timed rapid-fire multiple choice with a heat-streak multiplier, lives, and a high score. Works on a deck (auto-generated options) or a quiz.
- **XP, levels & daily streaks** to keep you coming back.
- **Import / Export** — back up your whole library to a `.json` file, export a single deck/quiz, import by file or pasted JSON, or build a deck from plain text (Tab / comma / dash separated).
- **Theming** — fiery by default (Inferno theme + Flame accent), with extra themes, custom accent color, fonts, corners, and density.

## Tech

- Next.js 16 (App Router, static export) · React 19
- Tailwind CSS v4 (CSS-variable design tokens)
- framer-motion · lucide-react · zustand
- **Supabase** for email/password auth + a Postgres database (queried straight from the static client; every row is protected by row-level security)

## Accounts & data

Accounts are required. Your decks, quizzes and progress are stored in Supabase, one JSONB row each, scoped to your user via RLS (`auth.uid() = user_id`). Appearance settings stay local (`lf-settings`). The Supabase URL + publishable key are safe to ship in the client (RLS does the gatekeeping); override them with `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you fork.

## Develop

```bash
npm install
npm run dev      # http://localhost:5611
npm run build    # static export to ./out
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the static export and publishes it to GitHub Pages under `/learnferno`. The basePath is set automatically in production (`NEXT_PUBLIC_BASE_PATH` to override).
