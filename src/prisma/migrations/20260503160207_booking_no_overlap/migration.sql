CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION immutable_tstzrange(timestamptz, timestamptz)
RETURNS tstzrange
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
SELECT tstzrange($1, $2, '[)')
           $$;

ALTER TABLE "BookingItem"
    ADD CONSTRAINT booking_item_no_overlap_per_staff
    EXCLUDE USING gist (
  "staffId" WITH =,
  immutable_tstzrange("startAt", "endAt") WITH &&
);