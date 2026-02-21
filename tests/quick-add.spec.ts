import { describe, expect, it } from "vitest";
import { parseQuickAdd } from "@/lib/food-entries/quick-add";

describe("parseQuickAdd", () => {
  it("parses quantity, meal name, and calories", () => {
    const result = parseQuickAdd("2 eggs and toast 420");

    expect(result).toEqual({
      success: true,
      value: {
        mealName: "eggs and toast",
        calories: 420,
        quantity: 2,
      },
    });
  });

  it("defaults quantity to 1 when omitted", () => {
    const result = parseQuickAdd("banana 105");

    expect(result).toEqual({
      success: true,
      value: {
        mealName: "banana",
        calories: 105,
        quantity: 1,
      },
    });
  });

  it("rejects quick add text without calorie token", () => {
    const result = parseQuickAdd("2 eggs and toast");

    expect(result).toEqual({
      success: false,
      error: "Quick add must end with calories, e.g. '2 eggs and toast 420'.",
    });
  });

  it("rejects calories outside bounds", () => {
    const result = parseQuickAdd("2 eggs 6000");

    expect(result).toEqual({
      success: false,
      error: "Calories must be between 1 and 5000.",
    });
  });
});
