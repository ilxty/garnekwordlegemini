
import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDevY6kZuqiGXcRnsA2aQw-PTzCuvZZPQU",
  authDomain: "garnek-events-45d3c.firebaseapp.com",
  projectId: "garnek-events-45d3c",
  storageBucket: "garnek-events-45d3c.firebasestorage.app",
  messagingSenderId: "93923054398",
  appId: "1:93923054398:web:f4a9d2073a749d843ad26f"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);
export const db = getFirestore(app);