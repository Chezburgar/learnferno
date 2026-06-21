"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gamepad2,
  Grid3x3,
  Keyboard,
  Layers,
  ListChecks,
  RefreshCw,
  Repeat,
  Timer,
} from "lucide-react";
import { PageHeader, Stagger, StaggerItem } from "@/components/PageHeader";
import { Badge, Button, Card, Dialog, EmptyState } from "@/components/ui";
import {
  GamePlayer,
  type ContentType,
  type GameId,
} from "@/components/games/GamePlayer";
import { useLibrary } from "@/store/library";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { deckSupportsMC, quizSupportsBlitz } from "@/lib/game-utils";
import type { Deck, Quiz } from "@/lib/types";

interface GameDef {
  id: GameId;
  name: string;
  desc: string;
  icon: typeof Repeat;
  kind: "deck" | "quiz" | "both";
}

const GAMES: GameDef[] = [
  { id: "flip", name: "Flip", desc: "Flip through cards and rate how well you knew each one.", icon: Repeat, kind: "deck" },
  { id: "recall", name: "Type Recall", desc: "See the term, type the answer from memory.", icon: Keyboard, kind: "deck" },
  { id: "match", name: "Match", desc: "Race to pair every term with its answer.", icon: Grid3x3, kind: "deck" },
  { id: "test", name: "Quiz", desc: "Work through your quiz and get a graded score.", icon: ListChecks, kind: "quiz" },
  { id: "blitz", name: "Inferno Blitz", desc: "Timed rapid-fire MC. Keep your heat streak alive!", icon: Timer, kind: "both" },
];

function deckEligible(game: GameDef, d: Deck): boolean {
  if (game.id === "match") return d.cards.filter((c) => c.front.trim() && c.back.trim()).length >= 2;
  if (game.id === "blitz") return deckSupportsMC(d);
  return d.cards.length >= 1;
}
function quizEligible(game: GameDef, q: Quiz): boolean {
  if (game.id === "blitz") return quizSupportsBlitz(q);
  return q.questions.length >= 1;
}

function PlayHub() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const decks = useLibrary((s) => s.decks);
  const quizzes = useLibrary((s) => s.quizzes);

  const preType = params.get("type") as ContentType | null;
  const preId = params.get("id");
  const preContent = useMemo(() => {
    if (preType === "deck") return decks.find((d) => d.id === preId) ?? null;
    if (preType === "quiz") return quizzes.find((q) => q.id === preId) ?? null;
    return null;
  }, [preType, preId, decks, quizzes]);

  const [active, setActive] = useState<{ game: GameId; type: ContentType; id: string } | null>(null);
  const [picker, setPicker] = useState<GameDef | null>(null);

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-44" />)}
      </div>
    );
  }

  if (active) {
    return (
      <motion.div key={active.game + active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GamePlayer
          game={active.game}
          contentType={active.type}
          contentId={active.id}
          onExit={() => setActive(null)}
        />
      </motion.div>
    );
  }

  const noContent = decks.length === 0 && quizzes.length === 0;

  // games applicable to the preselected content
  const applicable = preContent
    ? GAMES.filter((g) =>
        preType === "deck" ? g.kind !== "quiz" : g.kind !== "deck",
      )
    : GAMES;

  const startWithPre = (g: GameDef) => {
    if (!preContent || !preType || !preId) return;
    const eligible = preType === "deck" ? deckEligible(g, preContent as Deck) : quizEligible(g, preContent as Quiz);
    if (!eligible) return;
    setActive({ game: g.id, type: preType, id: preId });
  };

  return (
    <div>
      <PageHeader
        title="Play"
        subtitle={preContent ? undefined : "Pick a game, then choose what to study."}
        action={
          preContent ? (
            <Link href="/play">
              <Button variant="ghost" size="sm"><RefreshCw size={15} /> Choose different set</Button>
            </Link>
          ) : undefined
        }
      />

      {preContent && (
        <Card className="mb-6 flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white" style={{ background: preContent.color || "var(--accent)" }}>
            {preType === "deck" ? <Layers size={22} /> : <ListChecks size={22} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-faint">{preType === "deck" ? "Flashcard deck" : "Quiz"}</p>
            <h2 className="truncate text-lg font-bold">{preContent.name}</h2>
          </div>
          <Badge color={preContent.color}>
            {preType === "deck" ? `${(preContent as Deck).cards.length} cards` : `${(preContent as Quiz).questions.length} questions`}
          </Badge>
        </Card>
      )}

      {noContent ? (
        <Card>
          <EmptyState
            icon={<Gamepad2 size={22} />}
            title="Nothing to play yet"
            hint="Create a flashcard deck or a quiz first, then come back to play."
            action={
              <div className="flex gap-2">
                <Link href="/decks"><Button variant="outline"><Layers size={16} /> New deck</Button></Link>
                <Link href="/quizzes"><Button variant="fire"><ListChecks size={16} /> New quiz</Button></Link>
              </div>
            }
          />
        </Card>
      ) : (
        <Stagger>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applicable.map((g) => {
              const eligible = preContent
                ? preType === "deck"
                  ? deckEligible(g, preContent as Deck)
                  : quizEligible(g, preContent as Quiz)
                : true;
              return (
                <StaggerItem key={g.id}>
                  <button
                    disabled={preContent ? !eligible : false}
                    onClick={() => (preContent ? startWithPre(g) : setPicker(g))}
                    className={cn(
                      "card group flex h-full w-full flex-col p-5 text-left transition",
                      eligible ? "hover:-translate-y-1 hover:border-accent/50" : "cursor-not-allowed opacity-50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-xl fire-grad text-white shadow-sm">
                        <g.icon size={22} />
                      </div>
                      <Badge>
                        {g.kind === "deck" ? "Flashcards" : g.kind === "quiz" ? "Quiz" : "Cards or quiz"}
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{g.name}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted">{g.desc}</p>
                    {preContent && !eligible && (
                      <p className="mt-3 text-xs text-bad">
                        {g.id === "blitz" ? "Needs at least 4 items" : g.id === "match" ? "Needs at least 2 complete cards" : "Add some content first"}
                      </p>
                    )}
                  </button>
                </StaggerItem>
              );
            })}
          </div>
        </Stagger>
      )}

      {/* content picker */}
      <Dialog
        open={!!picker}
        onClose={() => setPicker(null)}
        title={picker ? `Choose a set for ${picker.name}` : ""}
        wide
      >
        {picker && (
          <ContentPicker
            game={picker}
            decks={decks}
            quizzes={quizzes}
            onPick={(type, id) => {
              setActive({ game: picker.id, type, id });
              setPicker(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function ContentPicker({
  game,
  decks,
  quizzes,
  onPick,
}: {
  game: GameDef;
  decks: Deck[];
  quizzes: Quiz[];
  onPick: (type: ContentType, id: string) => void;
}) {
  const showDecks = game.kind !== "quiz";
  const showQuizzes = game.kind !== "deck";

  const Row = ({
    type,
    id,
    name,
    meta,
    color,
    eligible,
    hint,
  }: {
    type: ContentType;
    id: string;
    name: string;
    meta: string;
    color?: string;
    eligible: boolean;
    hint: string;
  }) => (
    <button
      disabled={!eligible}
      onClick={() => onPick(type, id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-soft)] border border-line p-3 text-left transition",
        eligible ? "hover:border-accent hover:bg-surface-2" : "cursor-not-allowed opacity-50",
      )}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white" style={{ background: color || "var(--accent)" }}>
        {type === "deck" ? <Layers size={18} /> : <ListChecks size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-xs text-muted">{eligible ? meta : hint}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      {showDecks && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Flashcard decks</p>
          {decks.length === 0 ? (
            <p className="text-sm text-muted">No decks yet.</p>
          ) : (
            <div className="space-y-2">
              {decks.map((d) => (
                <Row
                  key={d.id}
                  type="deck"
                  id={d.id}
                  name={d.name}
                  meta={`${d.cards.length} cards`}
                  color={d.color}
                  eligible={deckEligible(game, d)}
                  hint={game.id === "blitz" ? "Needs 4+ complete cards" : game.id === "match" ? "Needs 2+ complete cards" : "Empty deck"}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {showQuizzes && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Quizzes</p>
          {quizzes.length === 0 ? (
            <p className="text-sm text-muted">No quizzes yet.</p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <Row
                  key={q.id}
                  type="quiz"
                  id={q.id}
                  name={q.name}
                  meta={`${q.questions.length} questions`}
                  color={q.color}
                  eligible={quizEligible(game, q)}
                  hint="No usable questions"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="skeleton h-44" />}>
      <PlayHub />
    </Suspense>
  );
}
