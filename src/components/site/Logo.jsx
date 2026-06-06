import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight">CareerOS</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">AI</span>
      </div>
    </Link>
  );
}