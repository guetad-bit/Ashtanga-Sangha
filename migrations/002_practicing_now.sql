-- Migration: Add practicing_now columns + fix practice_logs visibility
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS practicing_now boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS practicing_started_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS teacher text;

-- 2. Allow all authenticated users to see practice logs (for community feed)
-- Drop the restrictive policy and replace with a public one
DROP POLICY IF EXISTS "Users can view own logs" ON practice_logs;
CREATE POLICY "Practice logs are viewable by everyone" ON practice_logs FOR SELECT USING (true);

-- 3. Users can still only delete/update their own logs
CREATE POLICY IF NOT EXISTS "Users can update own logs" ON practice_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own logs" ON practice_logs FOR DELETE USING (auth.uid() = user_id);
