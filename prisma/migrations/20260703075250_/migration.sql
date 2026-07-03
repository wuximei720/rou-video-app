/*
  Warnings:

  - You are about to drop the column `referenceImagePath` on the `VideoGeneration` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VideoGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userInput" TEXT NOT NULL,
    "referenceImageUrl" TEXT,
    "scenes" TEXT NOT NULL,
    "generatedVideoUrl" TEXT,
    "processedVideoUrl" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VideoGeneration" ("createdAt", "generatedVideoUrl", "id", "processedVideoUrl", "scenes", "status", "updatedAt", "userInput") SELECT "createdAt", "generatedVideoUrl", "id", "processedVideoUrl", "scenes", "status", "updatedAt", "userInput" FROM "VideoGeneration";
DROP TABLE "VideoGeneration";
ALTER TABLE "new_VideoGeneration" RENAME TO "VideoGeneration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
