import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seed, nav, settings } from "./helpers/planning";
for (const width of [834, 390])
  test(`planning editors and day/month agendas are accessible at ${width}px in both themes`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await seed(page);
    await page.setViewportSize({ width, height: 1194 });
    await page.goto("/");
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") {
        const menu = page.getByRole("button", {
          name: "Open navigation",
          exact: true,
        });
        if (await menu.isVisible()) await menu.click();
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
      const check = async () => {
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
        ).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      };
      await nav(page, "Week");
      for (const span of ["day", "month"]) {
        await page
          .getByLabel("Calendar span", { exact: true })
          .selectOption(span);
        await check();
        await page.screenshot({
          path: `artifacts/phase-3-${span}-${width}-${theme}.png`,
          fullPage: true,
        });
      }
      await page
        .getByRole("button", { name: "Commitment", exact: true })
        .click();
      await check();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await nav(page, "My Vision");
      await page.getByRole("button", { name: "New goal", exact: true }).click();
      await check();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page
        .getByText("Milestones & linked tasks", { exact: true })
        .first()
        .click();
      await page
        .getByRole("button", { name: "Add milestone", exact: true })
        .first()
        .click();
      await check();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await nav(page, "Habits");
      await page
        .getByRole("button", { name: "New habit", exact: true })
        .click();
      await page
        .getByLabel("Repeat", { exact: true })
        .selectOption("selected-days");
      await check();
      await page
        .getByRole("button", { name: "Close editor", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Discard edits", exact: true })
        .click();
      await settings(page);
      await check();
      await page.screenshot({
        path: `artifacts/phase-3-settings-${width}-${theme}.png`,
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "New category", exact: true })
        .click();
      await check();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
    }
  });

test("user-written long titles and category labels remain readable without horizontal overflow", async ({
  page,
}) => {
  const { exampleData } = await import("../src/domain/storage");
  const data = exampleData("2026-10-20");
  data.tasks[0].title = "A".repeat(300);
  data.goals[0].title = "G".repeat(300);
  data.habits[0].name = "H".repeat(300);
  data.preferences.name = "N".repeat(80);
  data.categories[0].name = "C".repeat(100);
  await seed(page, data);
  for (const width of [834, 390]) {
    await page.setViewportSize({ width, height: 1194 });
    await page.goto("/");
    for (const view of ["Today", "Week", "My Vision", "Habits"]) {
      await nav(page, view);
      if (view === "Week")
        await page.getByRole("tab", { name: "List", exact: true }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${view} at ${width}`,
      ).toBe(true);
    }
  }
});
