import type { Bundle, Deck, Flashcard, Question, Quiz } from "./types";
import { uid } from "./utils";

/* ------------------------------------------------------------------ */
/*  Import / export helpers                                            */
/* ------------------------------------------------------------------ */

export function makeBundle(decks: Deck[], quizzes: Quiz[]): Bundle {
  return {
    app: "learnferno",
    version: 1,
    exportedAt: Date.now(),
    decks,
    quizzes,
  };
}

export interface ParsedImport {
  decks: Deck[];
  quizzes: Quiz[];
}

/** Re-id an imported deck so it can't clobber an existing one. */
function freshDeck(d: Partial<Deck>): Deck {
  const now = Date.now();
  return {
    id: uid("deck_"),
    name: (d.name || "Imported deck").toString(),
    description: d.description?.toString(),
    color: d.color?.toString(),
    cards: Array.isArray(d.cards)
      ? d.cards.map(
          (c): Flashcard => ({
            id: uid("card_"),
            front: (c?.front ?? "").toString(),
            back: (c?.back ?? "").toString(),
          }),
        )
      : [],
    createdAt: now,
    updatedAt: now,
  };
}

function freshQuiz(q: Partial<Quiz>): Quiz {
  const now = Date.now();
  return {
    id: uid("quiz_"),
    name: (q.name || "Imported quiz").toString(),
    description: q.description?.toString(),
    color: q.color?.toString(),
    questions: Array.isArray(q.questions)
      ? q.questions.map((raw): Question => {
          const type =
            raw?.type === "tf" || raw?.type === "short" ? raw.type : "mc";
          const choices = Array.isArray(raw?.choices)
            ? raw.choices.map((c) => c?.toString() ?? "")
            : type === "tf"
              ? ["True", "False"]
              : [];
          return {
            id: uid("q_"),
            type,
            prompt: (raw?.prompt ?? "").toString(),
            choices,
            correctIndex:
              typeof raw?.correctIndex === "number" ? raw.correctIndex : 0,
            answer: (raw?.answer ?? "").toString(),
          };
        })
      : [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Parse JSON that may be:
 *  - a full Bundle ({ app, decks, quizzes })
 *  - a single Deck ({ name, cards })
 *  - a single Quiz ({ name, questions })
 *  - an array of decks or quizzes
 */
export function parseJsonImport(text: string): ParsedImport {
  const data = JSON.parse(text);
  const decks: Deck[] = [];
  const quizzes: Quiz[] = [];

  const ingest = (obj: unknown) => {
    if (!obj || typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;
    if (Array.isArray(o.decks) || Array.isArray(o.quizzes)) {
      (o.decks as Partial<Deck>[] | undefined)?.forEach((d) => decks.push(freshDeck(d)));
      (o.quizzes as Partial<Quiz>[] | undefined)?.forEach((q) => quizzes.push(freshQuiz(q)));
    } else if (Array.isArray(o.questions)) {
      quizzes.push(freshQuiz(o as Partial<Quiz>));
    } else if (Array.isArray(o.cards)) {
      decks.push(freshDeck(o as Partial<Deck>));
    }
  };

  if (Array.isArray(data)) data.forEach(ingest);
  else ingest(data);

  if (!decks.length && !quizzes.length) {
    throw new Error("No decks or quizzes found in that file.");
  }
  return { decks, quizzes };
}

/**
 * Parse plain-text flashcards into a deck. Each line is one card.
 * Term/definition are split by the first occurrence of `sep`
 * (tab, comma, dash, or " - "). Blank lines are ignored.
 */
export function parseTextDeck(
  text: string,
  name: string,
  sep: "tab" | "comma" | "dash" = "tab",
): Deck {
  const splitter =
    sep === "tab" ? /\t|  +/ : sep === "comma" ? /\s*,\s*/ : /\s+[-–—]\s+/;
  const cards: Flashcard[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.split(splitter);
    if (m.length < 2) continue;
    const front = m[0].trim();
    const back = m.slice(1).join(sep === "comma" ? ", " : " ").trim();
    if (front && back) cards.push({ id: uid("card_"), front, back });
  }
  const now = Date.now();
  return {
    id: uid("deck_"),
    name: name.trim() || "Imported deck",
    cards,
    createdAt: now,
    updatedAt: now,
  };
}
