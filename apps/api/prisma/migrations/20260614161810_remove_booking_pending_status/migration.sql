-- Drop the unused PENDING value from BookingStatus.
-- Bookings are created directly in WAITING_PAYMENT (offline payment flow), so
-- PENDING was never set. Postgres can't drop an enum value in place, so swap the
-- type (the standard Prisma-generated pattern).
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "BookingStatus_new" AS ENUM ('WAITING_PAYMENT', 'PROOF_SUBMITTED', 'CONFIRMED', 'HONORED', 'CANCELLED');

ALTER TABLE "bookings"
  ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING ("status"::text::"BookingStatus_new");

ALTER TABLE "booking_status_history"
  ALTER COLUMN "fromStatus" TYPE "BookingStatus_new"
  USING ("fromStatus"::text::"BookingStatus_new");

ALTER TABLE "booking_status_history"
  ALTER COLUMN "toStatus" TYPE "BookingStatus_new"
  USING ("toStatus"::text::"BookingStatus_new");

ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";

ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'WAITING_PAYMENT';
