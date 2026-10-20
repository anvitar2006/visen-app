import type { PlanningData } from "./storage";
import type { CompletionSubject, LocalDate } from "./planning";
export function id() {
  return crypto.randomUUID();
}
export function activeEvents(d: PlanningData) {
  const retracted = new Set(
    d.events
      .filter((e) => e.kind === "retracted")
      .map((e) => (e.kind === "retracted" ? e.completionEventId : "")),
  );
  return d.events.filter((e) => e.kind === "completed" && !retracted.has(e.id));
}
export function setCompleted(
  d: PlanningData,
  subject: CompletionSubject,
  completed: boolean,
  date: string,
) {
  const now = new Date().toISOString();
  const current = activeEvents(d).filter(
    (e) =>
      e.subject.type === subject.type &&
      e.subject.id === subject.id &&
      (subject.type !== "habit" || e.localDate === date),
  );
  if (completed && !current.length)
    d.events.push({
      id: id(),
      subject,
      kind: "completed",
      occurredAt: now,
      localDate: date as LocalDate,
      timeZone: d.preferences.timeZone,
    });
  if (!completed)
    for (const e of current)
      d.events.push({
        id: id(),
        subject,
        kind: "retracted",
        completionEventId: e.id,
        occurredAt: now,
        localDate: date as LocalDate,
        timeZone: d.preferences.timeZone,
      });
}

/** Delete deliberately: preserve plans when their parent goal is removed; reassign categories. */
export function deleteRecord(
  d: PlanningData,
  kind: "task" | "commitment" | "goal" | "milestone" | "habit" | "category",
  recordId: string,
) {
  if (kind === "task") d.tasks = d.tasks.filter((t) => t.id !== recordId);
  if (kind === "commitment")
    d.commitments = d.commitments.filter((t) => t.id !== recordId);
  if (kind === "habit") d.habits = d.habits.filter((t) => t.id !== recordId);
  const removedMilestones =
    kind === "goal"
      ? d.milestones.filter((m) => m.goalId === recordId).map((m) => m.id)
      : kind === "milestone"
        ? [recordId]
        : [];
  if (kind === "goal") {
    d.goals = d.goals.filter((g) => g.id !== recordId);
    d.habits = d.habits.map((h) =>
      h.goalId === recordId ? { ...h, goalId: undefined } : h,
    );
  }
  d.milestones = d.milestones.filter((m) => !removedMilestones.includes(m.id));
  d.tasks = d.tasks.map((t) => ({
    ...t,
    goalId: kind === "goal" && t.goalId === recordId ? undefined : t.goalId,
    milestoneId:
      t.milestoneId && removedMilestones.includes(t.milestoneId)
        ? undefined
        : t.milestoneId,
  }));
  d.events = d.events.filter(
    (e) =>
      e.subject.id !== recordId && !removedMilestones.includes(e.subject.id),
  );
  if (kind === "category") {
    if (d.categories.length === 1)
      throw new Error("Keep at least one category.");
    const replacement = d.categories.find((c) => c.id !== recordId)!.id;
    d.categories = d.categories.filter((c) => c.id !== recordId);
    for (const rows of [d.tasks, d.goals, d.habits, d.commitments])
      for (const item of rows)
        if (item.categoryId === recordId) item.categoryId = replacement;
  }
}
