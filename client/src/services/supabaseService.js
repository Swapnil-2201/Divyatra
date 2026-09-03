/**
 * @file supabaseService.js
 * @description Data access layer for DivYatra using Supabase PostgreSQL.
 * All public queries work with the anon key (RLS allows public SELECT).
 * Authority write operations are RLS-gated — cross-temple edits are rejected by the DB.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Temples
// ─────────────────────────────────────────────────────────────────────────────

/** Public: fetch all active temples */
export const getTemples = async () => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .eq('status', 'active')
    .order('name');
  if (error) { console.warn('[supabaseService] getTemples error:', error.message); return null; }
  return data;
};

/** Public: fetch a single temple by slug */
export const getTempleBySlug = async (slug) => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) { console.warn('[supabaseService] getTempleBySlug error:', error.message); return null; }
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Status
// ─────────────────────────────────────────────────────────────────────────────

/** Public: fetch all queue rows for a temple */
export const getQueueStatus = async (templeId) => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('queue_status')
    .select('*')
    .eq('temple_id', templeId)
    .order('gate');
  if (error) { console.warn('[supabaseService] getQueueStatus error:', error.message); return null; }
  return data;
};

/** Public: fetch queue for all temples */
export const getAllQueueStatus = async () => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('queue_status')
    .select('*, temples(name, slug)')
    .order('gate');
  if (error) { console.warn('[supabaseService] getAllQueueStatus error:', error.message); return null; }
  return data;
};

/**
 * Authority-only: update a queue row.
 * RLS enforces that the authority can only update their assigned temple.
 * The backend rejects updates for any other temple_id.
 */
export const updateQueueStatus = async (queueRowId, updates) => {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('queue_status')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', queueRowId)
    .select()
    .single();
  if (error) { console.warn('[supabaseService] updateQueueStatus error:', error.message); }
  return { data, error };
};

// ─────────────────────────────────────────────────────────────────────────────
// Darshan Schedule
// ─────────────────────────────────────────────────────────────────────────────

/** Public: fetch today's darshan schedule for a temple */
export const getDarshanSchedule = async (templeId, date = null) => {
  if (!isSupabaseConfigured) return null;
  const targetDate = date ?? new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('darshan_schedule')
    .select('*')
    .eq('temple_id', templeId)
    .eq('date', targetDate)
    .order('start_time');
  if (error) { console.warn('[supabaseService] getDarshanSchedule error:', error.message); return null; }
  return data;
};

/** Public: fetch all upcoming darshan (across temples) */
export const getUpcomingDarshan = async () => {
  if (!isSupabaseConfigured) return null;
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('darshan_schedule')
    .select('*, temples(name, slug)')
    .gte('date', today)
    .neq('status', 'Cancelled')
    .order('date')
    .order('start_time')
    .limit(20);
  if (error) { console.warn('[supabaseService] getUpcomingDarshan error:', error.message); return null; }
  return data;
};

/** Authority: update a darshan schedule row */
export const updateDarshanSchedule = async (scheduleId, updates) => {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('darshan_schedule')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', scheduleId)
    .select()
    .single();
  if (error) { console.warn('[supabaseService] updateDarshanSchedule error:', error.message); }
  return { data, error };
};

/** Authority: create a darshan schedule row */
export const createDarshanSchedule = async (scheduleData) => {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('darshan_schedule')
    .insert(scheduleData)
    .select()
    .single();
  if (error) { console.warn('[supabaseService] createDarshanSchedule error:', error.message); }
  return { data, error };
};

// ─────────────────────────────────────────────────────────────────────────────
// Temple Authority Assignment
// ─────────────────────────────────────────────────────────────────────────────

/** Authority: get the temple assigned to the current user */
export const getMyTempleAssignment = async () => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('temple_authorities')
    .select('*, temples(*)')
    .eq('status', 'active')
    .single();
  if (error) { console.warn('[supabaseService] getMyTempleAssignment error:', error.message); return null; }
  return data;
};

/** Trust Admin: list all temple authority assignments */
export const getAllAuthorityAssignments = async () => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('temple_authorities')
    .select('*, profiles(full_name, email, role), temples(name, slug)')
    .order('created_at', { ascending: false });
  if (error) { console.warn('[supabaseService] getAllAuthorityAssignments error:', error.message); return null; }
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Write an audit log entry.
 * This goes through the Express server (/api/audit) which uses the service_role key.
 * The service_role key is NEVER exposed to the frontend.
 */
export const writeAuditLog = async (entry) => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const token  = localStorage.getItem('divyatra_jwt_token');
  try {
    const res = await fetch(`${apiUrl}/audit`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Audit log failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[supabaseService] writeAuditLog error:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Real-time subscriptions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to live queue_status changes for a temple.
 * @param {string} templeId - UUID of the temple
 * @param {Function} callback - called with the new row on change
 * @returns {Function} unsubscribe function
 */
export const subscribeToQueueUpdates = (templeId, callback) => {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel(`queue-status-${templeId}`)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'queue_status',
        filter: `temple_id=eq.${templeId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

/**
 * Subscribe to darshan_schedule changes for a temple.
 * @param {string} templeId - UUID of the temple
 * @param {Function} callback - called on change with the new row
 * @returns {Function} unsubscribe function
 */
export const subscribeToDarshanUpdates = (templeId, callback) => {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel(`darshan-schedule-${templeId}`)
    .on(
      'postgres_changes',
      {
        event:  '*',
        schema: 'public',
        table:  'darshan_schedule',
        filter: `temple_id=eq.${templeId}`,
      },
      (payload) => callback(payload.new, payload.eventType)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
