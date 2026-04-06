-- =============================================
-- BNRI Infrastructure Request & Approval System
-- Supabase Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('requester', 'approver_finance', 'approver_it', 'approver_legal', 'approver_hr', 'final_approver', 'admin')),
  dept TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  must_change_pwd BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Finance', 'IT', 'Procurement', 'Legal', 'HR')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL CHECK (status IN ('Pending Review', 'Under Review', 'Needs Clarification', 'Approved L1', 'Pending Final', 'Approved', 'Rejected')),
  submitter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  submitter_name TEXT NOT NULL,
  dept TEXT NOT NULL,
  assigned_approver_id UUID REFERENCES public.users(id),
  final_approver_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval history
CREATE TABLE public.approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('L1', 'Final')),
  action TEXT NOT NULL CHECK (action IN ('Approved', 'Rejected', 'Clarification')),
  action_by UUID REFERENCES public.users(id),
  action_by_name TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request comments
CREATE TABLE public.request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request attachments
CREATE TABLE public.request_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  uploaded_by_name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.users(id),
  performed_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification logs
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('email', 'whatsapp', 'system')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_requests_submitter ON public.requests(submitter_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_type ON public.requests(type);
CREATE INDEX idx_requests_created ON public.requests(created_at DESC);
CREATE INDEX idx_approval_history_request ON public.approval_history(request_id);
CREATE INDEX idx_comments_request ON public.request_comments(request_id);
CREATE INDEX idx_attachments_request ON public.request_attachments(request_id);
CREATE INDEX idx_audit_logs_request ON public.audit_logs(request_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Requests table policies
CREATE POLICY "Users can view requests based on role" ON public.requests
  FOR SELECT USING (
    -- Admins see everything
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Final approvers see everything
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'final_approver'
    )
    OR
    -- Requesters see their own
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND id = submitter_id
    )
    OR
    -- Finance approvers see Finance requests
    (type = 'Finance' AND EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'approver_finance'
    ))
    OR
    -- IT approvers see IT requests
    (type = 'IT' AND EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'approver_it'
    ))
    OR
    -- Legal approvers see Legal requests
    (type = 'Legal' AND EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'approver_legal'
    ))
    OR
    -- HR approvers see HR requests
    (type = 'HR' AND EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'approver_hr'
    ))
  );

CREATE POLICY "Authenticated users can create requests" ON public.requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update requests based on role" ON public.requests
  FOR UPDATE USING (
    -- Admins can update everything
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Approvers can update assigned requests
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid()
      AND (id = assigned_approver_id OR id = final_approver_id)
    )
  );

-- Approval history policies
CREATE POLICY "Users can view approval history for accessible requests" ON public.approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = request_id
      AND (
        -- Same visibility rules as requests
        EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'final_approver'))
        OR submitter_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR (type = 'Finance' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_finance'))
        OR (type = 'IT' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_it'))
        OR (type = 'Legal' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_legal'))
        OR (type = 'HR' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_hr'))
      )
    )
  );

CREATE POLICY "Authenticated users can insert approval history" ON public.approval_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Comments policies (similar to approval history)
CREATE POLICY "Users can view comments for accessible requests" ON public.request_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = request_id
      AND (
        EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'final_approver'))
        OR submitter_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR (type = 'Finance' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_finance'))
        OR (type = 'IT' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_it'))
        OR (type = 'Legal' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_legal'))
        OR (type = 'HR' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_hr'))
      )
    )
  );

CREATE POLICY "Authenticated users can insert comments" ON public.request_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Attachments policies (similar pattern)
CREATE POLICY "Users can view attachments for accessible requests" ON public.request_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = request_id
      AND (
        EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'final_approver'))
        OR submitter_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR (type = 'Finance' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_finance'))
        OR (type = 'IT' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_it'))
        OR (type = 'Legal' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_legal'))
        OR (type = 'HR' AND EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = auth.uid() AND role = 'approver_hr'))
      )
    )
  );

CREATE POLICY "Authenticated users can upload attachments" ON public.request_attachments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view audit logs for their requests" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = request_id
      AND submitter_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notification logs policies
CREATE POLICY "Admins can view all notifications" ON public.notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert notifications" ON public.notification_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate request reference number
CREATE OR REPLACE FUNCTION generate_ref_no()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(ref_no FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.requests
  WHERE ref_no LIKE 'REQ-2026-%';

  -- Generate the reference number
  NEW.ref_no = 'REQ-2026-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ref_no
CREATE TRIGGER set_request_ref_no BEFORE INSERT ON public.requests
  FOR EACH ROW
  WHEN (NEW.ref_no IS NULL OR NEW.ref_no = '')
  EXECUTE FUNCTION generate_ref_no();

-- Function to auto-assign approver based on request type
CREATE OR REPLACE FUNCTION assign_approver()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign L1 approver based on type
  IF NEW.type = 'Finance' THEN
    SELECT id INTO NEW.assigned_approver_id FROM public.users
    WHERE role = 'approver_finance' AND active = true LIMIT 1;
  ELSIF NEW.type = 'IT' THEN
    SELECT id INTO NEW.assigned_approver_id FROM public.users
    WHERE role = 'approver_it' AND active = true LIMIT 1;
  ELSIF NEW.type = 'Legal' THEN
    SELECT id INTO NEW.assigned_approver_id FROM public.users
    WHERE role = 'approver_legal' AND active = true LIMIT 1;
  ELSIF NEW.type = 'HR' THEN
    SELECT id INTO NEW.assigned_approver_id FROM public.users
    WHERE role = 'approver_hr' AND active = true LIMIT 1;
  END IF;

  -- Assign final approver
  SELECT id INTO NEW.final_approver_id FROM public.users
  WHERE role = 'final_approver' AND active = true LIMIT 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign approver
CREATE TRIGGER set_request_approver BEFORE INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION assign_approver();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert demo users (passwords will be set via Supabase Auth)
-- Note: You'll need to create these users in Supabase Auth first, then link them here
INSERT INTO public.users (name, username, email, phone, role, dept, active, must_change_pwd) VALUES
  ('Admin User', 'admin', 'admin@bnriinfra.com', '9150459992', 'admin', 'Management', true, false),
  ('Bob Finance', 'bob', 'bob.finance@bnriinfra.com', '9876543210', 'approver_finance', 'Finance', true, false),
  ('Ravi Kumar', 'ravi', 'ravi.kumar@bnriinfra.com', '9876543211', 'approver_it', 'IT', true, false),
  ('Carol Legal', 'carol', 'carol.legal@bnriinfra.com', '9876543212', 'approver_legal', 'Legal', true, false),
  ('Priya Sharma', 'priya', 'priya.sharma@bnriinfra.com', '9876543213', 'approver_hr', 'HR', true, false),
  ('David Director', 'david', 'david.director@bnriinfra.com', '9876543214', 'final_approver', 'Management', true, false),
  ('Alice Requester', 'alice', 'alice.requester@bnriinfra.com', '9123456789', 'requester', 'Operations', true, false);

-- Insert sample requests
INSERT INTO public.requests (title, description, type, priority, status, submitter_id, submitter_name, dept)
SELECT
  'Budget Approval for Q2 Marketing Campaign',
  'Request for approval of ₹5,00,000 budget for Q2 digital marketing initiatives including social media ads and influencer partnerships.',
  'Finance',
  'High',
  'Pending Review',
  id,
  'Alice Requester',
  'Operations'
FROM public.users WHERE username = 'alice' LIMIT 1;

INSERT INTO public.requests (title, description, type, priority, status, submitter_id, submitter_name, dept)
SELECT
  'New Laptop for Development Team',
  'Request for 3 MacBook Pro laptops for the new developers joining next month. Estimated cost: ₹4,50,000.',
  'IT',
  'Medium',
  'Pending Review',
  id,
  'Alice Requester',
  'Operations'
FROM public.users WHERE username = 'alice' LIMIT 1;

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-attachments', 'request-attachments', false);

-- Storage policies for attachments
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'request-attachments'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view attachments for accessible requests" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'request-attachments'
    AND auth.uid() IS NOT NULL
  );

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'BNRI Infrastructure Request & Approval System database setup complete!' AS message;
