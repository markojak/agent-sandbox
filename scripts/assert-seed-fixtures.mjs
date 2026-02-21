import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expected = [
  {
    id: "usr_demo_alex",
    email: "alex@example.com",
    profile: {
      id: "prf_demo_alex",
      timezone: "America/Chicago",
      unitSystem: "imperial",
      calorieGoal: 2200,
    },
  },
  {
    id: "usr_demo_sam",
    email: "sam@example.com",
    profile: {
      id: "prf_demo_sam",
      timezone: "UTC",
      unitSystem: "metric",
      calorieGoal: 1900,
    },
  },
];

async function main() {
  const users = await prisma.user.findMany({
    where: {
      id: { in: expected.map((fixture) => fixture.id) },
    },
    include: {
      profile: true,
    },
    orderBy: { id: "asc" },
  });

  if (users.length !== expected.length) {
    throw new Error(`Expected ${expected.length} fixture users, found ${users.length}.`);
  }

  for (const fixture of expected) {
    const user = users.find((candidate) => candidate.id === fixture.id);

    if (!user) {
      throw new Error(`Missing seeded user: ${fixture.id}`);
    }

    if (user.email !== fixture.email) {
      throw new Error(`Unexpected email for ${fixture.id}: ${user.email}`);
    }

    if (!user.profile) {
      throw new Error(`Missing profile for ${fixture.id}`);
    }

    if (
      user.profile.id !== fixture.profile.id ||
      user.profile.timezone !== fixture.profile.timezone ||
      user.profile.unitSystem !== fixture.profile.unitSystem ||
      user.profile.calorieGoal !== fixture.profile.calorieGoal
    ) {
      throw new Error(`Seed profile mismatch for ${fixture.id}`);
    }
  }

  console.log("Seed fixtures are deterministic and valid.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
