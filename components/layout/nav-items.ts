import type { LucideIcon } from "lucide-react";
import { Home, CheckSquare, Wallet, Dumbbell, NotebookPen } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/habits", label: "Habits", icon: CheckSquare, shortcut: "h" },
  { href: "/money", label: "Money", icon: Wallet, shortcut: "m" },
  { href: "/body", label: "Body", icon: Dumbbell, shortcut: "b" },
  { href: "/notes", label: "Notes", icon: NotebookPen, shortcut: "n" },
];
