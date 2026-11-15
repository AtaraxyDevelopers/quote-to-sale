import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("Customer quote export includes correct total and acceptance draft", async ({
  page,
}) => {
  await page.goto("/");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export quote" }).first().click();
  const download = await pending;
  const text = readFileSync(await download.path(), "utf8");
  expect(text).toContain("945.00 USD");
  expect(text).toContain("mailto:sales@example.com");
  expect(text).toContain("Request acceptance by email");
});
