-- AlterTable
ALTER TABLE "NutritionPlan" ADD COLUMN     "dietType" TEXT DEFAULT 'High Protein';

-- CreateIndex
CREATE INDEX "NutritionPlan_assignedToId_idx" ON "NutritionPlan"("assignedToId");

-- CreateIndex
CREATE INDEX "NutritionPlan_createdById_idx" ON "NutritionPlan"("createdById");

-- CreateIndex
CREATE INDEX "WorkoutPlan_assignedToId_idx" ON "WorkoutPlan"("assignedToId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_createdById_idx" ON "WorkoutPlan"("createdById");
