export type CommodityCode = "BRENT" | "WTI" | "OPEC";

export type CommodityDefinition = {
  code: CommodityCode;
  label: string;
  description: string;
};

export const COMMODITIES: CommodityDefinition[] = [
  {
    code: "BRENT",
    label: "Brent Crude Oil",
    description: "North Sea benchmark"
  },
  {
    code: "WTI",
    label: "WTI",
    description: "West Texas Intermediate"
  },
  {
    code: "OPEC",
    label: "OPEC Basket",
    description: "OPEC reference basket"
  }
];

export function normalizeCommodity(value: string | null | undefined): CommodityCode {
  if (!value) {
    return "BRENT";
  }

  const normalized = value.toUpperCase();
  if (normalized === "WTI" || normalized === "OPEC") {
    return normalized;
  }

  return "BRENT";
}
