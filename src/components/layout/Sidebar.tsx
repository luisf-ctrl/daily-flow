import { NavLink } from "react-router-dom";
import { Home, Target, Wallet, Dumbbell, NotebookPen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/habits", label: "Habits", icon: Target },
  { to: "/money", label: "Money", icon: Wallet },
  { to: "/body", label: "Body", icon: Dumbbell },
  { to: "/notes", label: "Notes", icon: NotebookPen },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-sidebar px-4 py-6 gap-1">
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
            D
          </div>
          <div>
            <div className="font-semibold tracking-tight">Daily Tracker</div>
            <div className="text-[11px] text-muted-foreground">Local-first</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
            )
          }
        >
          <Settings className="h-4 w-4" />
          Einstellungen
        </NavLink>
      </div>
    </aside>
  );
}
