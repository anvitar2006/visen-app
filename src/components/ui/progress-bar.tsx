/** Neutral progress presentation, without points, streaks, or comparative ranking. */
export default function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const displayValue = Math.min(100, Math.max(0, value));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuenow={displayValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${displayValue}%` }} />
    </div>
  );
}
