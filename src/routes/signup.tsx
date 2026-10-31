import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Inscription — WIL WOL AI" },
      { name: "description", content: "Créez votre compte WIL WOL AI." },
      { property: "og:title", content: "Inscription — WIL WOL AI" },
      { property: "og:description", content: "Créez votre compte WIL WOL AI." },
    ],
  }),
  component: Signup,
});

function Signup() {
  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Retrouvez vos conversations sur tous vos appareils."
      footer={<>Déjà inscrit ? <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom d'affichage</Label>
          <Input id="name" autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" autoComplete="new-password" minLength={8} required />
          <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
        </div>
        <Button type="submit" className="w-full" disabled>Créer mon compte (bientôt)</Button>
        <p className="text-xs text-muted-foreground">
          En créant un compte, vous acceptez les <Link to="/terms" className="underline">conditions d'utilisation</Link> et la <Link to="/privacy" className="underline">politique de confidentialité</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}
