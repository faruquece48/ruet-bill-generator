-- CreateTable
CREATE TABLE "VisitEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitDay" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "VisitEvent_visitDay_idx" ON "VisitEvent"("visitDay");
