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

test("Fractional-cent quotes export the same total shown in the workspace", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const state = await (await fetch("/api/workspace")).json();
    const records = state.records.map((r, i) =>
      i === 0
        ? { ...r, quantity: 1, unitPrice: 1.015, discount: 0, tax: 0 }
        : r,
    );
    const response = await fetch("/api/workspace", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Workspace-Token": state.token,
      },
      body: JSON.stringify({ ...state, records }),
    });
    if (!response.ok) throw new Error(await response.text());
  });
  await page.reload();
  await expect(page.locator("#results tbody tr").first()).toContainText("1.02");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export quote" }).first().click();
  const html = readFileSync(await (await pending).path(), "utf8");
  expect(html).toContain("<strong>1.02 USD</strong>");
  expect(html).toContain("1 × 1.015 USD");
});
