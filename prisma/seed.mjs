import { PrismaClient } from "@prisma/client";
import { seedFixtures } from "./seed-fixtures.mjs";

const prisma = new PrismaClient();

async function main() {
  for (const fixture of seedFixtures) {
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

  console.log(`Seeded ${seedFixtures.length} deterministic users and profiles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
