import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — WIL WOL AI" },
      { name: "description", content: "Connectez-vous à votre compte WIL WOL AI." },
      { property: "og:title", content: "Connexion — WIL WOL AI" },
      { property: "og:description", content: "Connectez-vous à votre compte WIL WOL AI." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Heureux de vous revoir."
      footer={<>Pas encore de compte ? <Link to="/signup" className="font-medium text-primary hover:underline">Créer un compte</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Mot de passe oublié ?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" className="w-full" disabled>Se connecter (bientôt)</Button>
      </form>
    </AuthLayout>
  );
}
