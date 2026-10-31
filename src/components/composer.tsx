import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Cloud, HardDrive, Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateSettings, useSettings } from "@/lib/settings";
import { useDictation } from "@/lib/voice";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  generating?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export function Composer({ value, onChange, onSubmit, onStop, generating, autoFocus, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { mode } = useSettings();
  const [voiceNotice, setVoiceNotice] = useState(false);

  const append = useCallback(
    (t: string) => onChange(value ? `${value} ${t}` : t),
    [value, onChange],
  );
  const dictation = useDictation(append);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  useEffect(() => {
    if (dictation.error) {
      toast.error(dictation.error);
      dictation.clearError();
    }
  }, [dictation]);

  const onMic = () => {
    if (dictation.listening) return dictation.cancel();
    if (mode === "local") {
      toast.info("La reconnaissance vocale hors ligne n'est pas encore installée (phase 5). Passez en mode en ligne ou utilisez le texte.");
      return;
    }
    if (!dictation.supported) {
      toast.error("Votre navigateur ne propose pas la reconnaissance vocale. Essayez Chrome ou Edge.");
      return;
    }
    setVoiceNotice(true);
    dictation.start();
  };

  const canSend = value.trim().length > 0 && !generating;

  return (
    <div className="w-full">
      {dictation.listening && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border bg-accent px-4 py-2 text-sm text-accent-foreground" role="status">
          <span className="flex gap-1" aria-hidden>
            <span className="pulse-dot size-2 rounded-full bg-primary" />
            <span className="pulse-dot size-2 rounded-full bg-primary [animation-delay:150ms]" />
            <span className="pulse-dot size-2 rounded-full bg-primary [animation-delay:300ms]" />
          </span>
          <span className="flex-1">
            À l'écoute…
            {voiceNotice && (
              <span className="block text-xs opacity-80">
                Votre navigateur peut envoyer l'audio à son service de reconnaissance en ligne.
              </span>
            )}
          </span>
          <button onClick={dictation.cancel} className="flex items-center gap-1 text-xs font-medium hover:underline">
            <X className="size-3.5" /> Annuler
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
        className="rounded-2xl border bg-card p-2 shadow-composer transition-shadow focus-within:border-ring/50"
      >
        <label htmlFor="composer" className="sr-only">Votre message</label>
        <textarea
          id="composer"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (canSend) onSubmit();
            }
          }}
          placeholder={placeholder ?? "Écrivez votre message…"}
          className="block max-h-56 w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1 pt-1">
          <div className="flex rounded-full border bg-muted p-0.5 text-xs" role="radiogroup" aria-label="Mode du moteur">
            {(["online", "local"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => updateSettings({ mode: m })}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors",
                  mode === m ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "online" ? <Cloud className="size-3.5" /> : <HardDrive className="size-3.5" />}
                {m === "online" ? "En ligne" : "Local"}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant={dictation.listening ? "secondary" : "ghost"}
              size="icon"
              className="rounded-full"
              aria-label={dictation.listening ? "Arrêter l'écoute" : "Dicter un message"}
              aria-pressed={dictation.listening}
              onClick={onMic}
            >
              <Mic className={cn("size-4", dictation.listening && "text-primary")} />
            </Button>
            {generating ? (
              <Button type="button" size="icon" className="rounded-full" aria-label="Arrêter la génération" onClick={onStop}>
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon" className="rounded-full" aria-label="Envoyer" disabled={!canSend}>
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
