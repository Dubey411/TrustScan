import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, Auth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _googleProvider: GoogleAuthProvider | undefined;
let _facebookProvider: FacebookAuthProvider | undefined;

if (firebaseConfig.apiKey) {
  _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  _auth = getAuth(_app);
  _googleProvider = new GoogleAuthProvider();
  _facebookProvider = new FacebookAuthProvider();
}

export const app = _app;
export const auth = _auth as Auth;
export const googleProvider = _googleProvider as GoogleAuthProvider;
export const facebookProvider = _facebookProvider as FacebookAuthProvider;
