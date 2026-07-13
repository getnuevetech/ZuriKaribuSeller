-- Add payment method fields to sellers table
ALTER TABLE "sellers" ADD COLUMN "paypalEmail" TEXT;
ALTER TABLE "sellers" ADD COLUMN "wireTransferInfo" JSONB;
ALTER TABLE "sellers" ADD COLUMN "localDepositInfo" JSONB;
