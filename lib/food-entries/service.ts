import type { FoodEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseQuickAdd } from "./quick-add";
import {
  validateCalories,
  validateIsoDate,
  validateMealName,
  validateQuantity,
  validateTimeZone,
} from "./validation";
import { utcRangeForLocalDate, zonedDateTimeToUtc } from "./timezone";

export class InputError extends Error {}

export type CreateFoodEntryInput =
  | {
      mode: "quick";
      quickAddText: string;
      mealTime: string;
      notes?: string;
      idempotencyKey?: string;
      timeZone: string;
    }
  | {
      mode: "manual";
      mealName: string;
      calories: number;
      quantity: number;
      mealTime: string;
      notes?: string;
      idempotencyKey?: string;
      timeZone: string;
    };

export type UpdateFoodEntryInput = {
  mealName: string;
  calories: number;
  quantity: number;
  mealTime: string;
  notes?: string;
  timeZone: string;
};

export async function createFoodEntry(input: CreateFoodEntryInput): Promise<FoodEntry> {
  const timezoneError = validateTimeZone(input.timeZone);
  if (timezoneError) {
    throw new InputError(timezoneError);
  }

  const mealTime = zonedDateTimeToUtc(input.mealTime, input.timeZone);
  const notes = input.notes?.trim() || null;

  if (input.idempotencyKey) {
    const existing = await prisma.foodEntry.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });

    if (existing) {
      return existing;
    }
  }

  if (input.mode === "quick") {
    const parsed = parseQuickAdd(input.quickAddText);
    if (!parsed.success) {
      throw new InputError(parsed.error);
    }

    return prisma.foodEntry.create({
      data: {
        ...parsed.value,
        mealTime,
        notes,
        idempotencyKey: input.idempotencyKey,
      },
    });
  }

  validateManualFields(input.mealName, input.calories, input.quantity);

  return prisma.foodEntry.create({
    data: {
      mealName: input.mealName.trim(),
      calories: input.calories,
      quantity: input.quantity,
      mealTime,
      notes,
      idempotencyKey: input.idempotencyKey,
    },
  });
}

export async function getFoodEntriesByDate(date: string, timeZone: string): Promise<FoodEntry[]> {
  const dateError = validateIsoDate(date);
  if (dateError) {
    throw new InputError(dateError);
  }

  const timezoneError = validateTimeZone(timeZone);
  if (timezoneError) {
    throw new InputError(timezoneError);
  }

  const { startUtc, endUtc } = utcRangeForLocalDate(date, timeZone);

  return prisma.foodEntry.findMany({
    where: {
      mealTime: {
        gte: startUtc,
        lt: endUtc,
      },
    },
    orderBy: {
      mealTime: "asc",
    },
  });
}

export async function updateFoodEntry(id: string, input: UpdateFoodEntryInput): Promise<FoodEntry> {
  const timezoneError = validateTimeZone(input.timeZone);
  if (timezoneError) {
    throw new InputError(timezoneError);
  }

  validateManualFields(input.mealName, input.calories, input.quantity);

  const mealTime = zonedDateTimeToUtc(input.mealTime, input.timeZone);

  return prisma.foodEntry.update({
    where: { id },
    data: {
      mealName: input.mealName.trim(),
      calories: input.calories,
      quantity: input.quantity,
      mealTime,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function deleteFoodEntry(id: string): Promise<void> {
  await prisma.foodEntry.delete({ where: { id } });
}

function validateManualFields(mealName: string, calories: number, quantity: number) {
  const mealNameError = validateMealName(mealName);
  if (mealNameError) {
    throw new InputError(mealNameError);
  }

  const calorieError = validateCalories(calories);
  if (calorieError) {
    throw new InputError(calorieError);
  }

  const quantityError = validateQuantity(quantity);
  if (quantityError) {
    throw new InputError(quantityError);
  }
}
