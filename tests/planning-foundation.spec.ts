import { test, expect } from "@playwright/test";
import type { CompletionEvent } from "../src/domain/planning";
import {
  sampleGoals,
  sampleMilestones,
  sampleTasks,
  sampleHabits,
  sampleCompletionEvents,
  sampleToday,
  sampleCommitments,
} from "../src/domain/sample-planning";
import { tasks, goals, habits } from "../src/domain/sample";

test("fictional planning records preserve identity, links, and reversible completion history", () => {
  const records = [
    ...sampleCommitments,
    ...sampleGoals,
    ...sampleMilestones,
    ...sampleTasks,
    ...sampleHabits,
  ];
  expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
  for (const record of records) {
    expect(Number.isFinite(Date.parse(record.createdAt))).toBe(true);
    expect(Date.parse(record.updatedAt)).toBeGreaterThanOrEqual(
      Date.parse(record.createdAt),
    );
  }
  const goalIds = new Set<string>(sampleGoals.map((goal) => goal.id));
  for (const milestone of sampleMilestones)
    expect(goalIds.has(milestone.goalId)).toBe(true);
  for (const task of sampleTasks) {
    expect(goalIds.has(task.goalId)).toBe(true);
    const milestone = sampleMilestones.find((m) => m.id === task.milestoneId);
    expect(milestone?.goalId).toBe(task.goalId);
  }
  for (const habit of sampleHabits) {
    expect(goalIds.has(habit.goalId)).toBe(true);
    if (habit.frequency.kind === "weekly-target")
      expect(habit.frequency.timesPerWeek).toBeGreaterThan(0);
    else
      expect(
        habit.frequency.weekdays.every((day) => day >= 1 && day <= 7),
      ).toBe(true);
  }
  for (const commitment of sampleCommitments) {
    expect(Date.parse(commitment.endAt)).toBeGreaterThan(
      Date.parse(commitment.startAt),
    );
    expect(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: commitment.timeZone,
      }).format(new Date(commitment.startAt)),
    ).toMatch(/^2026-10-2[0-5]$/);
  }
  const subjectIds = {
    goal: new Set<string>(sampleGoals.map((g) => g.id)),
    task: new Set<string>(sampleTasks.map((t) => t.id)),
    habit: new Set<string>(sampleHabits.map((h) => h.id)),
    milestone: new Set<string>(sampleMilestones.map((m) => m.id)),
  };
  const seen = new Map<string, CompletionEvent>();
  const activeCompletions = new Map<string, CompletionEvent>();
  for (const event of sampleCompletionEvents) {
    expect(seen.has(event.id)).toBe(false);
    expect(subjectIds[event.subject.type].has(event.subject.id)).toBe(true);
    expect(Number.isFinite(Date.parse(event.occurredAt))).toBe(true);
    expect(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: event.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(event.occurredAt)),
    ).toBe(event.localDate);
    if (event.kind === "retracted") {
      const original = seen.get(event.completionEventId);
      expect(original?.kind).toBe("completed");
      expect(original?.subject).toEqual(event.subject);
      expect(Date.parse(event.occurredAt)).toBeGreaterThanOrEqual(
        Date.parse(original!.occurredAt),
      );
      expect(activeCompletions.delete(event.completionEventId)).toBe(true);
    } else activeCompletions.set(event.id, event);
    seen.set(event.id, event);
  }
  const effective = [...activeCompletions.values()];
  for (const record of [...sampleTasks, ...sampleMilestones]) {
    expect(effective.some((e) => e.subject.id === record.id)).toBe(
      record.status === "completed",
    );
  }
  const habitOccurrences = effective
    .filter((e) => e.subject.type === "habit")
    .map((e) => `${e.subject.id}:${e.localDate}`);
  expect(new Set(habitOccurrences).size).toBe(habitOccurrences.length);
  for (const habit of habits)
    for (let day = 0; day < 7; day++) {
      const date = `2026-10-${19 + day}`;
      expect(
        effective.some(
          (e) =>
            e.subject.type === "habit" &&
            e.subject.id === habit.id &&
            e.localDate === date,
        ),
      ).toBe(habit.days[day]);
    }
  expect(tasks.filter((t) => t.status === "completed")).toHaveLength(1);
  expect(goals.map((g) => g.milestone)).toEqual([
    "Finish my portfolio",
    "Find a routine I enjoy",
    "Read twelve books this year",
  ]);
  expect(sampleTasks.filter((t) => t.plannedDate === sampleToday)).toHaveLength(
    4,
  );
});
