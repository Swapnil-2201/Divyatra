-- ================================================================
-- DivYatra: 002_rls_policies.sql
-- Row Level Security policies for all tables.
-- Run AFTER 001_initial_schema.sql
-- ================================================================

-- ----------------------------------------------------------------
-- Enable RLS on all tables
-- ----------------------------------------------------------------
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temples           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_status      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.darshan_schedule  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Helper function: get current user role from profiles
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's assigned temple_id
CREATE OR REPLACE FUNCTION public.get_my_temple_id()
RETURNS UUID AS $$
  SELECT temple_id
  FROM public.temple_authorities
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ================================================================
-- PROFILES TABLE
-- ================================================================

-- Anyone can read their own profile
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Trust admins can read all profiles
CREATE POLICY "profiles: trust_admin read all"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'trust_admin');

-- Users can update their own non-role fields
CREATE POLICY "profiles: own update (no role change)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent users from escalating their own role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ================================================================
-- TEMPLES TABLE
-- ================================================================

-- Public: anyone (including anon) can read temples
CREATE POLICY "temples: public read"
  ON public.temples FOR SELECT
  USING (true);

-- Only trust_admin can insert/update/delete temples
CREATE POLICY "temples: trust_admin write"
  ON public.temples FOR ALL
  USING (public.get_my_role() = 'trust_admin')
  WITH CHECK (public.get_my_role() = 'trust_admin');

-- ================================================================
-- TEMPLE_AUTHORITIES TABLE
-- ================================================================

-- Authorities can see their own assignment
CREATE POLICY "temple_authorities: own read"
  ON public.temple_authorities FOR SELECT
  USING (user_id = auth.uid());

-- Trust admin can see and manage all assignments
CREATE POLICY "temple_authorities: trust_admin full"
  ON public.temple_authorities FOR ALL
  USING (public.get_my_role() = 'trust_admin')
  WITH CHECK (public.get_my_role() = 'trust_admin');

-- ================================================================
-- QUEUE_STATUS TABLE
-- ================================================================

-- Public: anyone can read queue status
CREATE POLICY "queue_status: public read"
  ON public.queue_status FOR SELECT
  USING (true);

-- Temple authority can update ONLY their assigned temple's queue
CREATE POLICY "queue_status: authority update own temple"
  ON public.queue_status FOR UPDATE
  USING (
    public.get_my_role() = 'temple_authority'
    AND temple_id = public.get_my_temple_id()
  )
  WITH CHECK (
    public.get_my_role() = 'temple_authority'
    AND temple_id = public.get_my_temple_id()
  );

-- Trust admin can update any temple's queue
CREATE POLICY "queue_status: trust_admin write"
  ON public.queue_status FOR ALL
  USING (public.get_my_role() = 'trust_admin')
  WITH CHECK (public.get_my_role() = 'trust_admin');

-- ================================================================
-- DARSHAN_SCHEDULE TABLE
-- ================================================================

-- Public: anyone can read darshan schedules
CREATE POLICY "darshan_schedule: public read"
  ON public.darshan_schedule FOR SELECT
  USING (true);

-- Temple authority can insert/update ONLY their assigned temple's schedule
CREATE POLICY "darshan_schedule: authority manage own temple"
  ON public.darshan_schedule FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'temple_authority'
    AND temple_id = public.get_my_temple_id()
  );

CREATE POLICY "darshan_schedule: authority update own temple"
  ON public.darshan_schedule FOR UPDATE
  USING (
    public.get_my_role() = 'temple_authority'
    AND temple_id = public.get_my_temple_id()
  )
  WITH CHECK (
    public.get_my_role() = 'temple_authority'
    AND temple_id = public.get_my_temple_id()
  );

-- Trust admin manages all schedules
CREATE POLICY "darshan_schedule: trust_admin full"
  ON public.darshan_schedule FOR ALL
  USING (public.get_my_role() = 'trust_admin')
  WITH CHECK (public.get_my_role() = 'trust_admin');

-- ================================================================
-- AUDIT_LOGS TABLE
-- Append-only: no UPDATE or DELETE for anyone.
-- INSERT is done server-side using service_role key only.
-- ================================================================

-- Trust admin can read audit logs
CREATE POLICY "audit_logs: trust_admin read"
  ON public.audit_logs FOR SELECT
  USING (public.get_my_role() = 'trust_admin');

-- No direct INSERT from client (must go through server with service_role key)
-- No UPDATE allowed for anyone
-- No DELETE allowed for anyone
-- (The absence of INSERT/UPDATE/DELETE policies enforces this for anon + authenticated)
