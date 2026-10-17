import { signInAnonymously, type User } from 'firebase/auth';
import { auth } from './firebase';

const runtime = globalThis as typeof globalThis & {
  __studyFlowAuthenticationPromise?: Promise<User>;
};

export function ensureAuthenticatedUser(): Promise<User> {
  const pendingAuthentication = runtime.__studyFlowAuthenticationPromise;

  if (pendingAuthentication) {
    return pendingAuthentication;
  }

  const authenticationPromise = (async () => {
    await auth.authStateReady();

    if (auth.currentUser) {
      return auth.currentUser;
    }

    const credential = await signInAnonymously(auth);
    return credential.user;
  })();

  runtime.__studyFlowAuthenticationPromise = authenticationPromise;
  const clearPendingAuthentication = () => {
    if (runtime.__studyFlowAuthenticationPromise === authenticationPromise) {
      delete runtime.__studyFlowAuthenticationPromise;
    }
  };
  void authenticationPromise.then(clearPendingAuthentication, clearPendingAuthentication);

  return authenticationPromise;
}
