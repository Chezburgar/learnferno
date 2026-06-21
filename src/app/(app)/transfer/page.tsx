"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  FileJson,
  FileUp,
  Layers,
  ListChecks,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, CardHeader, Field, Input, Segmented, Textarea } from "@/components/ui";
import { useLibrary } from "@/store/library";
import { useProgress } from "@/store/progress";
import { useHydrated } from "@/lib/use-hydrated";
import { download } from "@/lib/utils";
import { makeBundle, parseJsonImport, parseTextDeck } from "@/lib/transfer";

type Note = { kind: "ok" | "err"; msg: string } | null;

export default function TransferPage() {
  const hydrated = useHydrated();
  const decks = useLibrary((s) => s.decks);
  const quizzes = useLibrary((s) => s.quizzes);
  const importDecks = useLibrary((s) => s.importDecks);
  const importQuizzes = useLibrary((s) => s.importQuizzes);
  const replaceAll = useLibrary((s) => s.replaceAll);
  const resetProgress = useProgress((s) => s.reset);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteJson, setPasteJson] = useState("");
  const [jsonNote, setJsonNote] = useState<Note>(null);

  const [textName, setTextName] = useState("");
  const [textBody, setTextBody] = useState("");
  const [sep, setSep] = useState<"tab" | "comma" | "dash">("tab");
  const [textNote, setTextNote] = useState<Note>(null);

  const cardCount = decks.reduce((n, d) => n + d.cards.length, 0);
  const qCount = quizzes.reduce((n, q) => n + q.questions.length, 0);

  const exportAll = () => {
    download(
      `learnferno-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(makeBundle(decks, quizzes), null, 2),
    );
  };

  const ingestJson = (text: string) => {
    try {
      const { decks: nd, quizzes: nq } = parseJsonImport(text);
      if (nd.length) importDecks(nd);
      if (nq.length) importQuizzes(nq);
      setJsonNote({ kind: "ok", msg: `Imported ${nd.length} deck(s) and ${nq.length} quiz(zes).` });
      setPasteJson("");
    } catch (e) {
      setJsonNote({ kind: "err", msg: e instanceof Error ? e.message : "Could not read that file." });
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => ingestJson(String(reader.result));
    reader.onerror = () => setJsonNote({ kind: "err", msg: "Failed to read file." });
    reader.readAsText(file);
    e.target.value = "";
  };

  const importText = () => {
    const deck = parseTextDeck(textBody, textName || "Imported deck", sep);
    if (deck.cards.length === 0) {
      setTextNote({ kind: "err", msg: "No cards found — check your separator and that each line has a term and a definition." });
      return;
    }
    importDecks([deck]);
    setTextNote({ kind: "ok", msg: `Created “${deck.name}” with ${deck.cards.length} cards.` });
    setTextBody("");
    setTextName("");
  };

  return (
    <div>
      <PageHeader title="Import / Export" subtitle="Back up your library or bring in sets from elsewhere." />

      {/* overview */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent"><Layers size={20} /></div>
          <div>
            <p className="text-2xl font-bold">{hydrated ? decks.length : "—"}</p>
            <p className="text-sm text-muted">decks · {hydrated ? cardCount : "—"} cards</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent"><ListChecks size={20} /></div>
          <div>
            <p className="text-2xl font-bold">{hydrated ? quizzes.length : "—"}</p>
            <p className="text-sm text-muted">quizzes · {hydrated ? qCount : "—"} questions</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* export */}
        <Card>
          <CardHeader title="Export" icon={<Download size={16} />} />
          <div className="p-5 pt-3">
            <p className="text-sm text-muted">
              Download your entire library as a single <code>.json</code> file. Keep it as a backup or move it to another device.
            </p>
            <Button variant="fire" className="mt-4 w-full" onClick={exportAll} disabled={!hydrated || (decks.length === 0 && quizzes.length === 0)}>
              <Download size={16} /> Export everything
            </Button>
            <p className="mt-3 text-xs text-faint">
              Tip: you can also export a single deck or quiz from its card menu.
            </p>
          </div>
        </Card>

        {/* import json */}
        <Card>
          <CardHeader title="Import a backup" icon={<FileJson size={16} />} />
          <div className="p-5 pt-3">
            <p className="text-sm text-muted">
              Import a LearnFerno <code>.json</code> file (a full backup, or a single deck/quiz). Imported sets are added — nothing is overwritten.
            </p>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
            <Button variant="outline" className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
              <FileUp size={16} /> Choose a file
            </Button>

            <div className="mt-4">
              <Field label="…or paste JSON">
                <Textarea
                  rows={4}
                  value={pasteJson}
                  onChange={(e) => setPasteJson(e.target.value)}
                  placeholder='{ "app": "learnferno", "decks": [...], "quizzes": [...] }'
                  className="font-mono text-xs"
                />
              </Field>
              <Button variant="soft" size="sm" className="mt-2" onClick={() => ingestJson(pasteJson)} disabled={!pasteJson.trim()}>
                <Upload size={14} /> Import pasted JSON
              </Button>
            </div>

            {jsonNote && <NoteLine note={jsonNote} />}
          </div>
        </Card>
      </div>

      {/* import from text */}
      <Card className="mt-6">
        <CardHeader title="Import flashcards from text" icon={<FileUp size={16} />} />
        <div className="p-5 pt-3">
          <p className="text-sm text-muted">
            Paste a list (e.g. exported from Quizlet or a spreadsheet). One card per line; pick how the term and definition are separated.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="New deck name">
              <Input value={textName} onChange={(e) => setTextName(e.target.value)} placeholder="e.g. French Verbs" />
            </Field>
            <Field label="Separator between term & definition">
              <Segmented<"tab" | "comma" | "dash">
                value={sep}
                onChange={setSep}
                options={[
                  { value: "tab", label: "Tab / spaces" },
                  { value: "comma", label: "Comma" },
                  { value: "dash", label: "Dash" },
                ]}
              />
            </Field>
          </div>
          <Textarea
            rows={6}
            value={textBody}
            onChange={(e) => setTextBody(e.target.value)}
            placeholder={sep === "comma" ? "bonjour, hello\nmerci, thank you" : sep === "dash" ? "bonjour - hello\nmerci - thank you" : "bonjour\thello\nmerci\tthank you"}
            className="mt-4 font-mono text-xs"
          />
          <Button variant="fire" size="sm" className="mt-3" onClick={importText} disabled={!textBody.trim()}>
            <Upload size={14} /> Create deck from text
          </Button>
          {textNote && <NoteLine note={textNote} />}
        </div>
      </Card>

      {/* danger zone */}
      <Card className="mt-6 border-bad/30">
        <CardHeader title="Danger zone" icon={<AlertTriangle size={16} />} />
        <div className="space-y-3 p-5 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Reset XP & history</p>
              <p className="text-sm text-muted">Clears your level, streak and game history. Your decks and quizzes are kept.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => { if (confirm("Reset all progress (XP, streak, history)?")) resetProgress(); }}>
              Reset progress
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <div>
              <p className="font-medium">Delete everything</p>
              <p className="text-sm text-muted">Permanently removes all decks and quizzes. Export a backup first!</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => { if (confirm("Delete ALL decks and quizzes? This cannot be undone.")) replaceAll([], []); }}
            >
              Delete all sets
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function NoteLine({ note }: { note: { kind: "ok" | "err"; msg: string } }) {
  return (
    <div
      className="mt-3 flex items-start gap-2 rounded-[var(--radius-soft)] px-3 py-2 text-sm"
      style={{
        background: note.kind === "ok" ? "color-mix(in srgb, var(--good) 14%, transparent)" : "color-mix(in srgb, var(--bad) 14%, transparent)",
        color: note.kind === "ok" ? "var(--good)" : "var(--bad)",
      }}
    >
      {note.kind === "ok" ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
      <span>{note.msg}</span>
    </div>
  );
}
