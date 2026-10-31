/**
 * Common contract for every WIL WOL AI inference engine (online or local).
 * The UI only talks to this interface, so providers can be swapped
 * without touching the chat screens.
 */
export type EngineId = "online" | "local";

export type EngineState =
  | "ready"
  | "not_configured" // online: no provider set up on the server
  | "not_installed" // local: no model downloaded / runtime missing
  | "unsupported" // device cannot run it
  | "error";

export interface EngineStatus {
  state: EngineState;
  label: string;
  detail: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateRequest {
  messages: ChatTurn[];
  signal?: AbortSignal;
}

export interface ChatEngine {
  id: EngineId;
  name: string;
  checkStatus(): Promise<EngineStatus>;
  /** Streams text chunks. Throws EngineUnavailableError when not ready. */
  generate(req: GenerateRequest): AsyncIterable<string>;
}

export class EngineUnavailableError extends Error {
  constructor(public status: EngineStatus) {
    super(status.detail);
    this.name = "EngineUnavailableError";
  }
}
