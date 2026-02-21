import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fixtures = [
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
];

async function main() {
  for (const fixture of fixtures) {
    await prisma.user.upsert({
      where: { id: fixture.user.id },
      create: {
        ...fixture.user,
        profile: {
          create: {
            ...fixture.profile,
          },
        },
      },
      update: {
        email: fixture.user.email,
        passwordHash: fixture.user.passwordHash,
        profile: {
          upsert: {
            create: {
              ...fixture.profile,
            },
            update: {
              displayName: fixture.profile.displayName,
              timezone: fixture.profile.timezone,
              unitSystem: fixture.profile.unitSystem,
              calorieGoal: fixture.profile.calorieGoal,
            },
          },
        },
      },
    });
  }

  console.log(`Seeded ${fixtures.length} deterministic users and profiles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
