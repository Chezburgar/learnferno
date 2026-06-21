import type { Deck, Quiz } from "./types";
import { uid } from "./utils";

/* Example content so a brand-new library has something to play with. */

export function SEED_DECKS(): Deck[] {
  const now = Date.now();
  const card = (front: string, back: string) => ({ id: uid("card_"), front, back });
  return [
    {
      id: uid("deck_"),
      name: "World Capitals",
      description: "Match countries to their capital cities.",
      color: "#ff5a1f",
      createdAt: now,
      updatedAt: now,
      cards: [
        card("France", "Paris"),
        card("Japan", "Tokyo"),
        card("Brazil", "Brasília"),
        card("Egypt", "Cairo"),
        card("Canada", "Ottawa"),
        card("Australia", "Canberra"),
        card("Kenya", "Nairobi"),
        card("Norway", "Oslo"),
      ],
    },
    {
      id: uid("deck_"),
      name: "SAT Vocabulary",
      description: "High-frequency words worth knowing.",
      color: "#f5b301",
      createdAt: now,
      updatedAt: now,
      cards: [
        card("Ephemeral", "Lasting for a very short time"),
        card("Gregarious", "Sociable; fond of company"),
        card("Pragmatic", "Dealing with things practically"),
        card("Ubiquitous", "Present everywhere at once"),
        card("Candid", "Honest and straightforward"),
        card("Lethargic", "Sluggish and apathetic"),
      ],
    },
  ];
}

export function SEED_QUIZZES(): Quiz[] {
  const now = Date.now();
  return [
    {
      id: uid("quiz_"),
      name: "Solar System Basics",
      description: "A quick mixed quiz about our planets.",
      color: "#ff3d00",
      createdAt: now,
      updatedAt: now,
      questions: [
        {
          id: uid("q_"),
          type: "mc",
          prompt: "Which planet is closest to the Sun?",
          choices: ["Venus", "Mercury", "Mars", "Earth"],
          correctIndex: 1,
          answer: "",
        },
        {
          id: uid("q_"),
          type: "mc",
          prompt: "Which planet is known as the Red Planet?",
          choices: ["Jupiter", "Saturn", "Mars", "Neptune"],
          correctIndex: 2,
          answer: "",
        },
        {
          id: uid("q_"),
          type: "tf",
          prompt: "The Sun is a star.",
          choices: ["True", "False"],
          correctIndex: 0,
          answer: "",
        },
        {
          id: uid("q_"),
          type: "short",
          prompt: "What is the largest planet in the solar system?",
          choices: [],
          correctIndex: 0,
          answer: "Jupiter",
        },
      ],
    },
  ];
}
