import type { ReactNode } from "react";
import { Check } from "lucide-react";
/** Visual preview only: activation explains the boundary; it never changes completion. */
export default function PreviewCompletion({
  completed,
  label,
  onPreview,
  variant = "circle",
  children,
}: {
  completed: boolean;
  label: string;
  onPreview: () => void;
  variant?: "circle" | "day";
  children?: ReactNode;
}) {
  const day = variant === "day";
  return (
    <button
      className={
        day
          ? `habit-day ${completed ? "done" : ""}`
          : `task-check ${completed ? "checked" : ""}`
      }
      aria-label={label}
      onClick={onPreview}
    >
      {children}
      {completed ? <Check size={day ? 15 : 14} /> : day ? <span /> : null}
    </button>
  );
}
