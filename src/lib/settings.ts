import { createPersistentStore } from "./store";

export type EngineMode = "online" | "local";
export type Theme = "light" | "dark" | "system";

export interface Settings {
  theme: Theme;
  mode: EngineMode;
  voiceURI: string | null;
  voiceRate: number;
  voiceVolume: number;
  memoryEnabled: boolean;
  saveLocalHistory: boolean;
}

export const defaultSettings: Settings = {
  theme: "light",
  mode: "online",
  voiceURI: null,
  voiceRate: 1,
  voiceVolume: 1,
  memoryEnabled: false,
  saveLocalHistory: true,
};

export const settingsStore = createPersistentStore<Settings>("wilwol.settings", defaultSettings);
export const useSettings = settingsStore.useStore;
export const updateSettings = (patch: Partial<Settings>) =>
  settingsStore.set((s) => ({ ...s, ...patch }));
