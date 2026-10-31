import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ChatView } from "@/components/chat-view";

export const Route = createFileRoute("/c/$id")({
  head: () => ({
    meta: [
      { title: "Conversation — WIL WOL AI" },
      { name: "description", content: "Votre conversation avec WIL WOL AI." },
      { property: "og:title", content: "Conversation — WIL WOL AI" },
      { property: "og:description", content: "Votre conversation avec WIL WOL AI." },
    ],
  }),
  ssr: false,
  component: ConversationPage,
});

function ConversationPage() {
  const { id } = Route.useParams();
  return (
    <AppShell>
      <ChatView key={id} conversationId={id} />
    </AppShell>
  );
}
