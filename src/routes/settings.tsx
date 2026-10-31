import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { settingsStore, updateSettings, useSettings, type Theme } from "@/lib/settings";
import { clearAllConversations, useConversationList } from "@/lib/conversations";
import { getEngine, type EngineStatus } from "@/lib/engines";
import { speak, useVoices } from "@/lib/voice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — WIL WOL AI" },
      { name: "description", content: "Réglez l'apparence, la voix, les moteurs et vos données." },
      { property: "og:title", content: "Paramètres — WIL WOL AI" },
      { property: "og:description", content: "Réglez l'apparence, la voix, les moteurs et vos données." },
    ],
  }),
  component: SettingsPage,
});

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-2xl border bg-card p-5 shadow-soft">
      <h2 className="font-medium">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Pending({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{children}</p>;
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg border bg-muted p-0.5 text-sm">
      {options.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={cn("rounded-md px-3 py-1", value === o.v ? "bg-card shadow-soft" : "text-muted-foreground hover:text-foreground")}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function EngineCard({ id }: { id: "online" | "local" }) {
  const [status, setStatus] = useState<EngineStatus | null>(null);
  useEffect(() => { void getEngine(id).checkStatus().then(setStatus); }, [id]);
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className={cn("size-2 rounded-full", status?.state === "ready" ? "bg-success" : "bg-warning")} />
        {status?.label ?? "Vérification…"}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{status?.detail}</p>
    </div>
  );
}

function DeviceCheck() {
  const [info, setInfo] = useState<{ ram?: number; webgpu: boolean; cores?: number } | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; gpu?: unknown };
    setInfo({ ram: nav.deviceMemory, webgpu: !!nav.gpu, cores: navigator.hardwareConcurrency });
  }, []);
  if (!info) return null;
  return (
    <ul className="space-y-1 text-xs text-muted-foreground">
      <li>Mémoire signalée par le navigateur : {info.ram ? `≈ ${info.ram} Go (valeur plafonnée par le navigateur)` : "inconnue"}</li>
      <li>Processeur : {info.cores ?? "?"} cœurs logiques</li>
      <li>Accélération WebGPU : {info.webgpu ? "disponible" : "non disponible"}</li>
    </ul>
  );
}

function SettingsPage() {
  const s = useSettings();
  const voices = useVoices();
  const conversations = useConversationList();
  const frVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("fr"));
  const shownVoices = frVoices.length ? frVoices : voices;

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild aria-label="Retour"><Link to="/"><ArrowLeft className="size-4" /></Link></Button>
            <h1 className="font-display text-2xl font-medium">Paramètres</h1>
          </div>

          <Section id="profile" title="Profil" desc="Nom d'affichage, e-mail et suppression du compte.">
            <Pending>Disponible après l'activation des comptes (prochaine étape). <Link to="/login" className="underline">Connexion</Link></Pending>
          </Section>

          <Section id="appearance" title="Apparence">
            <Row label="Thème">
              <Segmented<Theme> label="Thème" value={s.theme} onChange={(theme) => updateSettings({ theme })} options={[{ v: "light", l: "Clair" }, { v: "dark", l: "Sombre" }, { v: "system", l: "Système" }]} />
            </Row>
            <Row label="Langue de l'interface" hint="Seul le français est disponible pour l'instant.">
              <span className="text-sm text-muted-foreground">Français</span>
            </Row>
          </Section>

          <Section id="mode" title="Mode du moteur" desc="Choisissez le moteur utilisé pour vos prochaines conversations.">
            <Row label="Mode actif">
              <Segmented label="Mode" value={s.mode} onChange={(mode) => updateSettings({ mode })} options={[{ v: "online", l: "En ligne" }, { v: "local", l: "Local" }]} />
            </Row>
          </Section>

          <Section id="engines" title="Moteurs d'IA" desc="État réel de chaque moteur. Aucune réponse n'est simulée.">
            <p className="text-sm font-medium">Moteur en ligne</p>
            <EngineCard id="online" />
            <p className="pt-2 text-sm font-medium">Moteur local (sans Ollama)</p>
            <EngineCard id="local" />
            <DeviceCheck />
          </Section>

          <Section id="voice" title="Voix" desc="Lecture des réponses avec les voix de votre appareil.">
            <Row label="Voix" hint={shownVoices.length ? "« Hors ligne » = voix installée sur l'appareil." : "Aucune voix détectée sur cet appareil."}>
              <select
                aria-label="Voix"
                value={s.voiceURI ?? ""}
                onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                className="max-w-56 rounded-lg border bg-background px-2 py-1.5 text-sm"
              >
                <option value="">Par défaut</option>
                {shownVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name}{v.localService ? " · hors ligne" : " · en ligne"}</option>
                ))}
              </select>
            </Row>
            <Row label={`Vitesse : ${s.voiceRate.toFixed(1)}×`}>
              <Slider className="w-40" min={0.5} max={2} step={0.1} value={[s.voiceRate]} onValueChange={([v]) => updateSettings({ voiceRate: v ?? 1 })} aria-label="Vitesse" />
            </Row>
            <Row label={`Volume : ${Math.round(s.voiceVolume * 100)} %`}>
              <Slider className="w-40" min={0} max={1} step={0.05} value={[s.voiceVolume]} onValueChange={([v]) => updateSettings({ voiceVolume: v ?? 1 })} aria-label="Volume" />
            </Row>
            <Button variant="outline" size="sm" onClick={() => { if (!speak("Bonjour, je suis WIL WOL AI.")) toast.error("Synthèse vocale indisponible sur ce navigateur."); }}>
              <Volume2 className="size-4" /> Tester la voix
            </Button>
            <Pending>La reconnaissance vocale hors ligne arrivera avec le moteur local.</Pending>
          </Section>

          <Section id="memory" title="Mémoire personnelle" desc="Informations que l'assistant pourra retenir, avec votre accord.">
            <Row label="Autoriser la mémorisation" hint="Désactivée par défaut. Rien n'est mémorisé pour l'instant.">
              <Switch checked={s.memoryEnabled} onCheckedChange={(memoryEnabled) => updateSettings({ memoryEnabled })} aria-label="Autoriser la mémorisation" />
            </Row>
            <Pending>Aucune information mémorisée. La consultation et la modification arriveront avec le moteur conversationnel.</Pending>
          </Section>

          <Section id="history" title="Historique et données locales" desc="Vos conversations sont stockées dans ce navigateur.">
            <Row label="Conserver l'historique sur cet appareil" hint="Si désactivé, les nouvelles conversations disparaissent à la fermeture.">
              <Switch checked={s.saveLocalHistory} onCheckedChange={(saveLocalHistory) => updateSettings({ saveLocalHistory })} aria-label="Conserver l'historique" />
            </Row>
            <Row label={`${conversations.length} conversation${conversations.length > 1 ? "s" : ""} enregistrée${conversations.length > 1 ? "s" : ""}`}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">Effacer les données locales</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Effacer toutes les données locales ?</AlertDialogTitle>
                    <AlertDialogDescription>Toutes les conversations et tous les réglages de ce navigateur seront supprimés.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { clearAllConversations(); settingsStore.reset(); toast.success("Données locales effacées"); }}>
                      Tout effacer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Row>
          </Section>

          <Section id="privacy" title="Confidentialité">
            <p className="text-sm text-muted-foreground">Vos données ne servent jamais à entraîner un modèle sans votre accord explicite.</p>
            <div className="flex gap-4 text-sm">
              <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>
              <Link to="/terms" className="text-primary hover:underline">Conditions d'utilisation</Link>
            </div>
          </Section>

          <Section id="about" title="À propos">
            <p className="text-sm text-muted-foreground">WIL WOL AI · version 0.1 (phase 1 : interface). Aucun modèle tiers n'est présenté comme le nôtre.</p>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
