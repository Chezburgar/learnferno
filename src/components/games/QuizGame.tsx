"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { GameSummary, GameTopBar, ProgressBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { answersMatch, cn, shuffle as shuffleArr } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { Quiz, Question } from "@/lib/types";

interface Attempt {
  question: Question;
  correct: boolean;
  given: string;
}

export function QuizGame({ quiz, onExit }: { quiz: Quiz; onExit: () => void }) {
  const recordPlay = useProgress((s) => s.recordPlay);
  const questions = useMemo(
    () => shuffleArr(quiz.questions.filter((q) => q.prompt.trim())),
    [quiz],
  );

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const restart = () => {
    setIdx(0); setPicked(null); setTyped(""); setRevealed(false); setAttempts([]); setDone(false);
  };

  const submit = () => {
    if (revealed) return advance();
    let correct = false;
    let given = "";
    if (q.type === "short") {
      given = typed;
      correct = answersMatch(typed, q.answer);
    } else {
      if (picked === null) return;
      given = q.choices[picked] ?? "";
      correct = picked === q.correctIndex;
    }
    setAttempts((a) => [...a, { question: q, correct, given }]);
    if (correct) sfx.correct(); else sfx.wrong();
    setRevealed(true);
  };

  const advance = () => {
    if (idx + 1 >= questions.length) {
      const got = attempts.filter((a) => a.correct).length;
      const score = Math.round((got / questions.length) * 100);
      recordPlay({ game: "Quiz", source: quiz.name, score, xp: 10 + got * 9 });
      sfx.finish();
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setTyped("");
    setRevealed(false);
  };

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <GameTopBar title="Quiz" subtitle={quiz.name} onExit={onExit} />
        <div className="card p-8 text-center text-muted">This quiz has no questions yet.</div>
      </div>
    );
  }

  if (done) {
    const got = attempts.filter((a) => a.correct).length;
    const score = Math.round((got / questions.length) * 100);
    return (
      <div className="mx-auto max-w-xl">
        <GameSummary
          score={score}
          xp={10 + got * 9}
          lines={[
            { label: "Correct", value: `${got} / ${questions.length}` },
            { label: "Accuracy", value: `${score}%` },
          ]}
          onReplay={restart}
          onExit={onExit}
        />
        <div className="mt-6">
          <h3 className="mb-3 font-bold">Review</h3>
          <div className="space-y-2">
            {attempts.map((a, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                    style={{ background: a.correct ? "var(--good)" : "var(--bad)" }}
                  >
                    {a.correct ? <Check size={13} /> : <X size={13} />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{a.question.prompt}</p>
                    {!a.correct && (
                      <p className="mt-1 text-sm text-muted">
                        You: <span className="text-bad">{a.given || "—"}</span> · Answer:{" "}
                        <span className="text-good">
                          {a.question.type === "short" ? a.question.answer : a.question.choices[a.question.correctIndex]}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <GameTopBar
        title="Quiz"
        subtitle={quiz.name}
        onExit={onExit}
        right={<span className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">{idx + 1}/{questions.length}</span>}
      />
      <ProgressBar value={(idx / questions.length) * 100} />

      <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="mt-5">
        <div className="card p-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {q.type === "mc" ? "Multiple choice" : q.type === "tf" ? "True or false" : "Short answer"}
          </span>
          <p className="mt-2 text-xl font-bold">{q.prompt}</p>
        </div>

        {q.type === "short" ? (
          <div className="mt-4">
            <Input
              autoFocus
              value={typed}
              disabled={revealed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Type your answer…"
              className="h-14 text-center text-lg"
            />
            {revealed && (
              <FeedbackBanner
                correct={answersMatch(typed, q.answer)}
                answer={q.answer}
              />
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {q.choices.map((choice, ci) => {
              if (!choice.trim() && q.type === "mc") return null;
              const isCorrect = ci === q.correctIndex;
              const isPicked = picked === ci;
              let style = "border-line bg-surface-2 hover:border-accent/60";
              if (revealed) {
                if (isCorrect) style = "border-good bg-good/15";
                else if (isPicked) style = "border-bad bg-bad/15";
                else style = "border-line opacity-60";
              } else if (isPicked) {
                style = "border-accent bg-accent-soft";
              }
              return (
                <button
                  key={ci}
                  disabled={revealed}
                  onClick={() => setPicked(ci)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[var(--radius-soft)] border-2 px-4 py-3.5 text-left text-sm font-medium transition-colors",
                    style,
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs">
                    {String.fromCharCode(65 + ci)}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {revealed && isCorrect && <Check size={16} className="text-good" />}
                  {revealed && isPicked && !isCorrect && <X size={16} className="text-bad" />}
                </button>
              );
            })}
          </div>
        )}

        <Button
          variant="fire"
          size="lg"
          className="mt-5 w-full"
          onClick={submit}
          disabled={!revealed && q.type !== "short" && picked === null}
        >
          {revealed ? (idx + 1 >= questions.length ? "See results" : "Next") : "Submit"}
          <ArrowRight size={18} />
        </Button>
      </motion.div>
    </div>
  );
}

function FeedbackBanner({ correct, answer }: { correct: boolean; answer: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-[var(--radius-soft)] p-3 text-center text-sm"
        style={{ background: correct ? "color-mix(in srgb, var(--good) 14%, transparent)" : "color-mix(in srgb, var(--bad) 14%, transparent)" }}
      >
        <span className="font-semibold" style={{ color: correct ? "var(--good)" : "var(--bad)" }}>
          {correct ? "Correct!" : "Not quite"}
        </span>
        {!correct && <span> — answer: <strong>{answer}</strong></span>}
      </motion.div>
    </AnimatePresence>
  );
}
