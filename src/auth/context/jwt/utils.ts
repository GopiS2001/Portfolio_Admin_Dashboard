// ----------------------------------------------------------------------

/** Reads a JWT's payload (no verification — the API does that). */
export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);
    if (!decoded || !('exp' in decoded)) {
      return false;
    }
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}
