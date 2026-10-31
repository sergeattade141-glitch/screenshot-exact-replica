import { useSyncExternalStore } from "react";

/** Tiny localStorage-backed store usable with React (SSR-safe). */
export function createPersistentStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) value = { ...initial, ...JSON.parse(raw) } as T;
      if (Array.isArray(initial) && raw) value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  };

  const get = () => {
    load();
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    load();
    value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  const reset = () => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    value = initial;
    listeners.forEach((l) => l());
  };

  const useStore = () => useSyncExternalStore(subscribe, get, () => initial);

  return { get, set, subscribe, reset, useStore };
}
