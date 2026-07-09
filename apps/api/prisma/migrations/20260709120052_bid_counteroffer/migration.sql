-- AlterEnum
ALTER TYPE "BidStatus" ADD VALUE 'countered';

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "counterPrice" INTEGER;
