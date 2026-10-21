import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { emptyData, STORAGE_KEY, parseJSON } from "../src/domain/storage";
import { seed, nav, settings, stored, save } from "./helpers/planning";
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1024 });
  await seed(page, emptyData("America/New_York"));
  await page.goto("/");
});
test("task CRUD, time blocks, independent deadlines, four-view synchronization, filters, reload and undo", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Prepare a thoughtful portfolio");
  await page
    .locator("dialog")
    .getByLabel("Priority", { exact: true })
    .selectOption("high");
  await page
    .locator("dialog")
    .getByLabel("Category", { exact: true })
    .selectOption("career");
  await page.getByText("Timing, deadline & goal", { exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Deadline (separate from planned day)", { exact: true })
    .fill("2026-10-25");
  await page
    .locator("dialog")
    .getByLabel("Duration in minutes", { exact: true })
    .fill("45");
  await page
    .locator("dialog")
    .getByLabel("Time block start (America/New_York)", { exact: true })
    .fill("09:30");
  await save(page, "Create task");
  let data = await stored(page);
  const taskId = data.tasks[0].id;
  expect(data.tasks[0]).toMatchObject({
    plannedDate: "2026-10-20",
    dueDate: "2026-10-25",
    priority: "high",
    scheduledStart: "2026-10-20T13:30:00.000Z",
  });
  await nav(page, "Week");
  for (const mode of ["List", "Calendar", "Board", "Timeline"]) {
    await page.getByRole("tab", { name: mode, exact: true }).click();
    await expect(
      page.locator(`[data-planning-id="${taskId}"]`),
    ).toHaveAttribute("data-planning-title", "Prepare a thoughtful portfolio");
  }
  await page.getByRole("tab", { name: "Board", exact: true }).click();
  await page.locator(`[data-planning-id="${taskId}"]`).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Portfolio, ready for review");
  await page
    .locator("dialog")
    .getByLabel("Status", { exact: true })
    .selectOption("completed");
  await page
    .locator("dialog")
    .getByLabel("Planned day", { exact: true })
    .fill("2026-10-22");
  await save(page);
  for (const mode of ["List", "Calendar", "Board", "Timeline"]) {
    await page.getByRole("tab", { name: mode, exact: true }).click();
    await expect(
      page.locator(`[data-planning-id="${taskId}"]`),
    ).toHaveAttribute("data-planning-status", "completed");
    await expect(
      page.locator(`[data-planning-id="${taskId}"]`),
    ).toHaveAttribute("data-planning-date", "2026-10-22");
  }
  expect((await stored(page)).tasks[0].dueDate).toBe("2026-10-25");
  await page.getByRole("tab", { name: "List", exact: true }).click();
  await page.getByLabel("Find a plan", { exact: true }).fill("unrelated");
  await expect(page.locator("[data-planning-id]")).toHaveCount(0);
  await page.getByLabel("Find a plan", { exact: true }).fill("Portfolio");
  await page.getByText("Filter & sort", { exact: false }).click();
  await page.getByLabel("Status", { exact: true }).selectOption("completed");
  await expect(page.locator("[data-planning-id]")).toHaveCount(1);
  await page.reload();
  await nav(page, "Week");
  await expect(
    page.getByRole("tab", { name: "List", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.locator(`[data-planning-id="${taskId}"]`).click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(page.locator('[aria-label="Confirm action"]')).toBeVisible();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  expect((await stored(page)).tasks).toHaveLength(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  data = await stored(page);
  expect(data.tasks[0].title).toBe("Portfolio, ready for review");
  expect(data.tasks[0].status).toBe("completed");
});
test("goals and milestones derive progress, preserve links, and habits recognize flexible weekly consistency", async ({
  page,
}) => {
  await nav(page, "My Vision");
  await page.getByRole("button", { name: "New goal", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Make room for writing");
  await save(page, "Create goal");
  await page.getByText("Milestones & linked tasks", { exact: true }).click();
  await page
    .getByRole("button", { name: "Add milestone", exact: true })
    .click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Finish the first chapter");
  await save(page, "Create milestone");
  await page
    .getByRole("button", { name: "Add linked task", exact: true })
    .click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Write for twenty minutes");
  await page.getByText("Timing, deadline & goal", { exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Linked milestone", { exact: true })
    .selectOption({ label: "Finish the first chapter" });
  await save(page, "Create task");
  await page
    .getByRole("checkbox", {
      name: "Complete milestone Finish the first chapter",
      exact: true,
    })
    .check();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await nav(page, "Habits");
  await page.getByRole("button", { name: "New habit", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Habit name", { exact: true })
    .fill("Read a chapter");
  await page
    .locator("dialog")
    .getByLabel("Times per week", { exact: true })
    .fill("3");
  await save(page, "Create habit");
  await page
    .getByRole("button", {
      name: "Read a chapter, Mon, not completed",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Read a chapter, Tue, not completed",
      exact: true,
    })
    .click();
  await expect(page.locator(".habit-total")).toContainText("2 of 3");
  await expect(
    page.getByRole("button", {
      name: "Read a chapter, Wed, not completed",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Read a chapter", exact: true })
    .click();
  await page
    .getByLabel("Repeat", { exact: true })
    .selectOption("selected-days");
  await page.locator("dialog").getByLabel("Fri", { exact: true }).uncheck();
  await save(page);
  await expect(page.locator(".habit-total")).toContainText("2 of 2");
  await page.reload();
  await nav(page, "Habits");
  await expect(page.locator(".habit-total")).toContainText("2 of 2");
  await nav(page, "My Vision");
  await page
    .getByRole("button", { name: "Make room for writing", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete goal", exact: true }).click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  const d = await stored(page);
  expect(d.goals).toHaveLength(0);
  expect(d.milestones).toHaveLength(0);
  expect(d.tasks[0].goalId).toBeUndefined();
  expect(d.tasks[0].milestoneId).toBeUndefined();
  expect(d.tasks).toHaveLength(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await stored(page)).tasks[0].milestoneId).toBeTruthy();
});
test("commitments support overnight times, conflicts, daily and monthly calendars, and DST-safe editing", async ({
  page,
}) => {
  await nav(page, "Week");
  await page.getByRole("button", { name: "Commitment", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Late travel");
  await page
    .locator("dialog")
    .getByLabel("Start day", { exact: true })
    .fill("2026-10-20");
  await page
    .locator("dialog")
    .getByLabel("End day", { exact: true })
    .fill("2026-10-21");
  await page
    .locator("dialog")
    .getByLabel("Start time", { exact: true })
    .fill("23:30");
  await page
    .locator("dialog")
    .getByLabel("End time", { exact: true })
    .fill("01:00");
  await save(page, "Create commitment");
  const d = await stored(page);
  expect(d.commitments[0].startAt).toBe("2026-10-21T03:30:00.000Z");
  await page.getByLabel("Calendar span", { exact: true }).selectOption("day");
  await expect(page.locator(".day-calendar")).toContainText("Late travel");
  await page.getByRole("button", { name: "Next day", exact: true }).click();
  await expect(page.locator(".day-calendar")).toContainText("Late travel");
  await expect(page.locator(".busy-summary")).toContainText("1h planned");
  await page.getByLabel("Calendar span", { exact: true }).selectOption("month");
  await expect(page.locator(".month-calendar>button")).toHaveCount(42);
  await page
    .getByRole("button", {
      name: "Wednesday, October 21, 1 plans",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Calendar span", { exact: true })).toHaveValue(
    "day",
  );
  await page.getByRole("button", { name: /Late travel/ }).click();
  await page
    .locator("dialog")
    .getByLabel("End day", { exact: true })
    .fill("2026-10-20");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("dialog [role=alert]")).toContainText(
    "End must follow start",
  );
  await page
    .locator("dialog")
    .getByLabel("End day", { exact: true })
    .fill("2026-10-21");
  await save(page);
  await page
    .getByRole("button", { name: "Add task or time block", exact: true })
    .click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Unrealistic overlap");
  await page.getByText("Timing, deadline & goal", { exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Duration in minutes", { exact: true })
    .fill("30");
  await page
    .locator("dialog")
    .getByLabel("Time block start (America/New_York)", { exact: true })
    .fill("00:15");
  await save(page, "Create task");
  await expect(page.locator(".busy-summary")).toContainText("overlapping plan");
});
test("custom categories, profile, theme preference, import/export and reset preserve reviewable backups", async ({
  page,
}) => {
  await settings(page);
  await page.getByRole("button", { name: "New category", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Category name", { exact: true })
    .fill("Home & family");
  await page
    .locator("dialog")
    .getByLabel("Category color", { exact: true })
    .selectOption("rose");
  await save(page, "Create category");
  await settings(page);
  await page
    .locator("dialog")
    .getByLabel("Your name", { exact: true })
    .fill("Sam");
  await page
    .getByLabel("Your vision", { exact: true })
    .fill("More time for what matters.");
  await page
    .locator("dialog")
    .getByLabel("Appearance", { exact: true })
    .selectOption("dark");
  await save(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("h1")).toHaveText("Hello, Sam.");
  await settings(page);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export plans", exact: true }).click();
  const file = await downloadEvent;
  expect(file.suggestedFilename()).toBe("visen-2026-10-20.json");
  const exportPath = await file.path();
  expect(exportPath).toBeTruthy();
  const original = parseJSON(await readFile(exportPath!, "utf8"));
  expect(original).toEqual(await stored(page));
  const imported = {
    ...original,
    preferences: { ...original.preferences, name: "Taylor" },
  };
  await page.locator("input[type=file]").setInputFiles({
    name: "plans.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await expect(page.locator("dialog")).toContainText(
    "Replace with imported plans?",
  );
  expect((await stored(page)).preferences.name).toBe("Sam");
  await page
    .getByRole("button", { name: "Import and replace", exact: true })
    .click();
  expect((await stored(page)).preferences.name).toBe("Taylor");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("visen-planning-backup")!).preferences
          .name,
    ),
  ).toBe("Sam");
  await settings(page);
  await page
    .getByRole("button", { name: "Reset all plans", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reset plans", exact: true }),
  ).toBeDisabled();
  await page
    .locator("dialog")
    .getByLabel("Type RESET to confirm", { exact: true })
    .fill("RESET");
  await page.getByRole("button", { name: "Reset plans", exact: true }).click();
  expect((await stored(page)).preferences.name).toBe("");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await stored(page)).preferences.name).toBe("Taylor");
  await settings(page);
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{invalid"),
  });
  await expect(page.locator("dialog [role=alert]")).toContainText(
    "Nothing was imported",
  );
  expect((await stored(page)).preferences.name).toBe("Taylor");
});
test("editing is accessible, protects unsaved drafts, and fits tablet portrait and mobile in both themes", async ({
  page,
}) => {
  for (const width of [834, 390]) {
    await page.setViewportSize({ width, height: 1194 });
    for (const dark of [false, true]) {
      if (dark) {
        const toggle = page.getByRole("button", {
          name: "Open navigation",
          exact: true,
        });
        if (await toggle.isVisible()) await toggle.click();
        await page
          .getByRole("button", { name: "Dark mode", exact: true })
          .click();
        if (
          await page
            .getByRole("button", { name: "Close navigation", exact: true })
            .isVisible()
        )
          await page
            .getByRole("button", { name: "Close navigation", exact: true })
            .click();
      }
      await page
        .getByRole("button", { name: "Add a task", exact: true })
        .click();
      await page
        .locator("dialog")
        .getByLabel("Title", { exact: true })
        .fill("Keep this draft");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toContainText(
        "Discard your edits?",
      );
      await page
        .getByRole("button", { name: "Keep editing", exact: true })
        .click();
      await expect(
        page.locator("dialog").getByLabel("Title", { exact: true }),
      ).toHaveValue("Keep this draft");
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/phase-3-editor-${width}-${dark ? "dark" : "light"}.png`,
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Close editor", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Discard edits", exact: true })
        .click();
    }
    if (width === 834) {
      await settings(page);
      await page
        .getByLabel("Appearance", { exact: true })
        .selectOption("light");
      await save(page);
    }
  }
});
test("storage failure never reports a successful write and concurrent tabs cannot overwrite each other", async ({
  page,
  context,
}) => {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "visen-planning")
        throw new DOMException("Storage full", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Must not disappear silently");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.locator("dialog [role=alert]")).toContainText(
    "Changes were not saved",
  );
  expect((await stored(page)).tasks).toHaveLength(0);
  await page.reload();
  const second = await context.newPage();
  await second.goto("/");
  await second.getByRole("button", { name: "Add a task", exact: true }).click();
  await second
    .getByLabel("Title", { exact: true })
    .fill("Another tab saved this");
  await save(second, "Create task");
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "another tab",
  );
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Stale change");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.locator("dialog [role=alert]")).toContainText("not saved");
  expect((await stored(page)).tasks[0].title).toBe("Another tab saved this");
  await second.close();
});
test("corrupt or future-version local data is preserved until an explicit recovery action", async ({
  page,
}) => {
  await page.evaluate(
    (key) => localStorage.setItem(key, '{"version":99,"precious":"keep me"}'),
    STORAGE_KEY,
  );
  await page.reload();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "not opened or overwritten",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toContain("keep me");
  await settings(page);
  await page
    .getByRole("button", { name: "Reset all plans", exact: true })
    .click();
  await page
    .locator("dialog")
    .getByLabel("Type RESET to confirm", { exact: true })
    .fill("RESET");
  await page.getByRole("button", { name: "Reset plans", exact: true }).click();
  expect((await stored(page)).version).toBe(2);
  expect(
    await page.evaluate(() => localStorage.getItem("visen-planning-backup")),
  ).toContain("keep me");
});

test("unscheduled tasks remain visible, sorting and category updates use the same records, and deletion reassigns safely", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Unscheduled responsibility");
  await page.getByLabel("Planned day", { exact: true }).fill("");
  await page.getByText("Timing, deadline & goal", { exact: true }).click();
  await page
    .getByLabel("Deadline (separate from planned day)", { exact: true })
    .fill("2026-10-22");
  await save(page, "Create task");
  await nav(page, "Week");
  await expect(page.locator(".unscheduled-plans")).toContainText(
    "Unscheduled responsibility",
  );
  await page.getByRole("tab", { name: "List", exact: true }).click();
  await expect(page.locator(".list-group")).toContainText("Unscheduled");
  await page.getByText("Filter & sort", { exact: false }).click();
  await page.getByLabel("Sort plans", { exact: true }).selectOption("deadline");
  await page.getByLabel("Category", { exact: true }).selectOption("wellbeing");
  await expect(page.locator("[data-planning-id]")).toHaveCount(0);
  await page.getByLabel("Category", { exact: true }).selectOption("career");
  await expect(page.locator("[data-planning-id]")).toHaveCount(1);
  await settings(page);
  await page.getByRole("button", { name: "Work & focus", exact: true }).click();
  await page.getByLabel("Category name", { exact: true }).fill("Deep work");
  await page
    .getByLabel("Category color", { exact: true })
    .selectOption("lavender");
  await save(page);
  await expect(page.locator("[data-planning-id]")).toContainText("Deep work");
  await settings(page);
  await page.getByRole("button", { name: "Deep work", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete category", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  const d = await stored(page);
  expect(d.tasks[0].categoryId).toBe("wellbeing");
  expect(d.categories.some((c) => c.id === "career")).toBe(false);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect((await stored(page)).tasks[0].categoryId).toBe("career");
});
test("changing the planning time zone retains instants, updates timed task dates and preserves prior habit days", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Title", { exact: true })
    .fill("An early morning plan");
  await page.getByText("Timing, deadline & goal", { exact: true }).click();
  await page.getByLabel("Duration in minutes", { exact: true }).fill("30");
  await page
    .getByLabel("Time block start (America/New_York)", { exact: true })
    .fill("00:30");
  await save(page, "Create task");
  const instant = (await stored(page)).tasks[0].scheduledStart;
  await nav(page, "Habits");
  await page.getByRole("button", { name: "New habit", exact: true }).click();
  await page.getByLabel("Habit name", { exact: true }).fill("A moment to read");
  await save(page, "Create habit");
  await page
    .getByRole("button", {
      name: "A moment to read, Mon, not completed",
      exact: true,
    })
    .click();
  await settings(page);
  await page
    .getByLabel("Planning time zone", { exact: true })
    .fill("America/Los_Angeles");
  await save(page);
  const changed = await stored(page);
  expect(changed.tasks[0].scheduledStart).toBe(instant);
  expect(changed.tasks[0].plannedDate).toBe("2026-10-19");
  expect(changed.events[0]).toMatchObject({
    localDate: "2026-10-19",
    timeZone: "America/New_York",
  });
  await page.reload();
  expect((await stored(page)).preferences.timeZone).toBe("America/Los_Angeles");
  await nav(page, "Week");
  await page.getByRole("tab", { name: "List", exact: true }).click();
  await expect(page.locator("[data-planning-id]")).toContainText("9:30 PM");
});

test("a version 1 document migrates on edit without losing task identity or calendar dates", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("A plan worth keeping");
  await save(page, "Create task");
  const original = await stored(page);
  await page.evaluate(
    ({ key, data }) =>
      localStorage.setItem(key, JSON.stringify({ ...data, version: 1 })),
    { key: STORAGE_KEY, data: original },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "A plan worth keeping", exact: true })
    .click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("A plan carried forward");
  await save(page);
  const current = await stored(page);
  expect(current.version).toBe(2);
  expect(current.tasks[0].id).toBe(original.tasks[0].id);
  expect(current.tasks[0].plannedDate).toBe("2026-10-20");
});
