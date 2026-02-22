import { describe, expect, it } from "vitest";

import { parseCalories, parseQuickEntry, validateFoodEntryPayload } from "@/lib/core/food-entry";

describe("food entry parsing + validation", () => {
  it("parses calories from string and rounds", () => {
    expect(parseCalories("199.8")).toBe(200);
  });

  it("rejects invalid calories", () => {
    expect(parseCalories("abc")).toBeNull();
    expect(parseCalories(0)).toBeNull();
  });

  it("parses quick entry format", () => {
    expect(parseQuickEntry("oatmeal: 350")).toEqual({ name: "oatmeal", calories: 350 });
    expect(parseQuickEntry("bad format")).toBeNull();
  });

  it("validates entry payload", () => {
    const validation = validateFoodEntryPayload({
      name: "Lunch",
      calories: "540",
      consumedAt: "2026-02-21T12:00:00.000Z",
      quantity: 1,
      notes: "post workout",
    });

    expect(validation.ok).toBe(true);
    if (validation.ok) {
      expect(validation.value.calories).toBe(540);
      expect(validation.value.name).toBe("Lunch");
    }
  });

  it("returns validation errors for malformed payload", () => {
    const validation = validateFoodEntryPayload({
      name: "",
      calories: -1,
      consumedAt: "nope",
    });

    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.errors).toEqual(
        expect.arrayContaining([
          "name is required",
          "calories must be a positive number",
          "consumedAt must be a valid ISO date string",
        ]),
      );
    }
  });
});
