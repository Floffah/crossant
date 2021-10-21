-- CreateTable
CREATE TABLE "Cache" (
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Cache_name_key" ON "Cache"("name");
