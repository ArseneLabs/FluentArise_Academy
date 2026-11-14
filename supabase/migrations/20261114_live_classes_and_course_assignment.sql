-- ==============================================================================
-- FluentaRise Academy - Live Classes, Course Assignment & Submissions Migration
-- Description: Adds course_id, meeting_url, description, instructor_id, and status
--              to calendar_events; adds student_id, student_email, improvement_tips
--              to submissions; ensures platform_settings table is prepared.
-- ==============================================================================

-- 1. Extend calendar_events table
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS course_id text,
  ADD COLUMN IF NOT EXISTS course_title text,
  ADD COLUMN IF NOT EXISTS meeting_url text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instructor_id text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming';

-- 2. Extend submissions table
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS student_id text,
  ADD COLUMN IF NOT EXISTS student_email text,
  ADD COLUMN IF NOT EXISTS improvement_tips text;

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_calendar_events_course_id ON public.calendar_events(course_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_instructor_id ON public.calendar_events(instructor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_email ON public.submissions(student_email);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);

-- 4. Ensure platform_settings table has default row
INSERT INTO public.platform_settings (id, settings, updated_at)
VALUES (
  'global',
  '{"currency": "Rwandan Franc (Rwf)", "language": "English", "emailNotifications": true, "submissionAlerts": true, "enrollmentAlerts": true, "paymentMethods": {"momo": true, "airtel": true, "card": true, "bank": true}}'::jsonb,
  now()
)
ON CONFLICT (id) DO NOTHING;
