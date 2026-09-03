-- ================================================================
-- DivYatra: 003_seed_data.sql
-- Initial temple records and queue/darshan seed rows.
-- Run AFTER 001_initial_schema.sql and 002_rls_policies.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Temples (Gujarat Char Dham Circuit)
-- ----------------------------------------------------------------
INSERT INTO public.temples (id, slug, name, location, description, status)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-a1b2c3d40001',
    'somnath',
    'Shree Somnath Jyotirlinga',
    'Prabhas Patan, Gir Somnath, Gujarat',
    'The eternal first among twelve Jyotirlinga shrines, Somnath stands at the confluence of the Hiran, Kapila and Saraswati rivers on the Arabian Sea coast.',
    'active'
  ),
  (
    'a1b2c3d4-0002-0002-0002-a1b2c3d40002',
    'dwarka',
    'Shree Dwarkadhish Jagat Mandir',
    'Dwarka, Gujarat',
    'Sacred abode of Lord Krishna, one of the four Char Dhams of India and a Sapta Puri pilgrimage city.',
    'active'
  ),
  (
    'a1b2c3d4-0003-0003-0003-a1b2c3d40003',
    'ambaji',
    'Shree Arasuri Ambaji Mata Mandir',
    'Ambaji, Banaskantha, Gujarat',
    'Shakti Peeth of Goddess Amba, enshrined on Arasur Hill with the Gabbar hilltop complex.',
    'active'
  ),
  (
    'a1b2c3d4-0004-0004-0004-a1b2c3d40004',
    'pavagadh',
    'Shree Mahakali Mandir, Pavagadh',
    'Pavagadh, Panchmahal, Gujarat',
    'Shakti Peeth atop Pavagadh hill (762m), accessible by ropeway, dedicated to Maha Kali Mata.',
    'active'
  )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------
-- 2. Queue Status (initial rows per gate per temple)
-- ----------------------------------------------------------------
INSERT INTO public.queue_status (temple_id, gate, current_count, estimated_wait_minutes, status)
VALUES
  -- Somnath
  ('a1b2c3d4-0001-0001-0001-a1b2c3d40001', 'Gate 1 — Main Entrance',   120, 18, 'Moderate'),
  ('a1b2c3d4-0001-0001-0001-a1b2c3d40001', 'Gate 2 — Nandidwar Entry',  60,  8,  'Low'),
  ('a1b2c3d4-0001-0001-0001-a1b2c3d40001', 'Gate 3 — VIP Darshan',      35,  5,  'Low'),
  -- Dwarka
  ('a1b2c3d4-0002-0002-0002-a1b2c3d40002', 'Moksha Dwaar — Main Gate',  210, 32, 'High'),
  ('a1b2c3d4-0002-0002-0002-a1b2c3d40002', 'Swarg Dwaar — North Entry',  80, 12, 'Moderate'),
  -- Ambaji
  ('a1b2c3d4-0003-0003-0003-a1b2c3d40003', 'Chachar Chowk Entrance',    95,  14, 'Moderate'),
  ('a1b2c3d4-0003-0003-0003-a1b2c3d40003', 'Gabbar Ropeway Base',       145, 22, 'High'),
  -- Pavagadh
  ('a1b2c3d4-0004-0004-0004-a1b2c3d40004', 'Machi Station — Ropeway',   180, 27, 'High'),
  ('a1b2c3d4-0004-0004-0004-a1b2c3d40004', 'Summit Temple Gate',         70, 10, 'Moderate')
ON CONFLICT (temple_id, gate) DO NOTHING;

-- ----------------------------------------------------------------
-- 3. Sample Darshan Schedule (today + tomorrow)
-- ----------------------------------------------------------------
INSERT INTO public.darshan_schedule (temple_id, date, start_time, end_time, title, status)
VALUES
  ('a1b2c3d4-0001-0001-0001-a1b2c3d40001', CURRENT_DATE, '05:00', '07:00', 'Mangala Aarti Darshan',  'Upcoming'),
  ('a1b2c3d4-0001-0001-0001-a1b2c3d40001', CURRENT_DATE, '07:30', '12:00', 'Morning Darshan',        'Upcoming'),
  ('a1b2c3d4-0001-0001-0001-a1b2c3d40001', CURRENT_DATE, '20:00', '21:00', 'Sandhya Aarti (Light Show)', 'Upcoming'),
  ('a1b2c3d4-0002-0002-0002-a1b2c3d40002', CURRENT_DATE, '06:00', '13:00', 'Morning Darshan',        'Upcoming'),
  ('a1b2c3d4-0002-0002-0002-a1b2c3d40002', CURRENT_DATE, '16:30', '20:30', 'Evening Darshan',        'Upcoming'),
  ('a1b2c3d4-0003-0003-0003-a1b2c3d40003', CURRENT_DATE, '06:00', '21:00', 'All Day Darshan',        'Upcoming'),
  ('a1b2c3d4-0004-0004-0004-a1b2c3d40004', CURRENT_DATE, '07:00', '18:00', 'Darshan (Ropeway Hours)', 'Upcoming')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 4. NOTE: Authority accounts must be created via Supabase Auth
-- dashboard or the Auth API. See AUTHORITY_SETUP.md for steps.
-- ----------------------------------------------------------------
