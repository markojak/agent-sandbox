export type FoodEntry = {
  id: string;
  consumedAt: string;
  calories: number;
  mealName: string;
};

export type Profile = {
  timezone: string;
  calorieGoal: number;
};

export type DailyTotal = {
  date: string;
  totalCalories: number;
  entryCount: number;
};
