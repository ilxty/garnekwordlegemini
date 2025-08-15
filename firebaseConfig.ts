import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKnbyjjakE1SexzByM_PCeJZXQDvLAZgs",
  authDomain: "garnek-events.firebaseapp.com",
  databaseURL: "https://garnek-events-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "garnek-events",
  storageBucket: "garnek-events.appspot.com",
  messagingSenderId: "113887414431",
  appId: "1:113887414431:web:f6f4e79e48c9bfb04ffaaa",
  measurementId: "G-350K24VV2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);