import type { FoodEntry, Profile } from "@/lib/calorie-types";

export const defaultProfile: Profile = {
  timezone: "America/Chicago",
  calorieGoal: 2200,
};

export const persistedEntries: FoodEntry[] = [
  { id: "1", consumedAt: "2026-03-08T05:30:00.000Z", calories: 450, mealName: "Breakfast burrito" },
  { id: "2", consumedAt: "2026-03-08T18:10:00.000Z", calories: 700, mealName: "Chicken bowl" },
  { id: "3", consumedAt: "2026-03-09T00:30:00.000Z", calories: 320, mealName: "Protein shake" },
  { id: "4", consumedAt: "2026-03-10T13:20:00.000Z", calories: 510, mealName: "Turkey sandwich" },
  { id: "5", consumedAt: "2026-03-12T02:40:00.000Z", calories: 830, mealName: "Salmon + rice" },
  { id: "6", consumedAt: "2026-03-14T16:00:00.000Z", calories: 610, mealName: "Pasta" },
  { id: "7", consumedAt: "2026-03-15T03:30:00.000Z", calories: 390, mealName: "Greek yogurt" },
  { id: "8", consumedAt: "2026-03-15T19:00:00.000Z", calories: 760, mealName: "Burger + fries" },
  { id: "9", consumedAt: "2026-03-16T12:00:00.000Z", calories: 525, mealName: "Chicken wrap" },
  { id: "10", consumedAt: "2026-03-17T00:20:00.000Z", calories: 415, mealName: "Late snack" },
  { id: "11", consumedAt: "2026-03-18T14:15:00.000Z", calories: 680, mealName: "Steak plate" },
  { id: "12", consumedAt: "2026-03-19T01:05:00.000Z", calories: 540, mealName: "Oatmeal + fruit" },
  { id: "13", consumedAt: "2026-03-20T17:45:00.000Z", calories: 735, mealName: "Burrito bowl" },
  { id: "14", consumedAt: "2026-03-21T03:10:00.000Z", calories: 260, mealName: "Casein shake" },
  { id: "15", consumedAt: "2026-03-22T20:20:00.000Z", calories: 920, mealName: "Pizza" },
];

export async function fetchPersistedEntries(): Promise<FoodEntry[]> {
  return Promise.resolve(persistedEntries);
}
