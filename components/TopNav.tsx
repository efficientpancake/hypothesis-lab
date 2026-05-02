"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/hypothesis", label: "🧪 Hypotheses" },
    { href: "/persona", label: "🎭 Persona Interview" },
    { href: "/learning", label: "📓 Learning Card" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-primary" />
          <span className="text-sm font-semibold tracking-tight">
            Hypothesis Lab
          </span>
        </div>
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(t.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
