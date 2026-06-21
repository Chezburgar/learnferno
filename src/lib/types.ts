/* ------------------------------------------------------------------ */
/*  LearnFerno data model                                              */
/* ------------------------------------------------------------------ */

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  color?: string;
  cards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}

export type QuestionType = "mc" | "tf" | "short";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Multiple-choice options (mc only). */
  choices: string[];
  /** Index into `choices` for mc; for tf 0=True 1=False; ignored for short. */
  correctIndex: number;
  /** Accepted answer text for `short` questions. */
  answer: string;
}

export interface Quiz {
  id: string;
  name: string;
  description?: string;
  color?: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

/** Backup bundle written/read by the import-export screen. */
export interface Bundle {
  app: "learnferno";
  version: 1;
  exportedAt: number;
  decks: Deck[];
  quizzes: Quiz[];
}
