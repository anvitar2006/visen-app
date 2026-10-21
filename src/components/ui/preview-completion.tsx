import type { ReactNode } from "react";
import { Check } from "lucide-react";
/** A labeled completion control shared by tasks and habit days. */
export default function PreviewCompletion({
  completed,
  label,
  onPreview,
  variant = "circle",
  children,
  disabled = false,
}: {
  completed: boolean;
  disabled?: boolean;
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
      disabled={disabled}
      aria-pressed={completed}
      aria-label={label}
      onClick={onPreview}
    >
      {children}
      {completed ? <Check size={day ? 15 : 14} /> : day ? <span /> : null}
    </button>
  );
}
