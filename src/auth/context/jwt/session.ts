import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// Session handling for the dashboard.
//
//  - Access token (15 min): kept in memory only — never in localStorage/sessionStorage,
//    so an injected script can't read a stored copy.
//  - Refresh token (7 days): an httpOnly cookie set by the API (pf_rt_dashboard). JavaScript
//    can't read it; the browser sends it to /api/auth/* only.
//  - On load, and whenever the access token is about to expire or a request gets a 401,
//    we call /api/auth/refresh. Only a 401 from refresh ends the session (expired, revoked
//    or signed out) — network errors keep the session so a server restart doesn't log you out.
//  - Tabs stay in sync through a BroadcastChannel (sign in / sign out everywhere).

export const CLIENT_HEADERS = { 'X-Client-App': 'dashboard' } as const;

export type SessionUser = { id: number; email: string; displayName: string; role: string };
export type SessionEndReason = 'signed-out' | 'expired' | 'revoked';

type TokenResponse = { accessToken: string; accessTokenExpiresAt: number; user: SessionUser };

/** Refresh this long before the access token actually expires. */
const REFRESH_MARGIN_MS = 60_000;
const REASON_KEY = 'pf-auth-end-reason';

let accessToken: string | null = null;
let expiresAt = 0;
let inflight: Promise<TokenResponse | null> | null = null;

const endListeners = new Set<(reason: SessionEndReason) => void>();
const startListeners = new Set<() => void>();

const channel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pf-dashboard-auth') : null;

channel?.addEventListener('message', (event: MessageEvent<{ type: string; reason?: SessionEndReason }>) => {
  if (event.data?.type === 'ended') endSession(event.data.reason ?? 'signed-out', false);
  if (event.data?.type === 'started') startListeners.forEach((l) => l());
});

/** Plain axios (no interceptors) so auth calls can't loop through the refresh logic. */
const authHttp = axios.create({ withCredentials: true, headers: CLIENT_HEADERS });

const authUrl = (path: string) => `${CONFIG.serverUrl}/api/auth/${path}`;

// ---------------------------------------------------------------------- token state

export const getAccessToken = () => accessToken;

function setTokens(res: TokenResponse) {
  accessToken = res.accessToken;
  expiresAt = res.accessTokenExpiresAt;
}

const isStatus = (error: unknown, status: number) =>
  axios.isAxiosError(error) && error.response?.status === status;

const errorCode = (error: unknown) =>
  axios.isAxiosError(error) ? (error.response?.data as { code?: string } | undefined)?.code : undefined;

// ---------------------------------------------------------------------- sign in / refresh / sign out

export async function signInRequest(email: string, password: string) {
  const res = await authHttp.post<TokenResponse>(authUrl('sign-in'), { email, password });
  setTokens(res.data);
  clearEndReason();
  channel?.postMessage({ type: 'started' });
  return res.data.user;
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share one request.
 * Resolves to null when there is no valid session (and ends it); throws on network errors.
 */
export function refreshSession(): Promise<TokenResponse | null> {
  if (!inflight) {
    inflight = authHttp
      .post<TokenResponse>(authUrl('refresh'))
      .then((res) => {
        setTokens(res.data);
        return res.data;
      })
      .catch((error) => {
        if (isStatus(error, 401)) {
          // Only announce an end if this tab was signed in (not on a first visit)
          if (accessToken !== null) endSession(errorCode(error) === 'SESSION_REVOKED' ? 'revoked' : 'expired');
          return null;
        }
        throw error;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Returns a usable access token, refreshing first if it's missing or about to expire. */
export async function getFreshAccessToken() {
  if (accessToken && Date.now() < expiresAt - REFRESH_MARGIN_MS) return accessToken;
  const res = await refreshSession();
  return res?.accessToken ?? null;
}

export async function signOutRequest() {
  try {
    await authHttp.post(
      authUrl('sign-out'),
      {},
      { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
    );
  } finally {
    // Even if the API is unreachable, forget the session locally
    endSession('signed-out');
  }
}

// ---------------------------------------------------------------------- session end

/** Clears the in-memory token and tells the app (and other tabs) the session is over. */
export function endSession(reason: SessionEndReason, broadcast = true) {
  const wasActive = accessToken !== null;
  accessToken = null;
  expiresAt = 0;
  if (reason !== 'signed-out') {
    try {
      sessionStorage.setItem(REASON_KEY, reason);
    } catch {}
  }
  if (broadcast && wasActive) channel?.postMessage({ type: 'ended', reason });
  endListeners.forEach((l) => l(reason));
}

export function onSessionEnded(listener: (reason: SessionEndReason) => void) {
  endListeners.add(listener);
  return () => endListeners.delete(listener);
}

/** Another tab signed in — this tab can pick up the new session from the shared cookie. */
export function onSessionStartedElsewhere(listener: () => void) {
  startListeners.add(listener);
  return () => startListeners.delete(listener);
}

/** Why the last session ended (shown once on the sign-in page). */
export function takeEndReason(): SessionEndReason | null {
  try {
    const reason = sessionStorage.getItem(REASON_KEY) as SessionEndReason | null;
    sessionStorage.removeItem(REASON_KEY);
    return reason;
  } catch {
    return null;
  }
}

function clearEndReason() {
  try {
    sessionStorage.removeItem(REASON_KEY);
  } catch {}
}
