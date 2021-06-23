-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "optWordCount" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordUse" (
    "word" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCurse" BOOLEAN NOT NULL,

    PRIMARY KEY ("word","userId")
);

-- AddForeignKey
ALTER TABLE "WordUse" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
