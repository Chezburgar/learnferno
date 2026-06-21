"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
  Gamepad2,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { Button, Card, EmptyState, Input, Segmented, Textarea } from "@/components/ui";
import { useLibrary } from "@/store/library";
import { useHydrated } from "@/lib/use-hydrated";
import { cn, download } from "@/lib/utils";
import { makeBundle } from "@/lib/transfer";
import type { Question, QuestionType } from "@/lib/types";

function QuizEditor() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const hydrated = useHydrated();

  const quiz = useLibrary((s) => s.quizzes.find((q) => q.id === id));
  const updateQuiz = useLibrary((s) => s.updateQuiz);
  const addQuestion = useLibrary((s) => s.addQuestion);
  const updateQuestion = useLibrary((s) => s.updateQuestion);
  const deleteQuestion = useLibrary((s) => s.deleteQuestion);

  if (!hydrated) return <div className="skeleton h-64" />;

  if (!quiz) {
    return (
      <Card>
        <EmptyState
          icon={<ListChecks size={22} />}
          title="Quiz not found"
          hint="It may have been deleted."
          action={<Link href="/quizzes"><Button variant="outline"><ArrowLeft size={16} /> Back to quizzes</Button></Link>}
        />
      </Card>
    );
  }

  const exportQuiz = () =>
    download(
      `${quiz.name.replace(/\s+/g, "-").toLowerCase()}.learnferno.json`,
      JSON.stringify(makeBundle([], [quiz]), null, 2),
    );

  const setType = (q: Question, type: QuestionType) => {
    const patch: Partial<Question> = { type };
    if (type === "tf") {
      patch.choices = ["True", "False"];
      patch.correctIndex = q.correctIndex > 1 ? 0 : q.correctIndex;
    } else if (type === "mc" && q.choices.length < 2) {
      patch.choices = ["", "", "", ""];
      patch.correctIndex = 0;
    }
    updateQuestion(quiz.id, q.id, patch);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/quizzes" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportQuiz}><Download size={14} /> Export</Button>
        <Link href={`/play?type=quiz&id=${quiz.id}`}>
          <Button variant="fire" size="sm"><Gamepad2 size={14} /> Play</Button>
        </Link>
      </div>

      <Card className="mb-5 p-5">
        <input
          value={quiz.name}
          onChange={(e) => updateQuiz(quiz.id, { name: e.target.value })}
          className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-faint"
          placeholder="Quiz name"
        />
        <textarea
          value={quiz.description ?? ""}
          onChange={(e) => updateQuiz(quiz.id, { description: e.target.value })}
          className="mt-2 w-full resize-none bg-transparent text-sm text-muted outline-none placeholder:text-faint"
          rows={1}
          placeholder="Add a description…"
        />
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">{quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}</h2>
      </div>

      {quiz.questions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Plus size={22} />}
            title="No questions yet"
            hint="Add your first question to start building the quiz."
            action={<Button variant="fire" onClick={() => addQuestion(quiz.id)}><Plus size={16} /> Add question</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {quiz.questions.map((q, i) => (
              <motion.div key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                <Card className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold text-accent">{i + 1}</span>
                    <Segmented<QuestionType>
                      value={q.type}
                      onChange={(t) => setType(q, t)}
                      options={[
                        { value: "mc", label: "Choice" },
                        { value: "tf", label: "T / F" },
                        { value: "short", label: "Typed" },
                      ]}
                    />
                    <div className="flex-1" />
                    <button
                      onClick={() => deleteQuestion(quiz.id, q.id)}
                      className="grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-bad/15 hover:text-bad"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <Textarea
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => updateQuestion(quiz.id, q.id, { prompt: e.target.value })}
                    placeholder="Type your question…"
                    className="mb-3 text-base"
                  />

                  {q.type === "short" ? (
                    <div>
                      <span className="mb-1 block text-xs font-medium text-faint">Accepted answer</span>
                      <Input
                        value={q.answer}
                        onChange={(e) => updateQuestion(quiz.id, q.id, { answer: e.target.value })}
                        placeholder="The correct answer"
                      />
                      <p className="mt-1.5 text-xs text-faint">Matching ignores case, spacing, punctuation and a leading “a/an/the”.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="block text-xs font-medium text-faint">
                        {q.type === "tf" ? "Pick the correct answer" : "Options — tap the circle to mark the correct one"}
                      </span>
                      {q.choices.map((choice, ci) => (
                        <div key={ci} className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuestion(quiz.id, q.id, { correctIndex: ci })}
                            className={cn(
                              "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition",
                              q.correctIndex === ci ? "border-good bg-good/15 text-good" : "border-line text-transparent hover:border-muted",
                            )}
                            title="Mark correct"
                          >
                            <Check size={14} />
                          </button>
                          {q.type === "tf" ? (
                            <div className="flex h-11 flex-1 items-center rounded-[var(--radius-soft)] border border-line bg-surface-2 px-3.5 text-sm">
                              {choice}
                            </div>
                          ) : (
                            <Input
                              value={choice}
                              onChange={(e) => {
                                const choices = [...q.choices];
                                choices[ci] = e.target.value;
                                updateQuestion(quiz.id, q.id, { choices });
                              }}
                              placeholder={`Option ${ci + 1}`}
                            />
                          )}
                          {q.type === "mc" && q.choices.length > 2 && (
                            <button
                              onClick={() => {
                                const choices = q.choices.filter((_, x) => x !== ci);
                                const correctIndex = q.correctIndex >= choices.length ? choices.length - 1 : q.correctIndex === ci ? 0 : q.correctIndex > ci ? q.correctIndex - 1 : q.correctIndex;
                                updateQuestion(quiz.id, q.id, { choices, correctIndex });
                              }}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-soft)] text-faint hover:text-bad"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {q.type === "mc" && q.choices.length < 6 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuestion(quiz.id, q.id, { choices: [...q.choices, ""] })}
                        >
                          <Plus size={14} /> Add option
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => addQuestion(quiz.id, { type: "mc" })}>
              <Plus size={16} /> Choice
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => addQuestion(quiz.id, { type: "tf", choices: ["True", "False"] })}>
              <Plus size={16} /> True / False
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => addQuestion(quiz.id, { type: "short", choices: [] })}>
              <Plus size={16} /> Typed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizEditPage() {
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <QuizEditor />
    </Suspense>
  );
}
