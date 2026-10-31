import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — WIL WOL AI" },
      { name: "description", content: "Conditions d'utilisation de WIL WOL AI." },
      { property: "og:title", content: "Conditions d'utilisation — WIL WOL AI" },
      { property: "og:description", content: "Conditions d'utilisation de WIL WOL AI." },
    ],
  }),
  component: () => (
    <LegalPage title="Conditions d'utilisation">
      <p>WIL WOL AI est fourni en version de démonstration. Les réponses d'une intelligence artificielle peuvent être inexactes : vérifiez toujours les informations importantes.</p>
      <p>Vous restez responsable de l'usage que vous faites de l'assistant et des contenus que vous lui soumettez. Ne partagez jamais vos mots de passe avec l'assistant.</p>
    </LegalPage>
  ),
});
