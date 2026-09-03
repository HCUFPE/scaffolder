-- Replace the legacy local-password account with a Keycloak-linked local profile.
BEGIN;

ALTER TABLE "users" RENAME TO "user_profiles";
ALTER TABLE "user_profiles" RENAME COLUMN "role" TO "roleSnapshot";
ALTER TABLE "user_profiles" RENAME COLUMN "isActive" TO "isActiveLocal";
ALTER TABLE "user_profiles" ADD COLUMN "keycloakUserId" TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "user_profiles" WHERE "keycloakUserId" IS NULL) THEN
    RAISE EXCEPTION 'Existing local-password users must be migrated to Keycloak before this migration can continue';
  END IF;
END $$;

ALTER TABLE "user_profiles" ALTER COLUMN "keycloakUserId" SET NOT NULL;
ALTER TABLE "user_profiles" DROP COLUMN "passwordHash";
ALTER INDEX IF EXISTS "users_email_key" RENAME TO "user_profiles_email_key";
CREATE UNIQUE INDEX "user_profiles_keycloakUserId_key" ON "user_profiles"("keycloakUserId");

CREATE TABLE "sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tokenHash" TEXT NOT NULL,
  "userProfileId" UUID NOT NULL,
  "keycloakSubject" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sessions_userProfileId_fkey"
    FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");
CREATE INDEX "sessions_userProfileId_idx" ON "sessions"("userProfileId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

COMMIT;
