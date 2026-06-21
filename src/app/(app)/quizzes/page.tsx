"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Copy,
  Download,
  Gamepad2,
  ListChecks,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader, Stagger, StaggerItem } from "@/components/PageHeader";
import { Badge, Button, Card, Dialog, EmptyState, Field, Input, Textarea } from "@/components/ui";
import { useLibrary } from "@/store/library";
import { useHydrated } from "@/lib/use-hydrated";
import { ACCENTS } from "@/lib/theme-options";
import { download, relativeTime } from "@/lib/utils";
import { makeBundle } from "@/lib/transfer";

export default function QuizzesPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const quizzes = useLibrary((s) => s.quizzes);
  const createQuiz = useLibrary((s) => s.createQuiz);
  const deleteQuiz = useLibrary((s) => s.deleteQuiz);
  const duplicateQuiz = useLibrary((s) => s.duplicateQuiz);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(ACCENTS[1].value);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return;
    const id = createQuiz({ name, description: desc, color });
    setCreating(false);
    setName("");
    setDesc("");
    router.push(`/quizzes/edit?id=${id}`);
  };

  const exportQuiz = (id: string) => {
    const quiz = quizzes.find((q) => q.id === id);
    if (!quiz) return;
    download(`${quiz.name.replace(/\s+/g, "-").toLowerCase()}.learnferno.json`, JSON.stringify(makeBundle([], [quiz]), null, 2));
    setMenuFor(null);
  };

  return (
    <div>
      <PageHeader
        title="Quizzes"
        subtitle="Multiple choice, true / false, and short answer — your call."
        action={
          <Button variant="fire" onClick={() => setCreating(true)}>
            <Plus size={16} /> New quiz
          </Button>
        }
      />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListChecks size={22} />}
            title="No quizzes yet"
            hint="Build a quiz to test yourself with the quiz games."
            action={
              <Button variant="fire" onClick={() => setCreating(true)}>
                <Plus size={16} /> New quiz
              </Button>
            }
          />
        </Card>
      ) : (
        <Stagger>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <StaggerItem key={q.id}>
                <Card className="group relative flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className="grid h-11 w-11 place-items-center rounded-xl text-white"
                      style={{ background: q.color || "var(--accent)" }}
                    >
                      <ListChecks size={20} />
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuFor(menuFor === q.id ? null : q.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-surface-2 hover:text-text"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuFor === q.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-[var(--radius-soft)] border border-line bg-surface shadow-xl">
                            <Link href={`/quizzes/edit?id=${q.id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2">
                              <Pencil size={14} /> Edit
                            </Link>
                            <button onClick={() => { duplicateQuiz(q.id); setMenuFor(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2">
                              <Copy size={14} /> Duplicate
                            </button>
                            <button onClick={() => exportQuiz(q.id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2">
                              <Download size={14} /> Export
                            </button>
                            <button onClick={() => { setConfirmDel(q.id); setMenuFor(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-bad hover:bg-surface-2">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Link href={`/quizzes/edit?id=${q.id}`} className="mt-4 flex-1">
                    <h3 className="text-lg font-bold leading-tight">{q.name}</h3>
                    {q.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{q.description}</p>}
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge color={q.color}>{q.questions.length} questions</Badge>
                    <span className="text-xs text-faint">{relativeTime(q.updatedAt)}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/quizzes/edit?id=${q.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full"><Pencil size={14} /> Edit</Button>
                    </Link>
                    <Link href={`/play?type=quiz&id=${q.id}`} className="flex-1">
                      <Button variant="soft" size="sm" className="w-full"><Gamepad2 size={14} /> Play</Button>
                    </Link>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New quiz"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="fire" onClick={submit} disabled={!name.trim()}>Create & add questions</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Quiz name">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Chapter 4 — The Cold War"
            />
          </Field>
          <Field label="Description (optional)">
            <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's this quiz about?" />
          </Field>
          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setColor(a.value)}
                  className="h-8 w-8 rounded-full transition"
                  style={{ background: a.value, boxShadow: color === a.value ? `0 0 0 2px var(--surface), 0 0 0 4px ${a.value}` : "none" }}
                  title={a.name}
                />
              ))}
            </div>
          </Field>
        </div>
      </Dialog>

      <Dialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Delete quiz?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDel(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { if (confirmDel) deleteQuiz(confirmDel); setConfirmDel(null); }}>
              <Trash2 size={16} /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This permanently removes the quiz and all its questions.</p>
      </Dialog>
    </div>
  );
}
