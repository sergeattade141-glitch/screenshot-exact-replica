import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  LogIn,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteConversation,
  renameConversation,
  useConversationList,
  type Conversation,
} from "@/lib/conversations";
import { useSettings } from "@/lib/settings";
import { useOnline } from "@/hooks/use-online";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-display text-lg font-semibold tracking-tight", className)}>
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        W
      </span>
      WIL WOL <span className="text-primary">AI</span>
    </span>
  );
}

function useApplyTheme() {
  const { theme } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark =
        theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}

export function StatusBadge() {
  const online = useOnline();
  const { mode } = useSettings();
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
      <span className={cn("size-2 rounded-full", online ? "bg-success" : "bg-destructive")} aria-hidden />
      <span>{online ? "Connecté" : "Hors ligne"}</span>
      <span className="text-border">·</span>
      <span>
        Mode {mode === "online" ? "en ligne" : "local"} : <span className="text-warning">non configuré</span>
      </span>
    </div>
  );
}

function ConversationItem({ conv, active, onNavigate }: { conv: Conversation; active: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conv.title);
  const [confirm, setConfirm] = useState(false);

  const save = () => {
    renameConversation(conv.id, title);
    setEditing(false);
  };

  if (editing) {
    return (
      <form
        className="flex items-center gap-1 rounded-lg bg-sidebar-accent px-2 py-1"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          aria-label="Nouveau titre"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button type="submit" aria-label="Valider" className="p-1 text-muted-foreground hover:text-foreground">
          <Check className="size-4" />
        </button>
        <button type="button" aria-label="Annuler" onClick={() => setEditing(false)} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </form>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center rounded-lg text-sm transition-colors hover:bg-sidebar-accent",
        active && "bg-sidebar-accent font-medium",
      )}
    >
      <Link
        to="/c/$id"
        params={{ id: conv.id }}
        onClick={onNavigate}
        className="min-w-0 flex-1 truncate px-3 py-2"
      >
        {conv.title}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions pour ${conv.title}`}
          className="mr-1 rounded p-1 text-muted-foreground opacity-100 hover:text-foreground md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => { setTitle(conv.title); setEditing(true); }}>
            <Pencil className="size-4" /> Renommer
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirm(true)}>
            <Trash2 className="size-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {conv.title} » sera définitivement supprimée de cet appareil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteConversation(conv.id);
                toast.success("Conversation supprimée");
                if (active) navigate({ to: "/" });
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const conversations = useConversationList();
  const params = useParams({ strict: false }) as { id?: string };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button asChild className="w-full justify-start gap-2" onClick={onNavigate}>
          <Link to="/">
            <Plus className="size-4" /> Nouvelle conversation
          </Link>
        </Button>
      </div>
      <nav aria-label="Conversations récentes" className="flex-1 overflow-y-auto px-2 pb-2">
        <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Récentes</p>
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="size-5" />
            Vos conversations apparaîtront ici.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {conversations.map((c) => (
              <ConversationItem key={c.id} conv={c} active={params.id === c.id} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </nav>
      <div className="flex flex-col gap-1 border-t border-sidebar-border p-2">
        <Link
          to="/login"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"
        >
          <LogIn className="size-4" /> Connexion / Inscription
        </Link>
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"
        >
          <Settings className="size-4" /> Paramètres
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  useApplyTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-0 overflow-hidden border-r-0" : "w-72",
        )}
        aria-hidden={collapsed}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <Button variant="ghost" size="icon" aria-label="Réduire la barre latérale" onClick={() => setCollapsed(true)}>
            <PanelLeftClose className="size-4" />
          </Button>
        </div>
        <SidebarBody />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="flex h-14 items-center px-4">
            <Logo />
          </SheetTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3 md:px-4">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>
          {collapsed && (
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Ouvrir la barre latérale" onClick={() => setCollapsed(false)}>
              <PanelLeftOpen className="size-4" />
            </Button>
          )}
          <Link to="/" className={cn("md:hidden", collapsed && "md:block")}><Logo className="text-base" /></Link>
          <div className="ml-auto hidden sm:block"><StatusBadge /></div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
