-- Keep migration history structurally identical to the Prisma datamodel.
ALTER TABLE "user_profiles" RENAME CONSTRAINT "users_pkey" TO "user_profiles_pkey";
ALTER TABLE "user_profiles" ALTER COLUMN "updatedAt" DROP DEFAULT;
