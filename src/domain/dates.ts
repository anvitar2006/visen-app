import type { LocalDate } from "./planning";
export function localDate(instant: string | Date, timeZone: string): LocalDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}-${parts.find((p) => p.type === "day")!.value}` as LocalDate;
}
export function addDays(date: string, n: number): LocalDate {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10) as LocalDate;
}
export function weekDays(date: string) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const monday = addDays(date, -(weekday === 0 ? 6 : weekday - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const isoDate = addDays(monday, i);
    return {
      isoDate,
      name: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }).format(new Date(`${isoDate}T12:00:00Z`)),
      date: Number(isoDate.slice(8)),
      note: "",
    };
  });
}
export function dateLabel(
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  if (!date) return "Unscheduled";
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
export function timeLabel(instant: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
}
export function wallTime(instant: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(instant));
}
/** Resolve a wall-clock time in an IANA zone; reject DST gaps. Repeated times use the earlier occurrence. */
export function zonedInstant(
  date: string,
  time: string,
  timeZone: string,
): string {
  const guess = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(guess)) throw new Error("Choose a valid date and time.");
  const offsets = new Set<number>();
  for (const delta of [-86400000, 0, 86400000]) {
    const instant = new Date(guess + delta);
    const wall = `${localDate(instant, timeZone)}T${wallTime(instant.toISOString(), timeZone)}:00Z`;
    offsets.add(Date.parse(wall) - instant.getTime());
  }
  const matches = [...offsets]
    .map((offset) => new Date(guess - offset).toISOString())
    .filter(
      (instant) =>
        localDate(instant, timeZone) === date &&
        wallTime(instant, timeZone) === time,
    )
    .sort();
  if (!matches.length)
    throw new Error(
      "That local time does not exist because the clocks change. Choose another time.",
    );
  return matches[0];
}
export function overlaps(
  a: { start: string; end: string },
  b: { start: string; end: string },
) {
  return a.start < b.end && b.start < a.end;
}
