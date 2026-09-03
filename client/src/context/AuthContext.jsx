import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// Role alias maps — lets existing code that checks 'pilgrim'/'authority'/'admin'
// keep working while we use the new Supabase roles internally.
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_LEGACY_MAP = {
  devotee:          'pilgrim',
  temple_authority: 'authority',
  trust_admin:      'admin',
};

/** Normalise a Supabase role to a legacy role name so existing UI code doesn't break */
const toLegacyRole = (role) => ROLE_LEGACY_MAP[role] ?? role;

/** Build a unified user object from Supabase session + profile row */
const buildUserObject = (authUser, profile) => ({
  id:             authUser.id,
  email:          authUser.email,
  name:           profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
  role:           toLegacyRole(profile?.role ?? 'devotee'),
  supabaseRole:   profile?.role ?? 'devotee',      // raw new-style role
  assignedTemple: profile?.assigned_temple ?? null, // populated separately if needed
  avatar:         profile?.avatar_url ?? null,
  phone:          profile?.phone ?? null,
});

// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // starts true while we check session

  // ── Fetch profile from Supabase ──────────────────────────────────────────
  const fetchProfile = useCallback(async (authUser) => {
    if (!supabase || !authUser) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (error) {
      console.warn('[Auth] Profile fetch error:', error.message);
      return null;
    }
    return data;
  }, []);

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // ── MOCK FALLBACK MODE ───────────────────────────────────────────────
      // Restore from localStorage just like the original AuthContext did
      const savedUser  = localStorage.getItem('divyatra_user');
      const savedToken = localStorage.getItem('divyatra_jwt_token');
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
      }
      if (savedToken) setToken(savedToken);
      setLoading(false);
      return;
    }

    // ── SUPABASE MODE ────────────────────────────────────────────────────
    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        const userObj = buildUserObject(session.user, profile);
        setUser(userObj);
        setToken(session.access_token);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes (token refresh, sign-out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          const userObj = buildUserObject(session.user, profile);
          setUser(userObj);
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Persist user to localStorage for offline fallback ───────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('divyatra_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('divyatra_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('divyatra_jwt_token', token);
    } else {
      localStorage.removeItem('divyatra_jwt_token');
    }
  }, [token]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // ── Supabase Auth ──────────────────────────────────────────────────
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          const profile = await fetchProfile(data.user);
          const userObj = buildUserObject(data.user, profile);
          setUser(userObj);
          setToken(data.session.access_token);
          return { success: true, user: userObj };
        } catch (supaErr) {
          console.warn('[Auth] Supabase auth unavailable, falling back to local auth:', supaErr.message);
        }
      }

      // ── Local / API Gateway Fallback ──────────────────────────────────
      const res = await api.login(email, password);
      if (res?.token && res?.user) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (userData) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // ── Supabase Auth signup ───────────────────────────────────────────
        try {
          const { data, error } = await supabase.auth.signUp({
            email:    userData.email,
            password: userData.password,
            options: {
              data: {
                full_name: userData.name,
                role:      'devotee',
              },
            },
          });
          if (error) throw error;

          const profile = await fetchProfile(data.user);
          const userObj = buildUserObject(data.user, profile);
          setUser(userObj);
          setToken(data.session?.access_token ?? null);
          return { success: true, user: userObj };
        } catch (supaErr) {
          console.warn('[Auth] Supabase signup unavailable, falling back to local auth:', supaErr.message);
        }
      }

      // ── Local / API Gateway Fallback ──────────────────────────────────
      const res = await api.register(userData);
      if (res?.token && res?.user) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('divyatra_user');
    localStorage.removeItem('divyatra_jwt_token');
  };

  // ── Quick demo logins (dev only) ─────────────────────────────────────────
  const loginAsPilgrim    = () => login('pilgrim@divyatra.in',   'Pilgrim@123');
  const loginAsAuthority  = () => login('authority@divyatra.in', 'Authority@123');
  const loginAsAdmin      = () => login('admin@divyatra.in',     'Admin@123');

  // ── Derived role booleans (keep same names as original) ─────────────────
  const isAuthenticated = !!user;
  const role            = user?.role ?? null;
  const isPilgrim       = role === 'pilgrim'    || user?.supabaseRole === 'devotee';
  const isAuthority     = role === 'authority'  || user?.supabaseRole === 'temple_authority';
  const isAdmin         = role === 'admin'      || user?.supabaseRole === 'trust_admin';
  const isStaff         = isAuthority || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isPilgrim,
        isAuthority,
        isAdmin,
        isStaff,
        loading,
        login,
        register,
        logout,
        loginAsPilgrim,
        loginAsAuthority,
        loginAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
