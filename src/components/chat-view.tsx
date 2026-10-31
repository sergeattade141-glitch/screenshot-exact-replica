import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowDown, Copy, RotateCcw, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Composer } from "./composer";
import { MessageContent } from "./message-content";
import {
  addMessage,
  removeMessage,
  useConversationList,
  type Conversation,
  type Message,
} from "@/lib/conversations";
import { settingsStore } from "@/lib/settings";
import { EngineUnavailableError, getEngine } from "@/lib/engines";
import { speak, stopSpeaking } from "@/lib/voice";
import { cn } from "@/lib/utils";

/** Conversations created from the home screen that still need a reply. */
export const pendingReplies = new Set<string>();

function MessageBubble({ msg, onRetry }: { msg: Message; onRetry?: (() => void) | undefined }) {
  const [speaking, setSpeaking] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      toast.success("Message copié");
    } catch {
      toast.error("Copie impossible");
    }
  };

  if (msg.role === "user") {
    return (
      <div className="group flex flex-col items-end gap-1">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-bubble px-4 py-2.5 text-[15px] text-bubble-foreground">
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <button onClick={copy} aria-label="Copier le message" className="p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100">
          <Copy className="size-3.5" />
        </button>
      </div>
    );
  }

  if (msg.role === "notice") {
    return (
      <div role="alert" className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex-1 space-y-2">
          <p className="font-medium">Aucune réponse générée</p>
          <p className="text-muted-foreground">{msg.content}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RotateCcw className="size-3.5" /> Réessayer
              </Button>
            )}
            <Button size="sm" variant="ghost" asChild>
              <Link to="/settings" hash="engines">Configurer un moteur</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group space-y-1 text-[15px]">
      <MessageContent text={msg.content} />
      <div className="flex gap-1 text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button onClick={copy} aria-label="Copier" className="rounded p-1 hover:text-foreground"><Copy className="size-3.5" /></button>
        <button
          aria-label={speaking ? "Arrêter la lecture" : "Écouter"}
          className="rounded p-1 hover:text-foreground"
          onClick={() => {
            if (speaking) { stopSpeaking(); setSpeaking(false); return; }
            if (speak(msg.content, () => setSpeaking(false))) setSpeaking(true);
          }}
        >
          {speaking ? <Square className="size-3.5" /> : <Volume2 className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function ChatView({ conversationId }: { conversationId: string }) {
  const conversations = useConversationList();
  const conv: Conversation | undefined = conversations.find((c) => c.id === conversationId);
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async (c: Conversation) => {
    const engine = getEngine(settingsStore.get().mode);
    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);
    let text = "";
    try {
      const history = c.messages
        .filter((m) => m.role !== "notice")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      for await (const chunk of engine.generate({ messages: history, signal: controller.signal })) {
        text += chunk;
      }
      if (text) addMessage(c.id, { role: "assistant", content: text });
    } catch (err) {
      if (controller.signal.aborted) {
        if (text) addMessage(c.id, { role: "assistant", content: text });
      } else {
        const detail = err instanceof EngineUnavailableError ? err.message : "Une erreur est survenue pendant la génération.";
        addMessage(c.id, { role: "notice", content: detail, error: true });
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (conv && pendingReplies.has(conv.id)) {
      pendingReplies.delete(conv.id);
      void generate(conv);
    }
  }, [conv, generate]);

  const messageCount = conv?.messages.length ?? 0;
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom) el.scrollTo({ top: el.scrollHeight });
  }, [messageCount, generating, atBottom]);

  if (!conv) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-medium">Conversation introuvable</p>
        <p className="text-sm text-muted-foreground">Elle a peut-être été supprimée de cet appareil.</p>
        <Button asChild><Link to="/">Nouvelle conversation</Link></Button>
      </div>
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    addMessage(conv.id, { role: "user", content: text });
    setDraft("");
    setAtBottom(true);
    void generate({ ...conv, messages: [...conv.messages, { id: "tmp", role: "user", content: text, createdAt: Date.now() }] });
  };

  const retry = (noticeId: string) => {
    removeMessage(conv.id, noticeId);
    void generate({ ...conv, messages: conv.messages.filter((m) => m.id !== noticeId) });
  };

  const lastId = conv.messages.at(-1)?.id;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
        }}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
          {conv.messages.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">Commencez la conversation ci-dessous.</p>
          )}
          {conv.messages.map((m) => (
            <MessageBubble key={m.id} msg={m} onRetry={m.role === "notice" && m.id === lastId ? () => retry(m.id) : undefined} />
          ))}
          {generating && (
            <div className="flex items-center gap-1.5 py-2" role="status" aria-label="Génération en cours">
              {[0, 150, 300].map((d) => (
                <span key={d} className="pulse-dot size-2 rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}
        </div>
      </div>
      {!atBottom && (
        <Button
          variant="outline"
          size="icon"
          aria-label="Aller aux derniers messages"
          className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-full shadow-soft"
          onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })}
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
      <div className={cn("mx-auto w-full max-w-3xl px-3 pb-3 md:px-4 md:pb-5")}>
        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={send}
          generating={generating}
          onStop={() => abortRef.current?.abort()}
          autoFocus
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          WIL WOL AI peut se tromper. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
}
