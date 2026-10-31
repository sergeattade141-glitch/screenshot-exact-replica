import { beforeEach, describe, expect, it } from "vitest";
import { addMessage, clearAllConversations, createConversation, deriveTitle, getConversation, renameConversation } from "@/lib/conversations";
import { getEngine, EngineUnavailableError } from "@/lib/engines";

describe("conversations", () => {
  beforeEach(() => clearAllConversations());

  it("titles a conversation from its first message", () => {
    const c = createConversation("Explique-moi un concept simplement.");
    expect(c.title).toBe("Explique-moi un concept simplement.");
  });

  it("truncates long titles to 48 characters", () => {
    expect(deriveTitle("a".repeat(100)).length).toBe(48);
  });

  it("ignores empty renames", () => {
    const c = createConversation("Bonjour");
    renameConversation(c.id, "   ");
    expect(getConversation(c.id)?.title).toBe("Bonjour");
  });

  it("appends messages in order", () => {
    const c = createConversation("Un");
    addMessage(c.id, { role: "user", content: "Deux" });
    expect(getConversation(c.id)?.messages.map((m) => m.content)).toEqual(["Un", "Deux"]);
  });
});

describe("engines never fabricate answers", () => {
  it.each(["online", "local"] as const)("%s engine refuses to generate when not set up", async (id) => {
    const it = getEngine(id).generate({ messages: [{ role: "user", content: "hi" }] })[Symbol.asyncIterator]();
    await expect(it.next()).rejects.toBeInstanceOf(EngineUnavailableError);
  });
});
