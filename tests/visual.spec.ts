import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
});
import { seed } from "./helpers/planning";
test.beforeEach(async ({ page }) => {
  await seed(page);
});
const views = ["Today", "Week", "My Vision", "Habits", "Sana"];
test("all views remain accessible in both themes on iPad landscape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 1024 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page.getByRole("button", { name: "Dark mode" }).click();
    for (const view of views) {
      await page
        .getByRole("button", {
          name: view === "Sana" ? "Meet Sana" : view,
          exact: true,
        })
        .click();
      await expect(page.locator("h1")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        `${view} ${theme}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/ipad-landscape-${view.toLowerCase().replaceAll(" ", "-")}-${theme}.png`,
        fullPage: true,
      });
    }
  }
  expect(errors).toEqual([]);
});
test("portrait, mobile, theme persistence and honest preview actions", async ({
  page,
}) => {
  for (const width of [834, 390]) {
    await page.setViewportSize({ width, height: 1194 });
    await page.goto("/");
    for (const view of views) {
      if (width === 390)
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
      await page
        .getByRole("button", {
          name: view === "Sana" ? "Meet Sana" : view,
          exact: true,
        })
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/${width === 834 ? "ipad-portrait" : "mobile"}-${view.toLowerCase().replaceAll(" ", "-")}.png`,
        fullPage: true,
      });
    }
  }
  await page
    .getByRole("button", { name: "Help me find my focus today" })
    .click();
  await expect(page.locator(".sana-letter-reply")).toContainText(
    "Nothing will change without your approval",
  );
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "New task", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Add a task", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("button", { name: "Dark mode" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("mobile navigation traps focus, closes with Escape, and follows device theme", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const trigger = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close navigation", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Your space and data settings" })
    .focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "visen", exact: true }),
  ).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("short landscape iPad keeps navigation controls reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  const themeToggle = page.getByRole("button", {
    name: "Dark mode",
    exact: true,
  });
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const themeBounds = await page
    .getByRole("button", { name: "Light mode", exact: true })
    .boundingBox();
  expect(themeBounds!.y + themeBounds!.height).toBeLessThanOrEqual(768);
  await page.getByRole("button", { name: "Week", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Your plans");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
