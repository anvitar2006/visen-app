import { z } from "zod";
import { categories } from "./sample";
import {
  sampleTasks,
  sampleGoals,
  sampleMilestones,
  sampleHabits,
  sampleCommitments,
  sampleCompletionEvents,
} from "./sample-planning";
import { addDays, localDate } from "./dates";
export const STORAGE_KEY = "visen-planning";
export const BACKUP_KEY = "visen-planning-backup";
const id = z.string().trim().min(1).max(100);
const text = z.string().trim().min(1).max(300);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s + "T12:00:00Z")) &&
      new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s,
    "Invalid calendar date",
  );
const instant = z.iso.datetime();
const zone = z.string().refine((s) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: s });
    return true;
  } catch {
    return false;
  }
}, "Invalid time zone");
const record = { id, createdAt: instant, updatedAt: instant };
const status = z.enum(["active", "paused", "completed"]);
const task = z.object({
  ...record,
  title: text,
  categoryId: id,
  status: z.enum(["open", "in-progress", "completed"]),
  priority: z.enum(["high", "normal", "low"]),
  plannedDate: date.optional(),
  dueDate: date.optional(),
  scheduledStart: instant.optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
  goalId: id.optional(),
  milestoneId: id.optional(),
});
const goal = z.object({
  ...record,
  title: text,
  description: z.string().max(2000),
  categoryId: id,
  status,
  targetDate: date.optional(),
});
const milestone = z.object({
  ...record,
  goalId: id,
  title: text,
  position: z.number().int().min(0),
  targetDate: date.optional(),
  status: z.enum(["open", "completed"]),
});
const habit = z.object({
  ...record,
  name: text,
  categoryId: id,
  goalId: id.optional(),
  frequency: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("weekly-target"),
      timesPerWeek: z.number().int().min(1).max(7),
    }),
    z.object({
      kind: z.literal("selected-days"),
      weekdays: z
        .array(z.number().int().min(1).max(7))
        .min(1)
        .max(7)
        .refine((s) => new Set(s).size === s.length),
    }),
  ]),
  status: z.enum(["active", "paused"]),
});
const commitment = z
  .object({
    ...record,
    title: text,
    categoryId: id,
    startAt: instant,
    endAt: instant,
    timeZone: zone,
  })
  .refine((c) => c.endAt > c.startAt, "End must follow start");
const category = z.object({
  id,
  name: text,
  tone: z.enum(["sage", "blue", "lavender", "taupe", "rose"]),
});
const subject = z.object({
  type: z.enum(["goal", "task", "milestone", "habit"]),
  id,
});
const event = z.discriminatedUnion("kind", [
  z.object({
    id,
    subject,
    occurredAt: instant,
    localDate: date,
    timeZone: zone,
    kind: z.literal("completed"),
  }),
  z.object({
    id,
    subject,
    occurredAt: instant,
    localDate: date,
    timeZone: zone,
    kind: z.literal("retracted"),
    completionEventId: id,
  }),
]);
export const preferencesSchema = z.object({
  theme: z.enum(["system", "light", "dark"]).default("system"),
  view: z.enum(["List", "Calendar", "Board", "Timeline"]),
  timeZone: zone,
  name: z.string().trim().max(80),
  vision: z.string().max(2000),
});
const base = z.object({
  version: z.literal(2),
  revision: z.number().int().min(0),
  categories: z.array(category).min(1).max(100),
  tasks: z.array(task).max(10000),
  goals: z.array(goal).max(1000),
  milestones: z.array(milestone).max(10000),
  habits: z.array(habit).max(1000),
  commitments: z.array(commitment).max(10000),
  events: z.array(event).max(100000),
  preferences: preferencesSchema,
  sample: z.boolean(),
});
export type PlanningData = z.infer<typeof base>;
export const dataSchema = base.superRefine((d, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });
  const all = [
    ...d.categories,
    ...d.tasks,
    ...d.goals,
    ...d.milestones,
    ...d.habits,
    ...d.commitments,
    ...d.events,
  ];
  if (new Set(all.map((x) => x.id)).size !== all.length)
    fail("Record IDs must be unique.");
  const cats = new Set(d.categories.map((c) => c.id)),
    goals = new Set(d.goals.map((g) => g.id));
  for (const r of [...d.tasks, ...d.goals, ...d.habits, ...d.commitments])
    if (!cats.has(r.categoryId)) fail("A category reference is missing.");
  for (const r of [...d.tasks, ...d.habits, ...d.milestones])
    if (r.goalId && !goals.has(r.goalId)) fail("A goal reference is missing.");
  for (const t of d.tasks) {
    if (
      t.milestoneId &&
      !d.milestones.some((m) => m.id === t.milestoneId && m.goalId === t.goalId)
    )
      fail("A milestone must belong to the linked goal.");
    if (t.scheduledStart && (!t.plannedDate || !t.estimatedMinutes))
      fail("A time block needs a planned day and duration.");
    if (
      t.scheduledStart &&
      localDate(t.scheduledStart, d.preferences.timeZone) !== t.plannedDate
    )
      fail(
        "A time block must match its planned day in the planning time zone.",
      );
  }
  const map = {
    task: d.tasks,
    goal: d.goals,
    milestone: d.milestones,
    habit: d.habits,
  };
  const retracted = new Set<string>();
  for (const e of d.events) {
    if (!map[e.subject.type].some((r) => r.id === e.subject.id))
      fail("A history record refers to a missing item.");
    if (e.kind === "retracted") {
      const original = d.events.find((c) => c.id === e.completionEventId);
      if (
        !original ||
        original.kind !== "completed" ||
        original.subject.type !== e.subject.type ||
        original.subject.id !== e.subject.id ||
        original.occurredAt > e.occurredAt ||
        retracted.has(original.id)
      )
        fail("Invalid completion retraction.");
      retracted.add(e.completionEventId);
    }
  }
  const habitDays = new Set<string>();
  for (const e of d.events)
    if (
      e.kind === "completed" &&
      !retracted.has(e.id) &&
      e.subject.type === "habit"
    ) {
      const key = e.subject.id + e.localDate;
      if (habitDays.has(key)) fail("A habit can have one completion per day.");
      habitDays.add(key);
    }
});
export function defaultZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
export function emptyData(timeZone = defaultZone()): PlanningData {
  return {
    version: 2,
    revision: 0,
    categories: categories.map((c) => ({ ...c })),
    tasks: [],
    goals: [],
    milestones: [],
    habits: [],
    commitments: [],
    events: [],
    sample: false,
    preferences: {
      view: "Calendar",
      theme: "system",
      timeZone,
      name: "",
      vision: "",
    },
  };
}
/** Version 1 is the first flat local-data format; v2 adds explicit preferences and sample provenance. */
export function parseData(input: unknown): PlanningData {
  if (
    typeof input === "object" &&
    input !== null &&
    "version" in input &&
    input.version === 1
  ) {
    const old = input as Record<string, unknown>;
    input = {
      ...old,
      version: 2,
      revision: typeof old.revision === "number" ? old.revision : 0,
      preferences: old.preferences ?? {
        view: "Calendar",
        timeZone: "UTC",
        name: "",
        vision: "",
      },
      sample: old.sample ?? false,
    };
  }
  const result = dataSchema.safeParse(input);
  if (!result.success)
    throw new Error(
      "This data could not be validated. " + result.error.issues[0].message,
    );
  return result.data;
}
export function parseJSON(raw: string) {
  if (raw.length > 8_000_000)
    throw new Error("Choose an export smaller than 8 MB.");
  return parseData(JSON.parse(raw));
}
export function exampleData(today: string): PlanningData {
  const shift = Math.round(
    (Date.parse(today + "T12:00:00Z") - Date.parse("2026-10-20T12:00:00Z")) /
      86400000,
  );
  const shiftDate = (s: string) => addDays(s, shift);
  const shiftInstant = (s: string) =>
    new Date(Date.parse(s) + shift * 86400000).toISOString();
  const move = <T extends { createdAt: string; updatedAt: string }>(r: T) => ({
    ...r,
    createdAt: shiftInstant(r.createdAt),
    updatedAt: shiftInstant(r.updatedAt),
  });
  return parseData({
    ...emptyData("America/New_York"),
    sample: true,
    preferences: {
      view: "Calendar",
      timeZone: "America/New_York",
      name: "Alex",
      vision:
        "Work that feels like me. A healthy mind. People I love. Time to stay curious.",
    },
    tasks: sampleTasks.map((t) => ({
      ...move(t),
      plannedDate: shiftDate(t.plannedDate),
      dueDate: "dueDate" in t ? shiftDate(t.dueDate) : undefined,
      scheduledStart:
        "scheduledStart" in t ? shiftInstant(t.scheduledStart) : undefined,
    })),
    goals: sampleGoals.map((g) => ({
      ...move(g),
      targetDate: shiftDate(g.targetDate),
    })),
    milestones: sampleMilestones.map((m) => ({
      ...move(m),
      targetDate: "targetDate" in m ? shiftDate(m.targetDate) : undefined,
    })),
    habits: sampleHabits.map(move),
    commitments: sampleCommitments.map((c) => ({
      ...move(c),
      startAt: shiftInstant(c.startAt),
      endAt: shiftInstant(c.endAt),
    })),
    events: sampleCompletionEvents.map((e) => ({
      ...e,
      occurredAt: shiftInstant(e.occurredAt),
      localDate: shiftDate(e.localDate),
    })),
  });
}
