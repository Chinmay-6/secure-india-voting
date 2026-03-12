-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "symbolImage" BYTEA,
ADD COLUMN     "symbolImageMime" TEXT,
ADD COLUMN     "verificationDetails" TEXT,
ADD COLUMN     "verificationDoc" BYTEA,
ADD COLUMN     "verificationDocMime" TEXT;
