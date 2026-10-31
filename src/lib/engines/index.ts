import type { ChatEngine, EngineId, EngineStatus } from "./types";
import { EngineUnavailableError } from "./types";

// Phase 1: no engine is connected yet. Both adapters report their real state
// honestly and never fabricate answers.

const onlineStatus: EngineStatus = {
  state: "not_configured",
  label: "Moteur en ligne non configuré",
  detail:
    "Aucun fournisseur d'IA en ligne n'est encore relié à WIL WOL AI. Il sera branché côté serveur (clé secrète jamais exposée au navigateur) lors de la phase 3.",
};

const localStatus: EngineStatus = {
  state: "not_installed",
  label: "Aucun modèle local installé",
  detail:
    "Le moteur local autonome (sans Ollama) n'est pas encore intégré. Il sera ajouté en phase 4, avec un téléchargement de modèle soumis à votre autorisation.",
};

function unavailableEngine(id: EngineId, name: string, status: EngineStatus): ChatEngine {
  return {
    id,
    name,
    async checkStatus() {
      return status;
    },
    // eslint-disable-next-line require-yield
    async *generate() {
      throw new EngineUnavailableError(status);
    },
  };
}

const engines: Record<EngineId, ChatEngine> = {
  online: unavailableEngine("online", "Moteur en ligne", onlineStatus),
  local: unavailableEngine("local", "Moteur local", localStatus),
};

export function getEngine(id: EngineId): ChatEngine {
  return engines[id];
}

export * from "./types";
