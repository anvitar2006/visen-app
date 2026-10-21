import { expect, type Page } from "@playwright/test";
import {
  exampleData,
  STORAGE_KEY,
  type PlanningData,
} from "../../src/domain/storage";
export async function seed(
  page: Page,
  data: PlanningData = exampleData("2026-10-20"),
) {
  await page.clock.setFixedTime(new Date("2026-10-20T14:00:00.000Z"));
  await page.addInitScript(
    ({ key, data }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data },
  );
}
export async function nav(page: Page, name: string) {
  const toggle = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (await toggle.isVisible()) await toggle.click();
  await page.getByRole("button", { name, exact: true }).click();
}
export async function settings(page: Page) {
  const toggle = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (await toggle.isVisible()) await toggle.click();
  await page
    .getByRole("button", { name: "Your space and data settings", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Your space", exact: true }),
  ).toBeVisible();
}
export async function stored(page: Page): Promise<PlanningData> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
}
export async function save(page: Page, name = "Save changes") {
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
}
