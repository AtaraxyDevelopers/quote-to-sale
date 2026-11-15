import test from "node:test";
import assert from "node:assert/strict";
import { config, example, analyze } from "../src/domain.mjs";
import { validateState } from "../src/lib.mjs";
test("Documented sample results match independently specified expectations", () => {
  const report = analyze(example.records, example.settings, config.asOf);
  for (const [label, value] of [
    ["Quoted value", "2145.00"],
    ["Accepted value", "0.00"],
    ["Expired open quotes", 1],
  ])
    assert.equal(
      report.metrics.find((m) => m.label === label).value,
      value,
      label,
    );
});
test("Business edge cases", () => {
  (function edge(records, s, analyze) {
    assert.equal(
      analyze([{ ...records[0], discount: 100 }], s, "2026-11-15").rows[0]
        .Total,
      "0.00",
    );
    assert.equal(
      analyze([{ ...records[0], validUntil: "2026-11-15" }], s, "2026-11-15")
        .metrics[2].value,
      0,
    );
  })(example.records, example.settings, analyze, validateState);
});
