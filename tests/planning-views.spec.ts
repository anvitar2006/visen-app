import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { planningItems } from "../src/domain/sample";
import { seed, stored } from "./helpers/planning";
test.beforeEach(async ({ page }) => {
  await seed(page);
});
const modes = ["Calendar", "List", "Board", "Timeline"];
const expected = planningItems
  .map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    date: item.date,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));
test("all four views preserve the same task and commitment identities", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1366, height: 1024 });
  await page.goto("/");
  await page.getByRole("button", { name: "Week", exact: true }).click();
  const storageBefore = await page.evaluate(() => localStorage.length);
  for (const mode of modes) {
    await page.getByRole("tab", { name: mode, exact: true }).click();
    const panel = page.getByRole("tabpanel");
    expect(
      await panel.locator("[data-planning-id]").evaluateAll((nodes) =>
        nodes
          .map((node) => ({
            id: node.getAttribute("data-planning-id"),
            title: node.getAttribute("data-planning-title"),
            status: node.getAttribute("data-planning-status"),
            date: node.getAttribute("data-planning-date"),
          }))
          .sort((a, b) => a.id!.localeCompare(b.id!)),
      ),
    ).toEqual(expected);
  }
  await page.getByRole("tab", { name: "List", exact: true }).click();
  for (const grouping of ["category", "priority", "status", "date"]) {
    await page
      .getByLabel("Group list by", { exact: true })
      .selectOption(grouping);
    expect(
      await page
        .getByRole("tabpanel")
        .locator("[data-planning-id]")
        .evaluateAll((nodes) =>
          nodes
            .map((node) => ({
              id: node.getAttribute("data-planning-id"),
              title: node.getAttribute("data-planning-title"),
              status: node.getAttribute("data-planning-status"),
              date: node.getAttribute("data-planning-date"),
            }))
            .sort((a, b) => a.id!.localeCompare(b.id!)),
        ),
    ).toEqual(expected);
  }
  expect(await page.evaluate(() => localStorage.length)).toBe(storageBefore);
  await page.getByRole("tab", { name: "List", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Timeline", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: "Timeline", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "List", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});
for (const viewport of [
  { name: "ipad-landscape", width: 1366, height: 1024 },
  { name: "ipad-portrait", width: 834, height: 1194 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`planning previews are accessible and fit ${viewport.name}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.setViewportSize(viewport);
    await page.goto("/");
    if (viewport.width < 761)
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
    await page.getByRole("button", { name: "Week", exact: true }).click();
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") {
        if (viewport.width < 761)
          await page
            .getByRole("button", { name: "Open navigation", exact: true })
            .click();
        await page
          .getByRole("button", { name: "Dark mode", exact: true })
          .click();
        if (viewport.width < 761)
          await page
            .getByRole("button", { name: "Close navigation", exact: true })
            .click();
      }
      for (const mode of modes) {
        await page.getByRole("tab", { name: mode, exact: true }).click();
        await expect(page.getByRole("tabpanel")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          results.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
        ).toEqual([]);
        await page.screenshot({
          path: `artifacts/${viewport.name}-planning-${mode.toLowerCase()}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    if (viewport.width <= 1100) {
      await page.getByRole("tab", { name: "Calendar", exact: true }).click();
      await page
        .getByRole("button", { name: "Thu, October 22", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: /Review two applications/ }),
      ).toBeVisible();
      await page.getByRole("tab", { name: "Board", exact: true }).click();
      await page
        .getByRole("button", { name: "In progress", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: /Refine my portfolio case study/ }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Completed", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: /Read 20 pages/ }),
      ).toBeVisible();
    }
  });
}
test("Today reveals supporting plans and records a habit completion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 834, height: 1194 });
  await page.goto("/");
  await expect(
    page
      .locator(".today-task-details")
      .getByText("Write a few lines", { exact: true }),
  ).not.toBeVisible();
  await page.getByText("All of today’s tasks", { exact: false }).click();
  await expect(
    page
      .locator(".today-task-details")
      .getByText("Write a few lines", { exact: true }),
  ).toBeVisible();
  await page.getByText("Your small rituals", { exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Read a little: completed",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Read a little: completed",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Read a little: not completed",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    (await stored(page)).events.some(
      (e) => e.kind === "retracted" && e.subject.id === "habit-reading",
    ),
  ).toBe(true);
});
