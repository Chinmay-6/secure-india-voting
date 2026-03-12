-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voter" (
    "id" TEXT NOT NULL,
    "hashedAadhaar" TEXT NOT NULL,
    "displayName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "faceDescriptor" TEXT NOT NULL,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptHash" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_hashedAadhaar_key" ON "Voter"("hashedAadhaar");

-- CreateIndex
CREATE UNIQUE INDEX "Voter_sessionToken_key" ON "Voter"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_voterId_key" ON "Vote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_receiptHash_key" ON "Vote"("receiptHash");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
