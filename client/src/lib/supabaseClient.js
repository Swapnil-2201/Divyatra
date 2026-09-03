/**
 * @file supabaseClient.js
 * @description Robust singleton Supabase JS client for DivYatra.
 * Safely sanitizes URLs and falls back gracefully so uncaught errors never crash the app.
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Sanitize URL: remove quotes, ensure https protocol, strip /rest/v1 suffix
const sanitizeUrl = (url) => {
  if (!url || url.includes('gimolabmffytehwezcbh')) return '';
  let clean = url.replace(/['"]/g, '').trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean.replace(/\/(rest\/v1\/?)?$/, '');
};

const supabaseUrl = sanitizeUrl(rawUrl);
const supabaseAnonKey = rawKey.replace(/['"]/g, '').trim();

let clientInstance = null;
let configured = false;

if (supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'divyatra_supabase_session',
      },
    });
    configured = true;
  } catch (err) {
    console.warn('[Supabase] Initialization notice:', err.message);
    clientInstance = null;
    configured = false;
  }
}

export const supabase = clientInstance;
export const isSupabaseConfigured = configured;

