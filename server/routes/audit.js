/**
 * @file audit.js
 * @description Audit log route for DivYatra authority actions.
 * Uses SUPABASE_SERVICE_ROLE_KEY (server-only, never exposed to frontend).
 * Verifies the Supabase JWT from Authorization header before writing.
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

/**
 * Lazy-initialised Supabase admin client.
 * Only created if both env vars are set (server-side service role key).
 * Never imported or used in frontend code.
 */
let supabaseAdmin = null;
const getSupabaseAdmin = () => {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.warn('[Audit] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Audit logging disabled.');
    return null;
  }
  supabaseAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return supabaseAdmin;
};

/**
 * Verify a Supabase JWT and return the user payload.
 * This prevents unauthenticated writes to audit_logs.
 */
const verifySupabaseToken = async (token) => {
  const admin = getSupabaseAdmin();
  if (!admin || !token) return null;
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
};

// POST /api/audit
router.post('/', async (req, res) => {
  const admin = getSupabaseAdmin();

  // Graceful no-op if Supabase is not configured
  if (!admin) {
    return res.json({ success: true, message: 'Audit logging not configured (no Supabase key)' });
  }

  // Extract JWT from Authorization header
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const authUser = await verifySupabaseToken(token);

  if (!authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }

  const {
    temple_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
  } = req.body;

  // Validate required fields
  if (!action || !entity_type) {
    return res.status(400).json({ success: false, message: 'action and entity_type are required' });
  }

  const { data, error } = await admin
    .from('audit_logs')
    .insert({
      user_id:     authUser.id,
      temple_id:   temple_id ?? null,
      action,
      entity_type,
      entity_id:   entity_id ?? null,
      old_value:   old_value ?? null,
      new_value:   new_value ?? null,
      created_at:  new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[Audit] Insert error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({ success: true, data });
});

export default router;
