import { signInRequest, signOutRequest } from './session';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in — the API sets the refresh-token cookie; the access token stays in memory.
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  await signInRequest(email, password);
};

/** **************************************
 * Sign up — the portfolio has a single admin account, created by the API on first start.
 *************************************** */
export const signUp = async (_params: SignUpParams): Promise<void> => {
  throw new Error('Sign-up is disabled. Use the admin account from BACKEND/.env.');
};

/** **************************************
 * Sign out — revokes the session on the server and clears the cookie.
 *************************************** */
export const signOut = async (): Promise<void> => {
  await signOutRequest();
};
