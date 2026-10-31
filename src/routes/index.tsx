import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Cloud, FileText, HardDrive, Lightbulb, ListChecks, Mic, Terminal } from "lucide-react";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { pendingReplies } from "@/components/chat-view";
import { createConversation } from "@/lib/conversations";
import { updateSettings } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WIL WOL AI — Votre assistant personnel" },
      { name: "description", content: "Dialoguez par texte ou par voix avec WIL WOL AI, en ligne ou en local." },
      { property: "og:title", content: "WIL WOL AI — Votre assistant personnel" },
      { property: "og:description", content: "Dialoguez par texte ou par voix avec WIL WOL AI, en ligne ou en local." },
    ],
  }),
  component: Home,
});

const suggestions = [
  { icon: BookOpen, text: "Aide-moi à apprendre quelque chose." },
  { icon: Lightbulb, text: "Explique-moi un concept simplement." },
  { icon: ListChecks, text: "Aide-moi à organiser mon projet." },
  { icon: FileText, text: "Aide-moi à écrire un document." },
  { icon: Terminal, text: "Aide-moi à résoudre un problème informatique." },
];

function Home() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");

  const start = (text: string) => {
    const conv = createConversation(text);
    pendingReplies.add(conv.id);
    navigate({ to: "/c/$id", params: { id: conv.id } });
  };

  return (
    <AppShell>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-10">
          <div className="space-y-3 text-center">
            <div className="flex justify-center sm:hidden"><StatusBadge /></div>
            <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
              Bonjour, que puis-je faire pour vous&nbsp;?
            </h1>
            <p className="mx-auto max-w-md text-muted-foreground">
              WIL WOL AI est votre assistant personnel. Écrivez ou parlez, en ligne ou en local.
            </p>
          </div>

          <Composer value={draft} onChange={setDraft} onSubmit={() => start(draft.trim())} autoFocus placeholder="Posez votre question…" />

          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map(({ icon: Icon, text }) => (
              <button
                key={text}
                onClick={() => { setDraft(text); document.getElementById("composer")?.focus(); }}
                className="flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
              >
                <Icon className="size-4 text-primary" />
                {text}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <QuickCard icon={Cloud} title="Mode en ligne" desc="Moteur connecté par Internet" onClick={() => updateSettings({ mode: "online" })} />
            <QuickCard icon={HardDrive} title="Mode local" desc="Fonctionne sans Internet" onClick={() => updateSettings({ mode: "local" })} />
            <QuickCard
              icon={Mic}
              title="Conversation vocale"
              desc="Dictez avec le micro"
              onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Dicter un message"]')?.click()}
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
            {" ou "}
            <Link to="/signup" className="font-medium text-primary hover:underline">créer un compte</Link>
            {" pour retrouver vos conversations partout."}
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function QuickCard({ icon: Icon, title, desc, onClick }: { icon: typeof Cloud; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-soft transition-colors hover:border-ring/40">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="size-4" /></span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}
