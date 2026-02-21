export const seedFixtures = Object.freeze([
  {
    user: {
      id: "usr_demo_alex",
      email: "alex@example.com",
      passwordHash: "$2b$10$fixturehashalexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    },
    profile: {
      id: "prf_demo_alex",
      displayName: "Alex Demo",
      timezone: "America/Chicago",
      unitSystem: "imperial",
      calorieGoal: 2200,
    },
  },
  {
    user: {
      id: "usr_demo_sam",
      email: "sam@example.com",
      passwordHash: "$2b$10$fixturehashsamxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    },
    profile: {
      id: "prf_demo_sam",
      displayName: "Sam Demo",
      timezone: "UTC",
      unitSystem: "metric",
      calorieGoal: 1900,
    },
  },
]);
