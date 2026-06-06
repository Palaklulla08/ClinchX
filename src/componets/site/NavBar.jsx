import { Link, useLocation } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth, signOut } from "@/lib/auth";
import { LogOut, LayoutDashboard, FileSearch, MessageSquare } from "lucide-react";

export function Navbar() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {onHome ? (
              <>
                <a href="#features" className="hover:text-foreground transition">Features</a>
                <a href="#stats" className="hover:text-foreground transition">Intelligence</a>
                <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
              </>
            ) : (
              <Link to="/" className="hover:text-foreground transition">Home</Link>
            )}
            <Link to="/analyzer" className="inline-flex items-center gap-1.5 hover:text-foreground transition">
              <FileSearch className="h-4 w-4" /> Analyzer
            </Link>
            <Link to="/interview" className="inline-flex items-center gap-1.5 hover:text-foreground transition">
              <MessageSquare className="h-4 w-4" /> Mock Interview
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 hover:text-foreground transition">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Link to="/dashboard" className="hidden sm:inline-flex">
                <Button variant="hero" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut().then(() => (window.location.href = "/"))}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/auth"><Button variant="hero" size="sm">Get started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}