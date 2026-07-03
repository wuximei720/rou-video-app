-- CreateTable
CREATE TABLE "VideoGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userInput" TEXT NOT NULL,
    "referenceImagePath" TEXT,
    "scenes" TEXT NOT NULL,
    "generatedVideoUrl" TEXT,
    "processedVideoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
