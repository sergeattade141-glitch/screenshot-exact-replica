import { useCallback, useEffect, useRef, useState } from "react";
import { settingsStore } from "./settings";

/* ---------- Speech recognition (browser Web Speech API) ---------- */

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const errorMessages: Record<string, string> = {
  "not-allowed": "Accès au microphone refusé. Autorisez-le dans les réglages du navigateur.",
  "service-not-allowed": "La reconnaissance vocale est bloquée par le navigateur.",
  "no-speech": "Aucune parole détectée. Réessayez.",
  "audio-capture": "Aucun microphone détecté.",
  network: "La reconnaissance vocale du navigateur nécessite Internet.",
};

export function useDictation(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SR | null>(null);

  useEffect(() => setSupported(!!getRecognitionCtor()), []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError(null);
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      if (text.trim()) onText(text.trim());
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted") setError(errorMessages[e.error] ?? "Erreur de reconnaissance vocale.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [onText]);

  const cancel = useCallback(() => {
    recRef.current?.abort();
    setListening(false);
  }, []);

  return { supported, listening, error, start, cancel, clearError: () => setError(null) };
}

/* ---------- Speech synthesis ---------- */

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

export function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const { voiceURI, voiceRate, voiceVolume } = settingsStore.get();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = voiceRate;
  u.volume = voiceVolume;
  const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI);
  if (voice) u.voice = voice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
