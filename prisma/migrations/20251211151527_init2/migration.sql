-- CreateTable
CREATE TABLE "Creator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMetadata" (
    "id" SERIAL NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "Url" TEXT NOT NULL,

    CONSTRAINT "AssetMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_walletAddress_key" ON "Creator"("walletAddress");

-- AddForeignKey
ALTER TABLE "AssetMetadata" ADD CONSTRAINT "AssetMetadata_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
