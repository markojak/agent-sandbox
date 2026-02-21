-- CreateTable
CREATE TABLE "FoodEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealName" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "mealTime" DATETIME NOT NULL,
    "notes" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodEntry_idempotencyKey_key" ON "FoodEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "FoodEntry_mealTime_idx" ON "FoodEntry"("mealTime");
