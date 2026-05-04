"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:gap-2 md:border-r md:border-white/[0.06] md:bg-background md:px-4 md:py-6">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 px-3"
        aria-label="Daily Flow Home"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Flame className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">Daily Flow</span>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Hauptnavigation">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/[0.04] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/settings")
              ? "bg-white/[0.04] text-foreground"
              : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Einstellungen</span>
        </Link>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Abmelden</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
