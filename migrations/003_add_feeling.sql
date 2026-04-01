-- Add feeling column to practice_logs
ALTER TABLE practice_logs ADD COLUMN IF NOT EXISTS feeling text;
