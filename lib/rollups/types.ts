export type DateKey = `${number}-${number}-${number}`;

export interface FoodEntry {
  id: string;
  userId: string;
  calories: number;
  consumedAt: string;
}

export interface UserProfile {
  userId: string;
  dailyCalorieGoal: number;
  timeZone: string;
}

export interface DailyRollup {
  userId: string;
  date: DateKey;
  totalCalories: number;
  entryCount: number;
  hasLogs: boolean;
  updatedAt: string;
}

export interface WeeklyAdherence {
  scorePercent: number;
  successfulDays: number;
  windowDays: number;
}

export interface StreakMetrics {
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface InsightsMetrics {
  asOfDate: DateKey;
  rollingAverageCalories7d: number;
  weeklyAdherence: WeeklyAdherence;
  streaks: StreakMetrics;
}

export interface MaterializeRollupsParams {
  userId: string;
  profile: UserProfile;
  entries: FoodEntry[];
  existingRollups?: DailyRollup[];
  startDate: DateKey;
  endDate: DateKey;
  changedEntryDates?: DateKey[];
}

export interface MaterializeRollupsResult {
  rollups: DailyRollup[];
  insights: InsightsMetrics;
  recomputedRange: {
    startDate: DateKey;
    endDate: DateKey;
  };
}
