import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — WIL WOL AI" },
      { name: "description", content: "Réinitialisez le mot de passe de votre compte WIL WOL AI." },
      { property: "og:title", content: "Mot de passe oublié — WIL WOL AI" },
      { property: "og:description", content: "Réinitialisez le mot de passe de votre compte WIL WOL AI." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Recevez un lien de réinitialisation par e-mail."
      footer={<Link to="/login" className="font-medium text-primary hover:underline">Retour à la connexion</Link>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full" disabled>Envoyer le lien (bientôt)</Button>
      </form>
    </AuthLayout>
  );
}
