import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';
import {
  getAccessToken,
  onSessionEnded,
  refreshSession,
  onSessionStartedElsewhere,
} from './session';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/**
 * Restores the session on load from the httpOnly refresh cookie, so closing and reopening
 * the browser keeps you signed in for as long as the session is valid (7 days, sliding).
 * Signs out — and the AuthGuard redirects to sign-in — only when the session really ends.
 */
export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      if (getAccessToken()) {
        const res = await axios.get(endpoints.auth.me);
        setState({ user: res.data.user, loading: false });
        return;
      }
      const session = await refreshSession();
      setState({ user: session?.user ?? null, loading: false });
    } catch (error) {
      // API unreachable: show sign-in, but keep the cookie so the session survives the outage
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session ended (expired, revoked, or signed out here or in another tab)
  useEffect(() => onSessionEnded(() => setState({ user: null, loading: false })), [setState]);

  // Signed in from another tab — pick up the session from the shared cookie
  useEffect(
    () =>
      onSessionStartedElsewhere(() => {
        if (!getAccessToken()) checkUserSession();
      }),
    [checkUserSession]
  );

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
