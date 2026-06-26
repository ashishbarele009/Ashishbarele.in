import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBly4fuWvwfD3Olamu7235mabXe_hIa1uc",
  authDomain: "ashishbarele-d43a7.firebaseapp.com",
  projectId: "ashishbarele-d43a7",
  storageBucket: "ashishbarele-d43a7.firebasestorage.app",
  messagingSenderId: "504298525698",
  appId: "1:504298525698:web:965de06c3eb24a8e97031b",
  measurementId: "G-GX5WEK9TLL"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
