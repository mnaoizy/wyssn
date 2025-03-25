-- DropForeignKey
ALTER TABLE "api_usage" DROP CONSTRAINT "api_usage_user_id_fkey";

-- AddForeignKey
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
