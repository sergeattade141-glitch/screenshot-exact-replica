import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Confidentialité — WIL WOL AI" },
      { name: "description", content: "Comment WIL WOL AI traite vos données." },
      { property: "og:title", content: "Confidentialité — WIL WOL AI" },
      { property: "og:description", content: "Comment WIL WOL AI traite vos données." },
    ],
  }),
  component: () => (
    <LegalPage title="Politique de confidentialité">
      <h2 className="text-lg font-semibold">Données stockées sur votre appareil</h2>
      <p>Dans cette version, vos conversations et réglages sont conservés uniquement dans le stockage de votre navigateur. Vous pouvez les effacer à tout moment depuis les paramètres.</p>
      <h2 className="text-lg font-semibold">Voix</h2>
      <p>La dictée utilise la reconnaissance vocale de votre navigateur, qui peut transmettre l'audio au service en ligne de l'éditeur du navigateur.</p>
      <h2 className="text-lg font-semibold">Entraînement des modèles</h2>
      <p>Vos données ne sont jamais utilisées pour entraîner un modèle sans votre consentement explicite.</p>
    </LegalPage>
  ),
});
