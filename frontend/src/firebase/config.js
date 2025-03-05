import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_FIREBASE_AUTHDOMAIN,
  projectId:import.meta.env.VITE_REACT_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_REACT_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_REACT_FIREBASE_APIID,
  measurementId: import.meta.env.VITE_REACT_FIREBASE_MEASUREMENTID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);