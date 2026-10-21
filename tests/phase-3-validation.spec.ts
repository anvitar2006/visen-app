import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { seed, nav, settings, stored, save } from "./helpers/planning";
import { dataSchema, parseJSON } from "../src/domain/storage";
import { activeEvents } from "../src/domain/actions";
test.beforeEach(async ({ page }) => {
  await seed(page);
  await page.setViewportSize({ width: 834, height: 1194 });
  await page.goto("/");
});
test("goal and milestone edits, relationship guards, deletion, progress and reload retain valid data", async ({
  page,
}) => {
  await nav(page, "My Vision");
  await page
    .getByRole("button", {
      name: "Build a career that feels like me",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("A thoughtful next chapter");
  await page
    .getByRole("textbox", { name: "Why it matters", exact: true })
    .fill("Work with room for the rest of life.");
  await page.getByLabel("Target day", { exact: true }).fill("2027-01-15");
  await page.getByLabel("Goal status", { exact: true }).selectOption("paused");
  await save(page);
  await page
    .getByText("Milestones & linked tasks", { exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: /^Finish my portfolio/ })
    .first()
    .click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Share my revised portfolio");
  await page.getByLabel("Target day", { exact: true }).fill("2026-10-29");
  await page.getByLabel("Goal", { exact: true }).selectOption("goal-wellbeing");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator("dialog [role=alert]")).toContainText(
    "milestone must belong",
  );
  await page.getByLabel("Goal", { exact: true }).selectOption("goal-career");
  await save(page);
  await page.reload();
  await nav(page, "My Vision");
  await expect(
    page.getByRole("button", {
      name: "A thoughtful next chapter",
      exact: true,
    }),
  ).toBeVisible();
  let d = await stored(page);
  expect(d.goals[0]).toMatchObject({
    status: "paused",
    targetDate: "2027-01-15",
    description: "Work with room for the rest of life.",
  });
  expect(d.milestones.find((m) => m.id === "milestone-1-4")!.title).toBe(
    "Share my revised portfolio",
  );
  await page
    .getByText("Milestones & linked tasks", { exact: true })
    .first()
    .click();
  await page
    .getByRole("checkbox", {
      name: "Complete milestone Share my revised portfolio",
      exact: true,
    })
    .check();
  await expect(page.getByRole("progressbar").first()).toHaveAttribute(
    "aria-valuenow",
    "57",
  );
  await page
    .getByRole("button", { name: /^Share my revised portfolio/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Delete milestone", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  d = await stored(page);
  expect(
    d.tasks.find((t) => t.id === "task-portfolio")?.milestoneId,
  ).toBeUndefined();
  expect(d.tasks.find((t) => t.id === "task-portfolio")?.goalId).toBe(
    "goal-career",
  );
  expect(dataSchema.safeParse(d).success).toBe(true);
  await page
    .getByRole("button", { name: "Undo last change", exact: true })
    .click();
  d = await stored(page);
  expect(d.tasks.find((t) => t.id === "task-portfolio")?.milestoneId).toBe(
    "milestone-1-4",
  );
  expect(
    d.events.some(
      (e) => e.subject.id === "milestone-1-4" && e.kind === "completed",
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "A thoughtful next chapter", exact: true })
    .click();
  await page
    .getByLabel("Goal status", { exact: true })
    .selectOption("completed");
  await save(page);
  await expect(page.getByRole("progressbar").first()).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page.reload();
  await nav(page, "My Vision");
  await expect(page.getByRole("progressbar").first()).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page
    .getByRole("button", { name: "A thoughtful next chapter", exact: true })
    .click();
  await page.getByLabel("Goal status", { exact: true }).selectOption("active");
  await save(page);
  await expect(page.getByRole("progressbar").first()).toHaveAttribute(
    "aria-valuenow",
    "57",
  );
  expect(
    activeEvents(await stored(page)).some(
      (e) => e.subject.type === "goal" && e.subject.id === "goal-career",
    ),
  ).toBe(false);
});
test("habit pause, target edits, completion history, deletion and undo survive reloads", async ({
  page,
}) => {
  await nav(page, "Habits");
  await page
    .getByRole("button", { name: "Read a little", exact: true })
    .click();
  await page.getByLabel("Habit name", { exact: true }).fill("Read with tea");
  await page.getByLabel("Times per week", { exact: true }).fill("4");
  await page.getByLabel("Habit status", { exact: true }).selectOption("paused");
  await save(page);
  await expect(
    page.getByRole("button", {
      name: "Read with tea, Tue, completed",
      exact: true,
    }),
  ).toBeDisabled();
  await page.reload();
  await nav(page, "Habits");
  await expect(
    page.locator(".habit-table-row").filter({ hasText: "Read with tea" }),
  ).toContainText("2 of 4");
  await page
    .getByRole("button", { name: "Read with tea", exact: true })
    .click();
  await page.getByLabel("Habit status", { exact: true }).selectOption("active");
  await save(page);
  await page
    .getByRole("button", { name: "Read with tea, Tue, completed", exact: true })
    .click();
  let d = await stored(page);
  expect(
    activeEvents(d).filter((e) => e.subject.id === "habit-reading"),
  ).toHaveLength(1);
  await page
    .getByRole("button", {
      name: "Read with tea, Tue, not completed",
      exact: true,
    })
    .click();
  d = await stored(page);
  expect(
    activeEvents(d).filter((e) => e.subject.id === "habit-reading"),
  ).toHaveLength(2);
  await page
    .getByRole("button", { name: "Read with tea", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete habit", exact: true }).click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  d = await stored(page);
  expect(d.events.some((e) => e.subject.id === "habit-reading")).toBe(false);
  await page
    .getByRole("button", { name: "Undo last change", exact: true })
    .click();
  await page.reload();
  d = await stored(page);
  expect(d.habits.some((h) => h.name === "Read with tea")).toBe(true);
  expect(
    activeEvents(d).filter((e) => e.subject.id === "habit-reading"),
  ).toHaveLength(2);
  expect(dataSchema.safeParse(d).success).toBe(true);
});
test("commitment rescheduling preserves zones, rejects DST gaps, and supports delete/undo persistence", async ({
  page,
}) => {
  await nav(page, "Week");
  await page.getByRole("tab", { name: "List", exact: true }).click();
  const initial = (await stored(page)).commitments[0];
  await page.locator(`[data-planning-id="${initial.id}"]`).click();
  await page.getByLabel("Title", { exact: true }).fill("A later coffee");
  await page.getByLabel("Start day", { exact: true }).fill("2026-10-23");
  await page.getByLabel("End day", { exact: true }).fill("2026-10-23");
  await page.getByLabel("Start time", { exact: true }).fill("17:15");
  await page.getByLabel("End time", { exact: true }).fill("18:00");
  await page
    .getByLabel("Commitment time zone", { exact: true })
    .fill("Europe/London");
  await save(page);
  await page.reload();
  let d = await stored(page);
  const updated = d.commitments.find((c) => c.id === initial.id)!;
  expect(updated).toMatchObject({
    title: "A later coffee",
    startAt: "2026-10-23T16:15:00.000Z",
    timeZone: "Europe/London",
  });
  await nav(page, "Week");
  await page.locator(`[data-planning-id="${initial.id}"]`).click();
  await page.getByLabel("Start day", { exact: true }).fill("2026-03-08");
  await page.getByLabel("End day", { exact: true }).fill("2026-03-08");
  await page.getByLabel("Start time", { exact: true }).fill("02:30");
  await page.getByLabel("End time", { exact: true }).fill("04:00");
  await page
    .getByLabel("Commitment time zone", { exact: true })
    .fill("America/New_York");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator("dialog [role=alert]")).toContainText(
    "clocks change",
  );
  expect(
    (await stored(page)).commitments.find((c) => c.id === initial.id),
  ).toEqual(updated);
  await page.getByRole("button", { name: "Close editor", exact: true }).click();
  await page
    .getByRole("button", { name: "Discard edits", exact: true })
    .click();
  await page.locator(`[data-planning-id="${initial.id}"]`).click();
  await page
    .getByRole("button", { name: "Delete commitment", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  expect(
    (await stored(page)).commitments.some((c) => c.id === initial.id),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Undo last change", exact: true })
    .click();
  await page.reload();
  expect(
    (await stored(page)).commitments.find((c) => c.id === initial.id),
  ).toEqual(updated);
});
test("complete exports round-trip all records and bad relationship imports leave existing plans unchanged", async ({
  page,
}) => {
  const before = await stored(page);
  await settings(page);
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export plans", exact: true }).click();
  const file = await event;
  const exported = parseJSON(await readFile((await file.path())!, "utf8"));
  expect(exported).toEqual(before);
  const bad = structuredClone(exported);
  bad.tasks[0].goalId = "missing-goal";
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid-relationship.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(bad)),
  });
  await expect(page.locator("dialog [role=alert]")).toContainText(
    "Nothing was imported",
  );
  expect(await stored(page)).toEqual(before);
  await page.locator("input[type=file]").setInputFiles({
    name: "complete.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exported)),
  });
  await page
    .getByRole("button", { name: "Import and replace", exact: true })
    .click();
  await page.reload();
  const { revision: _, ...actual } = await stored(page);
  const { revision: __, ...expected } = before;
  expect(actual).toEqual(expected);
  expect(dataSchema.safeParse(await stored(page)).success).toBe(true);
  await settings(page);
  await page.getByText("Recovery & storage", { exact: true }).click();
  const recoveryEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download recovery copy", exact: true })
    .click();
  const recovery = await recoveryEvent;
  expect(parseJSON(await readFile((await recovery.path())!, "utf8"))).toEqual(
    before,
  );
});
