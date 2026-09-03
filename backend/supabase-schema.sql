CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  year INTEGER NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  telegram_username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks / Deadlines
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  reminder_time TIMESTAMPTZ,
  add_to_calendar BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('pending','completed','cancelled')) DEFAULT 'pending',
  n8n_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  notice_text TEXT NOT NULL,
  ai_summary TEXT,
  event_date DATE,
  event_title TEXT,
  broadcast_status TEXT CHECK (broadcast_status IN ('pending','sent','failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  total_classes INTEGER NOT NULL DEFAULT 0,
  attended_classes INTEGER NOT NULL DEFAULT 0,
  threshold NUMERIC DEFAULT 75.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation Logs
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  workflow_type TEXT CHECK (workflow_type IN ('deadline_reminder','notice_broadcast','attendance_alert')) NOT NULL,
  status TEXT CHECK (status IN ('triggered','success','failed')) DEFAULT 'triggered',
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE public.preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  settings JSONB DEFAULT '{}',
  dashboard_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_student_id ON public.tasks(student_id);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX idx_notices_student_id ON public.notices(student_id);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_automation_logs_student_id ON public.automation_logs(student_id);

-- Whiteboards
CREATE TABLE public.whiteboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Whiteboard',
  data JSONB NOT NULL DEFAULT '{}',
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_whiteboards_student_id ON public.whiteboards(student_id);

-- Telegram Groups
CREATE TABLE public.telegram_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_chat_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  invite_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_telegram_groups_chat_id ON public.telegram_groups(telegram_chat_id);

-- Group Members (links students to Telegram groups)
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.telegram_groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_student_id ON public.group_members(student_id);
