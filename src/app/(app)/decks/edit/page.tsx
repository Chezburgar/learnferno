"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  GripVertical,
  Gamepad2,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { Button, Card, EmptyState, Input, Textarea } from "@/components/ui";
import { useLibrary } from "@/store/library";
import { useHydrated } from "@/lib/use-hydrated";
import { download } from "@/lib/utils";
import { makeBundle } from "@/lib/transfer";

function DeckEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const hydrated = useHydrated();

  const deck = useLibrary((s) => s.decks.find((d) => d.id === id));
  const updateDeck = useLibrary((s) => s.updateDeck);
  const addCard = useLibrary((s) => s.addCard);
  const updateCard = useLibrary((s) => s.updateCard);
  const deleteCard = useLibrary((s) => s.deleteCard);

  const [bulkOpen, setBulkOpen] = useState(false);

  if (!hydrated) {
    return <div className="skeleton h-64" />;
  }

  if (!deck) {
    return (
      <Card>
        <EmptyState
          icon={<Layers size={22} />}
          title="Deck not found"
          hint="It may have been deleted."
          action={
            <Link href="/decks">
              <Button variant="outline"><ArrowLeft size={16} /> Back to decks</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const exportDeck = () =>
    download(
      `${deck.name.replace(/\s+/g, "-").toLowerCase()}.learnferno.json`,
      JSON.stringify(makeBundle([deck], []), null, 2),
    );

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/decks" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportDeck}>
          <Download size={14} /> Export
        </Button>
        <Link href={`/play?type=deck&id=${deck.id}`}>
          <Button variant="fire" size="sm"><Gamepad2 size={14} /> Study</Button>
        </Link>
      </div>

      {/* deck meta */}
      <Card className="mb-5 p-5">
        <input
          value={deck.name}
          onChange={(e) => updateDeck(deck.id, { name: e.target.value })}
          className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-faint"
          placeholder="Deck name"
        />
        <textarea
          value={deck.description ?? ""}
          onChange={(e) => updateDeck(deck.id, { description: e.target.value })}
          className="mt-2 w-full resize-none bg-transparent text-sm text-muted outline-none placeholder:text-faint"
          rows={1}
          placeholder="Add a description…"
        />
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">
          {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setBulkOpen((v) => !v)}>
            Bulk add
          </Button>
          <Button variant="soft" size="sm" onClick={() => addCard(deck.id)}>
            <Plus size={14} /> Add card
          </Button>
        </div>
      </div>

      {bulkOpen && <BulkAdd deckId={deck.id} onDone={() => setBulkOpen(false)} />}

      {deck.cards.length === 0 && !bulkOpen ? (
        <Card>
          <EmptyState
            icon={<Plus size={22} />}
            title="No cards yet"
            hint="Add cards one at a time, or paste a whole list with Bulk add."
            action={
              <Button variant="fire" onClick={() => addCard(deck.id)}>
                <Plus size={16} /> Add first card
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {deck.cards.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <Card className="flex items-stretch gap-3 p-3">
                  <div className="hidden w-8 flex-col items-center justify-center text-faint sm:flex">
                    <span className="text-xs font-semibold">{i + 1}</span>
                    <GripVertical size={14} className="mt-1" />
                  </div>
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span className="mb-1 block text-xs font-medium text-faint">Front (term)</span>
                      <Textarea
                        rows={2}
                        value={c.front}
                        onChange={(e) => updateCard(deck.id, c.id, { front: e.target.value })}
                        placeholder="Term or question"
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-xs font-medium text-faint">Back (answer)</span>
                      <Textarea
                        rows={2}
                        value={c.back}
                        onChange={(e) => updateCard(deck.id, c.id, { back: e.target.value })}
                        placeholder="Definition or answer"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCard(deck.id, c.id)}
                    className="grid w-9 place-items-center rounded-[var(--radius-soft)] text-faint hover:bg-bad/15 hover:text-bad"
                    title="Delete card"
                  >
                    <Trash2 size={16} />
                  </button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button variant="outline" className="w-full" onClick={() => addCard(deck.id)}>
            <Plus size={16} /> Add card
          </Button>
        </div>
      )}
    </div>
  );
}

function BulkAdd({ deckId, onDone }: { deckId: string; onDone: () => void }) {
  const addCard = useLibrary((s) => s.addCard);
  const [text, setText] = useState("");

  const apply = () => {
    let added = 0;
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t) continue;
      const parts = t.split(/\t|  +| \| | - /);
      if (parts.length < 2) continue;
      addCard(deckId, { front: parts[0].trim(), back: parts.slice(1).join(" ").trim() });
      added++;
    }
    setText("");
    if (added) onDone();
  };

  return (
    <Card className="mb-3 p-4">
      <p className="mb-2 text-sm font-medium">Paste cards — one per line</p>
      <p className="mb-3 text-xs text-muted">
        Separate the term and definition with a <strong>Tab</strong>, two spaces, <code>|</code>, or <code> - </code>.
      </p>
      <Textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"France\tParis\nJapan\tTokyo\nmitochondria - the powerhouse of the cell"}
        className="font-mono text-xs"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone}>Close</Button>
        <Button variant="fire" size="sm" onClick={apply}>Add cards</Button>
      </div>
    </Card>
  );
}

export default function DeckEditPage() {
  return (
    <Suspense fallback={<div className="skeleton h-64" />}>
      <DeckEditor />
    </Suspense>
  );
}
