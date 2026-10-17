import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-expect-error The RN entry point exports this API, but the SDK's generic typings do not.
import { getReactNativePersistence } from '@firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBnBD-f79xXZ5nxE4YT0VFdV2IfmhmwPns',
  authDomain: 'studyflow-f1681.firebaseapp.com',
  projectId: 'studyflow-f1681',
  storageBucket: 'studyflow-f1681.firebasestorage.app',
  messagingSenderId: '337737530617',
  appId: '1:337737530617:web:32bd7cd1842abd4b7cb628',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function initializeAuthWithPersistence() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/already-initialized'
    ) {
      return getAuth(app);
    }

    throw error;
  }
}

export const auth = initializeAuthWithPersistence();
export const db = getFirestore(app);
