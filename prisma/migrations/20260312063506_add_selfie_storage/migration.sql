-- AlterTable
ALTER TABLE "Voter" ADD COLUMN     "selfieImage" BYTEA,
ALTER COLUMN "faceDescriptor" DROP NOT NULL;
