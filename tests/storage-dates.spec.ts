import { test, expect } from "@playwright/test";
import {
  dataSchema,
  emptyData,
  exampleData,
  parseData,
  parseJSON,
} from "../src/domain/storage";
import {
  addDays,
  localDate,
  weekDays,
  zonedInstant,
} from "../src/domain/dates";
import { activeEvents, setCompleted } from "../src/domain/actions";
test("schema validates relationships, dates, versions, and completion history", () => {
  const sample = exampleData("2026-10-20");
  expect(dataSchema.safeParse(sample).success).toBe(true);
  const v1 = { ...sample, version: 1, preferences: undefined };
  expect(parseData(v1).version).toBe(2);
  expect(() => parseData({ ...sample, version: 99 })).toThrow();
  expect(() => parseJSON("{broken")).toThrow();
  for (const mutate of [
    (d: typeof sample) => {
      d.tasks[0].categoryId = "missing";
    },
    (d: typeof sample) => {
      d.tasks[0].plannedDate = "2026-02-30";
    },
    (d: typeof sample) => {
      d.tasks[0].milestoneId = d.milestones.find(
        (m) => m.goalId !== d.tasks[0].goalId,
      )!.id;
    },
    (d: typeof sample) => {
      d.tasks.push(d.tasks[0]);
    },
    (d: typeof sample) => {
      d.commitments[0].endAt = d.commitments[0].startAt;
    },
    (d: typeof sample) => {
      d.habits[0].frequency = { kind: "weekly-target", timesPerWeek: 8 };
    },
    (d: typeof sample) => {
      d.events.push({
        id: "bad",
        kind: "retracted",
        completionEventId: "missing",
        subject: { type: "task", id: d.tasks[0].id },
        occurredAt: "2026-10-20T14:00:00.000Z",
        localDate: "2026-10-20",
        timeZone: "UTC",
      });
    },
  ]) {
    const draft = structuredClone(sample);
    mutate(draft);
    expect(dataSchema.safeParse(draft).success).toBe(false);
  }
  const completed = sample.events.find((e) => e.subject.type === "habit")!;
  expect(
    dataSchema.safeParse({
      ...sample,
      events: [...sample.events, { ...completed, id: "duplicate-habit-day" }],
    }).success,
  ).toBe(false);
});
test("calendar dates, week boundaries, DST gaps and repeated hours retain intended meaning", () => {
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  expect(weekDays("2027-01-01")[0].isoDate).toBe("2026-12-28");
  expect(localDate("2026-10-20T01:00:00Z", "America/New_York")).toBe(
    "2026-10-19",
  );
  expect(zonedInstant("2026-03-08", "01:30", "America/New_York")).toBe(
    "2026-03-08T06:30:00.000Z",
  );
  expect(() => zonedInstant("2026-03-08", "02:30", "America/New_York")).toThrow(
    "clocks change",
  );
  expect(zonedInstant("2026-11-01", "01:30", "America/New_York")).toBe(
    "2026-11-01T05:30:00.000Z",
  );
  expect(zonedInstant("2026-10-20", "09:15", "Asia/Kathmandu")).toBe(
    "2026-10-20T03:30:00.000Z",
  );
});
test("habit completion is idempotent and can be retracted and recorded again", () => {
  const d = emptyData("UTC"),
    sample = exampleData("2026-10-20");
  d.habits = [{ ...sample.habits[0], goalId: undefined }];
  const subject = { type: "habit" as const, id: d.habits[0].id };
  setCompleted(d, subject, true, "2026-10-20");
  setCompleted(d, subject, true, "2026-10-20");
  expect(activeEvents(d)).toHaveLength(1);
  setCompleted(d, subject, false, "2026-10-20");
  expect(activeEvents(d)).toHaveLength(0);
  setCompleted(d, subject, true, "2026-10-20");
  expect(activeEvents(d)).toHaveLength(1);
  expect(dataSchema.safeParse(d).success).toBe(true);
});
