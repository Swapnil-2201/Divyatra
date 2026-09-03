-- ================================================================
-- DivYatra: 001_initial_schema.sql
-- Creates all tables for Supabase PostgreSQL backend
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ================================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- profiles
-- Linked to auth.users. Stores role and public profile info.
-- Passwords are NEVER stored here — Supabase Auth handles them.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'devotee'
                  CHECK (role IN ('devotee', 'temple_authority', 'trust_admin')),
  phone         TEXT DEFAULT NULL,
  avatar_url    TEXT DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on new auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'devotee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- temples
-- Master table of temples in the Gujarat Char Dham circuit.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.temples (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  location      TEXT NOT NULL,
  description   TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'maintenance', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER temples_updated_at
  BEFORE UPDATE ON public.temples
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------
-- temple_authorities
-- Determines which temple an authority user controls.
-- The backend ALWAYS looks this up — never trusts the frontend.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.temple_authorities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temple_id     UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, temple_id)
);

CREATE TRIGGER temple_authorities_updated_at
  BEFORE UPDATE ON public.temple_authorities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------
-- queue_status
-- Real-time queue/crowd status per temple gate.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queue_status (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temple_id               UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  gate                    TEXT NOT NULL,
  current_count           INT NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  estimated_wait_minutes  INT NOT NULL DEFAULT 0 CHECK (estimated_wait_minutes >= 0),
  status                  TEXT NOT NULL DEFAULT 'Low'
                            CHECK (status IN ('Low', 'Moderate', 'High', 'Closed')),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(temple_id, gate)
);

-- ----------------------------------------------------------------
-- darshan_schedule
-- Scheduled and live darshan events per temple.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.darshan_schedule (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temple_id         UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  title             TEXT NOT NULL DEFAULT 'Darshan',
  status            TEXT NOT NULL DEFAULT 'Upcoming'
                      CHECK (status IN ('Upcoming', 'Live', 'Completed', 'Cancelled')),
  live_video_id     TEXT DEFAULT NULL,
  live_channel_url  TEXT DEFAULT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TRIGGER darshan_schedule_updated_at
  BEFORE UPDATE ON public.darshan_schedule
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------
-- audit_logs
-- Append-only. Records every authority action.
-- No user can DELETE or UPDATE rows here (enforced by RLS).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  temple_id     UUID REFERENCES public.temples(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID DEFAULT NULL,
  old_value     JSONB DEFAULT NULL,
  new_value     JSONB DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
