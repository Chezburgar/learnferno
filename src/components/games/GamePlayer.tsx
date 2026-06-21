"use client";

import { useMemo } from "react";
import { useLibrary } from "@/store/library";
import { mcFromDeck, mcFromQuiz } from "@/lib/game-utils";
import { FlipGame } from "./FlipGame";
import { RecallGame } from "./RecallGame";
import { MatchGame } from "./MatchGame";
import { QuizGame } from "./QuizGame";
import { BlitzGame } from "./BlitzGame";

export type GameId = "flip" | "recall" | "match" | "test" | "blitz";
export type ContentType = "deck" | "quiz";

function Missing({ onExit }: { onExit: () => void }) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <p className="text-muted">That set could not be loaded.</p>
      <button onClick={onExit} className="mt-4 text-sm text-accent underline">Back to games</button>
    </div>
  );
}

export function GamePlayer({
  game,
  contentType,
  contentId,
  onExit,
}: {
  game: GameId;
  contentType: ContentType;
  contentId: string;
  onExit: () => void;
}) {
  const deck = useLibrary((s) => s.decks.find((d) => d.id === contentId));
  const quiz = useLibrary((s) => s.quizzes.find((q) => q.id === contentId));

  const blitzItems = useMemo(() => {
    if (game !== "blitz") return [];
    if (contentType === "deck" && deck) return mcFromDeck(deck);
    if (contentType === "quiz" && quiz) return mcFromQuiz(quiz);
    return [];
  }, [game, contentType, deck, quiz]);

  if (game === "flip") return deck ? <FlipGame deck={deck} onExit={onExit} /> : <Missing onExit={onExit} />;
  if (game === "recall") return deck ? <RecallGame deck={deck} onExit={onExit} /> : <Missing onExit={onExit} />;
  if (game === "match") return deck ? <MatchGame deck={deck} onExit={onExit} /> : <Missing onExit={onExit} />;
  if (game === "test") return quiz ? <QuizGame quiz={quiz} onExit={onExit} /> : <Missing onExit={onExit} />;
  if (game === "blitz") {
    const source = contentType === "deck" ? deck?.name : quiz?.name;
    if (!source) return <Missing onExit={onExit} />;
    return <BlitzGame items={blitzItems} source={source} onExit={onExit} />;
  }
  return <Missing onExit={onExit} />;
}
