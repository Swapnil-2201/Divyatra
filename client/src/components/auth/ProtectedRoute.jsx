import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Guards a route based on authentication and role.
 * Accepts both legacy role names (pilgrim/authority/admin) and
 * the new Supabase-style names (devotee/temple_authority/trust_admin).
 */

// Role alias table — both old and new names are valid
const ROLE_ALIASES = {
  devotee:          ['devotee', 'pilgrim'],
  pilgrim:          ['devotee', 'pilgrim'],
  temple_authority: ['temple_authority', 'authority'],
  authority:        ['temple_authority', 'authority'],
  trust_admin:      ['trust_admin', 'admin'],
  admin:            ['trust_admin', 'admin'],
};

const roleMatches = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles?.length) return false;
  return allowedRoles.some((allowed) => {
    const aliases = ROLE_ALIASES[allowed] ?? [allowed];
    return aliases.includes(userRole) || aliases.includes(ROLE_ALIASES[userRole]?.[0]);
  });
};

export const ProtectedRoute = ({ children, allowedRoles = ['pilgrim', 'devotee', 'authority', 'temple_authority', 'admin', 'trust_admin'] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070D19]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#D5A63A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#D5A63A] font-mono">Verifying Clearances...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/DivyatraAdministration" replace />;
    }
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Role check — using alias-aware matching
  if (!roleMatches(user.role, allowedRoles) && !roleMatches(user.supabaseRole, allowedRoles)) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/DivyatraAdministration" replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070D19]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-[#D5A63A] font-serif text-xl font-bold">Access Denied</p>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            Your account does not have the required clearance level to access this section.
          </p>
        </div>
      </div>
    );
  }

  return children;
};
