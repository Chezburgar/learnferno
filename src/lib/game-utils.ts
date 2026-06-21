import type { Deck, Quiz } from "./types";
import { sample, shuffle } from "./utils";

/** A normalized multiple-choice item used by the Blitz game. */
export interface MCItem {
  prompt: string;
  options: string[];
  correct: number;
}

/** Build MC items from a flashcard deck: front = prompt, back = answer, distractors = other backs. */
export function mcFromDeck(deck: Deck): MCItem[] {
  const cards = deck.cards.filter((c) => c.front.trim() && c.back.trim());
  const backs = cards.map((c) => c.back);
  return cards.map((c) => {
    const distractors = sample(backs, 3, (b) => b === c.back);
    const options = shuffle([c.back, ...distractors]);
    return { prompt: c.front, options, correct: options.indexOf(c.back) };
  });
}

/** Build MC items from a quiz: mc/tf as-is, short answers padded with distractors. */
export function mcFromQuiz(quiz: Quiz): MCItem[] {
  const shortAnswers = quiz.questions.filter((q) => q.type === "short").map((q) => q.answer);
  const items: MCItem[] = [];
  for (const q of quiz.questions) {
    if (!q.prompt.trim()) continue;
    if (q.type === "mc" || q.type === "tf") {
      const opts = q.choices.filter((c) => c.trim());
      if (opts.length < 2) continue;
      // correctIndex refers to the original choices array
      const correctText = q.choices[q.correctIndex];
      const options = q.type === "tf" ? q.choices : shuffle(opts);
      const correct = options.indexOf(correctText);
      items.push({ prompt: q.prompt, options, correct: correct < 0 ? 0 : correct });
    } else {
      // short → synthesize options
      if (!q.answer.trim()) continue;
      const distractors = sample(shortAnswers, 3, (a) => a === q.answer);
      if (distractors.length < 1) continue;
      const options = shuffle([q.answer, ...distractors]);
      items.push({ prompt: q.prompt, options, correct: options.indexOf(q.answer) });
    }
  }
  return items;
}

/** Does a deck have enough material for an auto multiple-choice game? */
export function deckSupportsMC(deck: Deck): boolean {
  return deck.cards.filter((c) => c.front.trim() && c.back.trim()).length >= 4;
}

export function quizSupportsBlitz(quiz: Quiz): boolean {
  return mcFromQuiz(quiz).length >= 1;
}
