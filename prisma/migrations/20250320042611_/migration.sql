/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `kindeId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `waitlists` table. All the data in the column will be lost.
  - You are about to drop the column `releasedAt` on the `waitlists` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kinde_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kinde_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_kindeId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "deletedAt",
DROP COLUMN "kindeId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "kinde_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "waitlists" DROP COLUMN "createdAt",
DROP COLUMN "releasedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "released_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_kinde_id_key" ON "users"("kinde_id");
