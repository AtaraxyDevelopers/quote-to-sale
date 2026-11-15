import { round, sum, ratio, days, money, metric, notice } from "./lib.mjs";
export const config = {
  slug: "quote-to-sale",
  title: "Quote to Sale",
  description:
    "Prepare clear quotations and export customer-ready HTML documents.",
  scope:
    "Export an HTML quote to send or host yourself. Customer acceptance opens an email draft; record acceptance after receiving confirmation. No payment processing or electronic signature service.",
  method:
    "Total = quantity × unit price × (1 − discount / 100) × (1 + tax / 100), rounded to two decimals per quote. Tax is a user-supplied percentage, not a tax determination.",
  port: 4414,
  asOf: "2026-11-15",
  fields: [
    {
      key: "name",
      label: "Customer / business name",
      type: "text",
    },
    {
      key: "email",
      label: "Customer email",
      type: "email",
    },
    {
      key: "description",
      label: "Work / product description",
      type: "text",
    },
    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      min: 1,
      max: 100000,
    },
    {
      key: "unitPrice",
      label: "Unit price",
      type: "number",
      min: 0,
      max: 100000000,
    },
    {
      key: "discount",
      label: "Discount (%)",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      key: "tax",
      label: "Tax (%)",
      type: "number",
      min: 0,
      max: 100,
    },
    {
      key: "validUntil",
      label: "Valid until",
      type: "date",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["draft", "sent", "accepted", "declined"],
    },
  ],
  settings: [
    {
      key: "currency",
      label: "Currency code (one currency per workspace)",
      type: "text",
      maxLength: 3,
    },
    {
      key: "businessName",
      label: "Your business name",
      type: "text",
    },
    {
      key: "replyEmail",
      label: "Acceptance reply email",
      type: "email",
    },
    {
      key: "terms",
      label: "Quote terms",
      type: "text",
    },
  ],
  actions: [
    {
      label: "Mark sent",
      patch: {
        status: "sent",
      },
      when: {
        status: ["draft"],
      },
    },
    {
      label: "Record acceptance",
      patch: {
        status: "accepted",
      },
      when: {
        status: ["sent"],
      },
    },
  ],
  document: true,
};

export const example = {
  schemaVersion: 1,
  project: "quote-to-sale",
  settings: {
    currency: "USD",
    businessName: "Example Studio",
    replyEmail: "sales@example.com",
    terms: "Confirm scope and delivery dates before work begins.",
  },
  records: [
    {
      id: "quote-1",
      name: "Maple Studio",
      email: "buyer@example.com",
      description: "Website maintenance package",
      quantity: 2,
      unitPrice: 500,
      discount: 10,
      tax: 5,
      validUntil: "2026-11-30",
      status: "sent",
    },
    {
      id: "quote-2",
      name: "River Foods",
      email: "team@example.com",
      description: "Analytics setup",
      quantity: 1,
      unitPrice: 1200,
      discount: 0,
      tax: 0,
      validUntil: "2026-11-10",
      status: "draft",
    },
  ],
};
export function analyze(records, s, asOf) {
  const total = (r) =>
    round(
      r.quantity * r.unitPrice * (1 - r.discount / 100) * (1 + r.tax / 100),
    );
  return {
    metrics: [
      metric("Quoted value", money(sum(records.map(total))), s.currency),
      metric(
        "Accepted value",
        money(sum(records.filter((r) => r.status === "accepted").map(total))),
        s.currency,
      ),
      metric(
        "Expired open quotes",
        records.filter(
          (r) =>
            !["accepted", "declined"].includes(r.status) && r.validUntil < asOf,
        ).length,
      ),
    ],
    notices: [],
    columns: ["Customer", "Description", "Total", "Status", "Valid until"],
    rows: records.map((r) => ({
      id: r.id,
      Customer: r.name,
      Description: r.description,
      Total: money(total(r)),
      Status: r.status,
      "Valid until": r.validUntil,
    })),
  };
}
