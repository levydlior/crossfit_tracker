/*
  # CrossFit Workout Tracker Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, user's display name)
      - `created_at` (timestamp)
    
    - `workout_types`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text, workout/exercise name)
      - `category` (text, e.g., "strength", "metcon", "endurance")
      - `description` (text, optional details)
      - `units` (text, default measurement units like "lbs", "reps", "time")
      - `created_at` (timestamp)
    
    - `workout_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `workout_type_id` (uuid, references workout_types)
      - `date` (date, when the workout was performed)
      - `score_value` (decimal, the actual score/time/reps/weight)
      - `percentage` (decimal, optional percentage of max/goal)
      - `notes` (text, optional notes about the workout)
      - `rx` (boolean, whether performed as prescribed)
      - `created_at` (timestamp)
    
    - `personal_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `workout_type_id` (uuid, references workout_types)
      - `pr_value` (decimal, the PR score)
      - `achieved_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - All policies restrict to authenticated users checking ownership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create workout_types table
CREATE TABLE IF NOT EXISTS workout_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text DEFAULT 'strength',
  description text DEFAULT '',
  units text DEFAULT 'lbs',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on workout_types
ALTER TABLE workout_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workout types"
  ON workout_types FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout types"
  ON workout_types FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout types"
  ON workout_types FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout types"
  ON workout_types FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workout_type_id uuid REFERENCES workout_types(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  score_value decimal(10,2),
  percentage decimal(5,2),
  notes text DEFAULT '',
  rx boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on workout_logs
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create personal_records table
CREATE TABLE IF NOT EXISTS personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workout_type_id uuid REFERENCES workout_types(id) ON DELETE CASCADE NOT NULL,
  pr_value decimal(10,2) NOT NULL,
  achieved_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, workout_type_id)
);

-- Enable RLS on personal_records
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own PRs"
  ON personal_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PRs"
  ON personal_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PRs"
  ON personal_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own PRs"
  ON personal_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_workout ON workout_logs(user_id, workout_type_id);
CREATE INDEX IF NOT EXISTS idx_workout_types_user ON workout_types(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
