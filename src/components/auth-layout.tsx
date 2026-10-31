import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Logo } from "./app-shell";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <Link to="/" className="mb-8"><Logo /></Link>
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-2xl font-medium">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div role="note" className="mt-4 flex gap-2 rounded-lg bg-accent p-3 text-xs text-accent-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Les comptes seront activés à la prochaine étape. Ce formulaire n'envoie encore aucune donnée.
        </div>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
