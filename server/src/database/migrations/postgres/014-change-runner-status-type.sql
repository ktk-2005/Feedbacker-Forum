ALTER TABLE instance_runners ALTER COLUMN status TYPE TEXT;
UPDATE instance_runners SET status=TRIM(status);
