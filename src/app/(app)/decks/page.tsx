"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Copy,
  Download,
  Gamepad2,
  Layers,
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

export default function DecksPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const decks = useLibrary((s) => s.decks);
  const createDeck = useLibrary((s) => s.createDeck);
  const deleteDeck = useLibrary((s) => s.deleteDeck);
  const duplicateDeck = useLibrary((s) => s.duplicateDeck);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(ACCENTS[0].value);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return;
    const id = createDeck({ name, description: desc, color });
    setCreating(false);
    setName("");
    setDesc("");
    router.push(`/decks/edit?id=${id}`);
  };

  const exportDeck = (id: string) => {
    const deck = decks.find((d) => d.id === id);
    if (!deck) return;
    download(`${deck.name.replace(/\s+/g, "-").toLowerCase()}.learnferno.json`, JSON.stringify(makeBundle([deck], []), null, 2));
    setMenuFor(null);
  };

  return (
    <div>
      <PageHeader
        title="Flashcards"
        subtitle="Decks of cards with a term on the front and the answer on the back."
        action={
          <Button variant="fire" onClick={() => setCreating(true)}>
            <Plus size={16} /> New deck
          </Button>
        }
      />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Layers size={22} />}
            title="No decks yet"
            hint="Create your first flashcard deck to get studying."
            action={
              <Button variant="fire" onClick={() => setCreating(true)}>
                <Plus size={16} /> New deck
              </Button>
            }
          />
        </Card>
      ) : (
        <Stagger>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((d) => (
              <StaggerItem key={d.id}>
                <Card className="group relative flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className="grid h-11 w-11 place-items-center rounded-xl text-white"
                      style={{ background: d.color || "var(--accent)" }}
                    >
                      <Layers size={20} />
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuFor(menuFor === d.id ? null : d.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-surface-2 hover:text-text"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuFor === d.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-[var(--radius-soft)] border border-line bg-surface shadow-xl">
                            <Link
                              href={`/decks/edit?id=${d.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
                            >
                              <Pencil size={14} /> Edit
                            </Link>
                            <button
                              onClick={() => { duplicateDeck(d.id); setMenuFor(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
                            >
                              <Copy size={14} /> Duplicate
                            </button>
                            <button
                              onClick={() => exportDeck(d.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
                            >
                              <Download size={14} /> Export
                            </button>
                            <button
                              onClick={() => { setConfirmDel(d.id); setMenuFor(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-bad hover:bg-surface-2"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Link href={`/decks/edit?id=${d.id}`} className="mt-4 flex-1">
                    <h3 className="text-lg font-bold leading-tight">{d.name}</h3>
                    {d.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{d.description}</p>
                    )}
                  </Link>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge color={d.color}>{d.cards.length} cards</Badge>
                    <span className="text-xs text-faint">{relativeTime(d.updatedAt)}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/decks/edit?id=${d.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil size={14} /> Edit
                      </Button>
                    </Link>
                    <Link href={`/play?type=deck&id=${d.id}`} className="flex-1">
                      <Button variant="soft" size="sm" className="w-full">
                        <Gamepad2 size={14} /> Study
                      </Button>
                    </Link>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      )}

      {/* create dialog */}
      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New flashcard deck"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="fire" onClick={submit} disabled={!name.trim()}>
              Create & add cards
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Deck name">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Biology — Cell Structure"
            />
          </Field>
          <Field label="Description (optional)">
            <Textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's this deck about?"
            />
          </Field>
          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setColor(a.value)}
                  className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition"
                  style={{
                    background: a.value,
                    boxShadow: color === a.value ? `0 0 0 2px ${a.value}` : "none",
                    ["--tw-ring-color" as string]: color === a.value ? a.value : "transparent",
                  }}
                  title={a.name}
                />
              ))}
            </div>
          </Field>
        </div>
      </Dialog>

      {/* delete confirm */}
      <Dialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Delete deck?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDel(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => { if (confirmDel) deleteDeck(confirmDel); setConfirmDel(null); }}
            >
              <Trash2 size={16} /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          This permanently removes the deck and all its cards. This can't be undone.
        </p>
      </Dialog>
    </div>
  );
}
