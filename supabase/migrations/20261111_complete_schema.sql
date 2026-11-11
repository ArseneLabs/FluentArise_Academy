-- ==============================================================================
-- FluentaRise Academy - Complete Supabase Database Schema & Initial Super Admin
-- Description: Creates all project tables, RLS policies, indexes, and seeds the
--              primary Super Admin account (KWIZERA Josee Micheline).
-- ==============================================================================

-- 1. PROFILES TABLE (Users, Roles, Super Admin Approvals)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  password_hash text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'instructor', 'student')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  headline text,
  bio text,
  avatar text,
  enrolled_course_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructor_id text,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. ORDERS TABLE (Cart & Checkout Payments)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('bank', 'momo')),
  payment_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  level text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  discount_price integer,
  free boolean NOT NULL DEFAULT false,
  thumbnail text,
  promo_video_url text,
  instructor_id text,
  published boolean NOT NULL DEFAULT false,
  certificate boolean NOT NULL DEFAULT true,
  assessments_enabled boolean NOT NULL DEFAULT true,
  lessons_count integer NOT NULL DEFAULT 0,
  tasks_count integer NOT NULL DEFAULT 0,
  students_count integer NOT NULL DEFAULT 0,
  rating numeric(3,2) NOT NULL DEFAULT 0.00,
  revenue integer NOT NULL DEFAULT 0,
  curriculum jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. INSTRUCTORS TABLE
CREATE TABLE IF NOT EXISTS public.instructors (
  id text PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  bio text,
  avatar text,
  email text NOT NULL,
  course_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  rating numeric(3,2) NOT NULL DEFAULT 0.00,
  students integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. SUBMISSIONS TABLE (Quizzes & Assignments)
CREATE TABLE IF NOT EXISTS public.submissions (
  id text PRIMARY KEY,
  student_name text NOT NULL,
  student_avatar text,
  course_id text NOT NULL,
  course_title text NOT NULL,
  task_id text NOT NULL,
  task_title text NOT NULL,
  task_kind text NOT NULL CHECK (task_kind IN ('quiz', 'test', 'assignment')),
  submitted_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'needs_grading', 'auto_graded', 'graded', 'resubmission_requested')),
  score numeric,
  max_score numeric NOT NULL DEFAULT 100,
  file_name text,
  file_size text,
  response_text text,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text,
  body text,
  author text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  published_at timestamptz,
  cover text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. CALENDAR EVENTS TABLE (Workshops, Live Classes, Webinars)
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('Workshop', 'Webinar', 'Live Class', 'Exam Session')),
  date text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  instructor text NOT NULL,
  capacity integer NOT NULL DEFAULT 50,
  enrolled integer NOT NULL DEFAULT 0,
  color text DEFAULT '#0284c7',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id text PRIMARY KEY DEFAULT 'global',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(published);
CREATE INDEX IF NOT EXISTS idx_submissions_course_id ON public.submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
GRANT ALL ON public.profiles TO anon, authenticated;
DROP POLICY IF EXISTS "profiles_all_access" ON public.profiles;
CREATE POLICY "profiles_all_access" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Orders policies
GRANT ALL ON public.orders TO anon, authenticated;
DROP POLICY IF EXISTS "orders_all_access" ON public.orders;
CREATE POLICY "orders_all_access" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Courses policies
GRANT ALL ON public.courses TO anon, authenticated;
DROP POLICY IF EXISTS "courses_all_access" ON public.courses;
CREATE POLICY "courses_all_access" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Instructors policies
GRANT ALL ON public.instructors TO anon, authenticated;
DROP POLICY IF EXISTS "instructors_all_access" ON public.instructors;
CREATE POLICY "instructors_all_access" ON public.instructors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Submissions policies
GRANT ALL ON public.submissions TO anon, authenticated;
DROP POLICY IF EXISTS "submissions_all_access" ON public.submissions;
CREATE POLICY "submissions_all_access" ON public.submissions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Blog posts policies
GRANT ALL ON public.blog_posts TO anon, authenticated;
DROP POLICY IF EXISTS "blog_posts_all_access" ON public.blog_posts;
CREATE POLICY "blog_posts_all_access" ON public.blog_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Calendar events policies
GRANT ALL ON public.calendar_events TO anon, authenticated;
DROP POLICY IF EXISTS "calendar_events_all_access" ON public.calendar_events;
CREATE POLICY "calendar_events_all_access" ON public.calendar_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Platform settings policies
GRANT ALL ON public.platform_settings TO anon, authenticated;
DROP POLICY IF EXISTS "platform_settings_all_access" ON public.platform_settings;
CREATE POLICY "platform_settings_all_access" ON public.platform_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED PRIMARY SUPER ADMIN ACCOUNT
-- ==============================================================================
INSERT INTO public.profiles (
  id,
  name,
  email,
  phone,
  password_hash,
  role,
  status,
  headline,
  avatar,
  approved_at,
  approved_by,
  created_at
) VALUES (
  'usr_superadmin_kjmicheline',
  'KWIZERA Josee Micheline',
  'kjmicheline@gmail.com',
  '+250795041000',
  'KJMotivational2026',
  'super_admin',
  'active',
  'Executive Director & Super Administrator',
  'https://api.dicebear.com/7.x/initials/svg?seed=KWIZERA%20Josee%20Micheline&backgroundColor=0284c7',
  now(),
  'System Owner',
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  status = 'active',
  headline = EXCLUDED.headline,
  approved_at = now(),
  approved_by = 'System Owner';
