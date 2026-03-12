-- AlterTable
ALTER TABLE "Voter" ADD COLUMN     "mobile" TEXT;

-- CreateTable
CREATE TABLE "VoterOtpChallenge" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterOtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditBlock" (
    "id" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" TEXT,
    "actorId" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoterOtpChallenge_voterId_expiresAt_idx" ON "VoterOtpChallenge"("voterId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuditBlock_idx_key" ON "AuditBlock"("idx");

-- CreateIndex
CREATE UNIQUE INDEX "AuditBlock_hash_key" ON "AuditBlock"("hash");

-- CreateIndex
CREATE INDEX "AuditBlock_action_createdAt_idx" ON "AuditBlock"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "VoterOtpChallenge" ADD CONSTRAINT "VoterOtpChallenge_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
