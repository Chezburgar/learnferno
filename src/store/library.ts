"use client";

import { create } from "zustand";
import type { Deck, Flashcard, Question, Quiz } from "@/lib/types";
import { uid } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { deleteAllRows, deleteRow, upsertDeck, upsertQuiz } from "@/lib/cloud";

const uidOf = () => useAuth.getState().user?.id;

interface LibraryState {
  decks: Deck[];
  quizzes: Quiz[];
  loaded: boolean;

  hydrate: (decks: Deck[], quizzes: Quiz[]) => void;
  clear: () => void;

  // decks
  createDeck: (partial?: Partial<Deck>) => string;
  updateDeck: (id: string, patch: Partial<Omit<Deck, "id" | "cards">>) => void;
  deleteDeck: (id: string) => void;
  duplicateDeck: (id: string) => string | undefined;
  addCard: (deckId: string, card?: Partial<Flashcard>) => void;
  updateCard: (deckId: string, cardId: string, patch: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;

  // quizzes
  createQuiz: (partial?: Partial<Quiz>) => string;
  updateQuiz: (id: string, patch: Partial<Omit<Quiz, "id" | "questions">>) => void;
  deleteQuiz: (id: string) => void;
  duplicateQuiz: (id: string) => string | undefined;
  addQuestion: (quizId: string, q?: Partial<Question>) => void;
  updateQuestion: (quizId: string, qId: string, patch: Partial<Question>) => void;
  deleteQuestion: (quizId: string, qId: string) => void;

  // bulk
  importDecks: (decks: Deck[]) => void;
  importQuizzes: (quizzes: Quiz[]) => void;
  replaceAll: (decks: Deck[], quizzes: Quiz[]) => void;
}

/** Persist a single deck to the cloud (fire-and-forget). */
function syncDeck(deck: Deck | undefined) {
  const u = uidOf();
  if (u && deck) upsertDeck(u, deck);
}
function syncQuiz(quiz: Quiz | undefined) {
  const u = uidOf();
  if (u && quiz) upsertQuiz(u, quiz);
}

export const useLibrary = create<LibraryState>()((set, get) => ({
  decks: [],
  quizzes: [],
  loaded: false,

  hydrate: (decks, quizzes) => set({ decks, quizzes, loaded: true }),
  clear: () => set({ decks: [], quizzes: [], loaded: false }),

  createDeck: (partial) => {
    const now = Date.now();
    const deck: Deck = {
      id: uid("deck_"),
      name: partial?.name?.trim() || "Untitled deck",
      description: partial?.description,
      color: partial?.color,
      cards: partial?.cards ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set({ decks: [deck, ...get().decks] });
    syncDeck(deck);
    return deck.id;
  },

  updateDeck: (id, patch) => {
    const decks = get().decks.map((d) =>
      d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d,
    );
    set({ decks });
    syncDeck(decks.find((d) => d.id === id));
  },

  deleteDeck: (id) => {
    set({ decks: get().decks.filter((d) => d.id !== id) });
    if (uidOf()) deleteRow("decks", id);
  },

  duplicateDeck: (id) => {
    const src = get().decks.find((d) => d.id === id);
    if (!src) return undefined;
    const now = Date.now();
    const copy: Deck = {
      ...src,
      id: uid("deck_"),
      name: `${src.name} (copy)`,
      cards: src.cards.map((c) => ({ ...c, id: uid("card_") })),
      createdAt: now,
      updatedAt: now,
    };
    set({ decks: [copy, ...get().decks] });
    syncDeck(copy);
    return copy.id;
  },

  addCard: (deckId, card) => {
    const decks = get().decks.map((d) =>
      d.id === deckId
        ? {
            ...d,
            cards: [...d.cards, { id: uid("card_"), front: card?.front ?? "", back: card?.back ?? "" }],
            updatedAt: Date.now(),
          }
        : d,
    );
    set({ decks });
    syncDeck(decks.find((d) => d.id === deckId));
  },

  updateCard: (deckId, cardId, patch) => {
    const decks = get().decks.map((d) =>
      d.id === deckId
        ? {
            ...d,
            cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
            updatedAt: Date.now(),
          }
        : d,
    );
    set({ decks });
    syncDeck(decks.find((d) => d.id === deckId));
  },

  deleteCard: (deckId, cardId) => {
    const decks = get().decks.map((d) =>
      d.id === deckId
        ? { ...d, cards: d.cards.filter((c) => c.id !== cardId), updatedAt: Date.now() }
        : d,
    );
    set({ decks });
    syncDeck(decks.find((d) => d.id === deckId));
  },

  createQuiz: (partial) => {
    const now = Date.now();
    const quiz: Quiz = {
      id: uid("quiz_"),
      name: partial?.name?.trim() || "Untitled quiz",
      description: partial?.description,
      color: partial?.color,
      questions: partial?.questions ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set({ quizzes: [quiz, ...get().quizzes] });
    syncQuiz(quiz);
    return quiz.id;
  },

  updateQuiz: (id, patch) => {
    const quizzes = get().quizzes.map((q) =>
      q.id === id ? { ...q, ...patch, updatedAt: Date.now() } : q,
    );
    set({ quizzes });
    syncQuiz(quizzes.find((q) => q.id === id));
  },

  deleteQuiz: (id) => {
    set({ quizzes: get().quizzes.filter((q) => q.id !== id) });
    if (uidOf()) deleteRow("quizzes", id);
  },

  duplicateQuiz: (id) => {
    const src = get().quizzes.find((q) => q.id === id);
    if (!src) return undefined;
    const now = Date.now();
    const copy: Quiz = {
      ...src,
      id: uid("quiz_"),
      name: `${src.name} (copy)`,
      questions: src.questions.map((q) => ({ ...q, id: uid("q_") })),
      createdAt: now,
      updatedAt: now,
    };
    set({ quizzes: [copy, ...get().quizzes] });
    syncQuiz(copy);
    return copy.id;
  },

  addQuestion: (quizId, q) => {
    const quizzes = get().quizzes.map((quiz) =>
      quiz.id === quizId
        ? {
            ...quiz,
            questions: [
              ...quiz.questions,
              {
                id: uid("q_"),
                type: q?.type ?? "mc",
                prompt: q?.prompt ?? "",
                choices: q?.choices ?? ["", "", "", ""],
                correctIndex: q?.correctIndex ?? 0,
                answer: q?.answer ?? "",
              },
            ],
            updatedAt: Date.now(),
          }
        : quiz,
    );
    set({ quizzes });
    syncQuiz(quizzes.find((quiz) => quiz.id === quizId));
  },

  updateQuestion: (quizId, qId, patch) => {
    const quizzes = get().quizzes.map((quiz) =>
      quiz.id === quizId
        ? {
            ...quiz,
            questions: quiz.questions.map((qq) => (qq.id === qId ? { ...qq, ...patch } : qq)),
            updatedAt: Date.now(),
          }
        : quiz,
    );
    set({ quizzes });
    syncQuiz(quizzes.find((quiz) => quiz.id === quizId));
  },

  deleteQuestion: (quizId, qId) => {
    const quizzes = get().quizzes.map((quiz) =>
      quiz.id === quizId
        ? { ...quiz, questions: quiz.questions.filter((qq) => qq.id !== qId), updatedAt: Date.now() }
        : quiz,
    );
    set({ quizzes });
    syncQuiz(quizzes.find((quiz) => quiz.id === quizId));
  },

  importDecks: (decks) => {
    set({ decks: [...decks, ...get().decks] });
    const u = uidOf();
    if (u) decks.forEach((d) => upsertDeck(u, d));
  },

  importQuizzes: (quizzes) => {
    set({ quizzes: [...quizzes, ...get().quizzes] });
    const u = uidOf();
    if (u) quizzes.forEach((q) => upsertQuiz(u, q));
  },

  replaceAll: (decks, quizzes) => {
    set({ decks, quizzes });
    const u = uidOf();
    if (u) {
      deleteAllRows(u, "decks");
      deleteAllRows(u, "quizzes");
      decks.forEach((d) => upsertDeck(u, d));
      quizzes.forEach((q) => upsertQuiz(u, q));
    }
  },
}));
