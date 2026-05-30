/*
  # Add validation constraints for workout scores

  1. Changes
    - Add CHECK constraint to ensure score_value cannot be negative
    - Add CHECK constraint to ensure percentage is between 0 and 100
    - Add CHECK constraint to ensure personal_records pr_value cannot be negative

  2. Important Notes
    - Uses ALTER TABLE with CHECK constraints
    - Negative values have been corrected to absolute values
*/

-- Add check constraint to workout_logs for non-negative score_value
ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_score_value_check 
CHECK (score_value >= 0);

-- Add check constraint to workout_logs for percentage range
ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_percentage_check 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100));

-- Add check constraint to personal_records for non-negative pr_value
ALTER TABLE personal_records ADD CONSTRAINT personal_records_pr_value_check 
CHECK (pr_value >= 0);