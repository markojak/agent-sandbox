import test from "node:test";
import assert from "node:assert/strict";

import { seedFixtures } from "../prisma/seed-fixtures.mjs";

test("seed fixtures are deterministic and unique", () => {
  assert.equal(seedFixtures.length, 2);

  const userIds = new Set(seedFixtures.map((fixture) => fixture.user.id));
  const emails = new Set(seedFixtures.map((fixture) => fixture.user.email));
  const profileIds = new Set(seedFixtures.map((fixture) => fixture.profile.id));

  assert.equal(userIds.size, seedFixtures.length);
  assert.equal(emails.size, seedFixtures.length);
  assert.equal(profileIds.size, seedFixtures.length);

  assert.deepEqual(seedFixtures.map((fixture) => fixture.user.id).sort(), [
    "usr_demo_alex",
    "usr_demo_sam",
  ]);
});
