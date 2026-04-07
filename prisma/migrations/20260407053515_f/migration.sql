-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "description" TEXT,
    "salary" TEXT,
    "location" TEXT,
    "applyLink" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "internHackUrl" TEXT,
    "linkedinPost" TEXT,
    "simpleSummary" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramSettings" (
    "id" TEXT NOT NULL,
    "botToken" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramSettings_pkey" PRIMARY KEY ("id")
);
