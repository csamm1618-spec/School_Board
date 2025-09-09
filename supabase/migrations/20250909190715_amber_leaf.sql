/*
  # School Board Database Schema

  1. New Tables
    - `parents`
      - `id` (uuid, primary key)
      - `parent_name` (text, required)
      - `phone_number` (text, required)
      - `email` (text, optional)
      - `relationship` (text, required)
      - `created_at` (timestamp)
    - `students`
      - `id` (uuid, primary key)
      - `student_name` (text, required)
      - `grade` (text, required)
      - `date_of_birth` (date, optional)
      - `created_at` (timestamp)
    - `parent_student`
      - `id` (uuid, primary key)
      - `parent_id` (uuid, foreign key)
      - `student_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  relationship text NOT NULL DEFAULT 'Parent',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage parents"
  ON parents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  grade text NOT NULL,
  date_of_birth date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage students"
  ON students
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Parent-Student relationship table
CREATE TABLE IF NOT EXISTS parent_student (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage parent-student relationships"
  ON parent_student
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone_number);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON parent_student(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON parent_student(student_id);