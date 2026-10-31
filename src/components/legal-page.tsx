import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./app-shell";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center px-4 py-5"><Link to="/"><Logo /></Link></header>
      <article className="mx-auto max-w-3xl space-y-4 px-4 pb-16 text-[15px] leading-relaxed">
        <h1 className="font-display text-3xl font-medium">{title}</h1>
        <p className="rounded-lg bg-warning/10 p-3 text-sm">Document provisoire, à faire valider juridiquement avant l'ouverture publique du service.</p>
        {children}
      </article>
    </div>
  );
}
