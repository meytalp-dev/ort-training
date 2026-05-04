-- =====================================================
-- Impact SO Lashon — Database Schema
-- Run this once in Supabase SQL Editor
-- All tables protected with Row Level Security (RLS)
-- =====================================================

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  type TEXT DEFAULT 'high_school',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'teacher',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  grade TEXT,
  exam_module TEXT DEFAULT 'lashon_70',
  bagrut_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_id_number TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LESSONS PROGRESS — tracks which lessons each class has completed
CREATE TABLE IF NOT EXISTS lessons_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, lesson_date, lesson_id)
);

-- 6. EVALUATIONS — bochanim, mivchanim, hagashot
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  topic TEXT NOT NULL,
  date DATE NOT NULL,
  score NUMERIC(5,2),
  max_score NUMERIC(5,2) DEFAULT 100,
  notes TEXT,
  rubric JSONB,
  ai_proposed_score NUMERIC(5,2),
  teacher_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DNA SKILLS — granular skill mastery per student
CREATE TABLE IF NOT EXISTS dna_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  skill_label TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_level NUMERIC(5,2) DEFAULT 0,
  attempts INT DEFAULT 0,
  correct INT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);

-- 8. PRACTICE ATTEMPTS — every question a student answers
CREATE TABLE IF NOT EXISTS practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_track TEXT,
  user_answer TEXT,
  correct BOOLEAN,
  partial BOOLEAN DEFAULT FALSE,
  score NUMERIC(5,2),
  hints_used INT DEFAULT 0,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PORTFOLIO — student writing portfolio with AI feedback
CREATE TABLE IF NOT EXISTS portfolio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  content TEXT,
  ai_feedback JSONB,
  teacher_feedback TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI ASSISTANT CONVERSATIONS — chat history
CREATE TABLE IF NOT EXISTS assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::JSONB,
  context JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;

-- Helper function: get teacher_id of current user
CREATE OR REPLACE FUNCTION current_teacher_id()
RETURNS UUID AS $$
  SELECT id FROM teachers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get school_id of current user
CREATE OR REPLACE FUNCTION current_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM teachers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- POLICIES

-- Schools: anyone authenticated can see their own school
DROP POLICY IF EXISTS "School read own" ON schools;
CREATE POLICY "School read own" ON schools FOR SELECT USING (
  id = current_school_id() OR
  EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
);

-- Teachers: read own row + others in same school
DROP POLICY IF EXISTS "Teacher read self and same school" ON teachers;
CREATE POLICY "Teacher read self and same school" ON teachers FOR SELECT USING (
  user_id = auth.uid() OR school_id = current_school_id()
);

DROP POLICY IF EXISTS "Teacher insert self" ON teachers;
CREATE POLICY "Teacher insert self" ON teachers FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Teacher update self" ON teachers;
CREATE POLICY "Teacher update self" ON teachers FOR UPDATE USING (user_id = auth.uid());

-- Classes: own classes only
DROP POLICY IF EXISTS "Classes own" ON classes;
CREATE POLICY "Classes own" ON classes FOR ALL USING (teacher_id = current_teacher_id());

-- Students: only students in own classes
DROP POLICY IF EXISTS "Students in own classes" ON students;
CREATE POLICY "Students in own classes" ON students FOR ALL USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = current_teacher_id())
);

-- Lessons progress: own classes
DROP POLICY IF EXISTS "Lessons own classes" ON lessons_progress;
CREATE POLICY "Lessons own classes" ON lessons_progress FOR ALL USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = current_teacher_id())
);

-- Evaluations: own students
DROP POLICY IF EXISTS "Evaluations own" ON evaluations;
CREATE POLICY "Evaluations own" ON evaluations FOR ALL USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = current_teacher_id())
);

-- DNA: own students
DROP POLICY IF EXISTS "DNA own students" ON dna_skills;
CREATE POLICY "DNA own students" ON dna_skills FOR ALL USING (
  student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.teacher_id = current_teacher_id()
  )
);

-- Practice attempts: own students
DROP POLICY IF EXISTS "Practice attempts own" ON practice_attempts;
CREATE POLICY "Practice attempts own" ON practice_attempts FOR ALL USING (
  student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.teacher_id = current_teacher_id()
  )
);

-- Portfolio: own students
DROP POLICY IF EXISTS "Portfolio own" ON portfolio_entries;
CREATE POLICY "Portfolio own" ON portfolio_entries FOR ALL USING (
  student_id IN (
    SELECT s.id FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE c.teacher_id = current_teacher_id()
  )
);

-- Assistant conversations: own only
DROP POLICY IF EXISTS "Assistant own" ON assistant_conversations;
CREATE POLICY "Assistant own" ON assistant_conversations FOR ALL USING (teacher_id = current_teacher_id());

-- =====================================================
-- AUTOMATIC TEACHER PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_school_id UUID;
  user_school_name TEXT;
BEGIN
  user_school_name := COALESCE(NEW.raw_user_meta_data->>'school_name', 'אורט בית הערבה');

  -- Find or create the school
  SELECT id INTO default_school_id FROM schools WHERE name = user_school_name LIMIT 1;
  IF default_school_id IS NULL THEN
    INSERT INTO schools (name, city) VALUES (user_school_name, COALESCE(NEW.raw_user_meta_data->>'school_city', 'ירושלים'))
    RETURNING id INTO default_school_id;
  END IF;

  -- Create teacher profile
  INSERT INTO teachers (user_id, school_id, full_name, email)
  VALUES (
    NEW.id,
    default_school_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- DEMO DATA — schools (run after first teacher signs up if you want demo content)
-- =====================================================

INSERT INTO schools (name, city) VALUES
  ('אורט בית הערבה', 'ירושלים'),
  ('עירוני א'' תל אביב', 'תל אביב'),
  ('בליך רמת גן', 'רמת גן'),
  ('דליות הכרמל', 'חיפה'),
  ('אולפנת צביה', 'ירושלים')
ON CONFLICT DO NOTHING;

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class_date ON lessons_progress(class_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_evaluations_class ON evaluations(class_id);
CREATE INDEX IF NOT EXISTS idx_dna_student ON dna_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_practice_student ON practice_attempts(student_id);
