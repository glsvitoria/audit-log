-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "enterprise_id" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ENTERPRISE';

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
