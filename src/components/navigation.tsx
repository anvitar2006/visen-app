import type { ReactNode } from "react";
import {
  CalendarDays,
  LayoutGrid,
  Leaf,
  Target,
  type LucideIcon,
} from "lucide-react";
export type View = "Today" | "Week" | "My Vision" | "Habits" | "Sana";
/** Only available views belong here. Future features must not appear as dead links. */
export const primaryNavigation = [
  { name: "Today", icon: LayoutGrid },
  { name: "Week", icon: CalendarDays },
  { name: "My Vision", icon: Target },
  { name: "Habits", icon: Leaf },
] satisfies { name: View; icon: LucideIcon }[];
export function NavigationButton({
  view,
  active,
  icon,
  label = view,
  trailing,
  onNavigate,
}: {
  view: View;
  active: boolean;
  icon: ReactNode;
  label?: string;
  trailing?: ReactNode;
  onNavigate: (view: View) => void;
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(view)}
    >
      {icon}
      {label}
      {trailing ?? (active && <span className="active-dot" />)}
    </button>
  );
}
