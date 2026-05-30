ALTER TABLE "Settings" ADD COLUMN "requireConfirmation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Settings" ADD COLUMN "confirmWindowMaxHours" INTEGER NOT NULL DEFAULT 168;
ALTER TABLE "Settings" ADD COLUMN "confirmWindowMinHours" INTEGER NOT NULL DEFAULT 24;
ALTER TABLE "Settings" ADD COLUMN "companyOwnerName" TEXT;
ALTER TABLE "Settings" ADD COLUMN "nip" TEXT;
ALTER TABLE "Settings" ADD COLUMN "regon" TEXT;
ALTER TABLE "Settings" ADD COLUMN "facebookUrl" TEXT;
