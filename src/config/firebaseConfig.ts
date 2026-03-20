import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// आपका नया कॉन्फ़िगरेशन
const firebaseConfig = {
  apiKey: "AIzaSyCB3UwlV7ImvGeB9DloDShvRPh2Z7TUvQ4",
  authDomain: "royalgym-8852c.firebaseapp.com",
  projectId: "royalgym-8852c",
  storageBucket: "royalgym-8852c.firebasestorage.app",
  messagingSenderId: "513997470520",
  appId: "1:513997470520:web:23818a2d9612cb8d555fcd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// एक्सपोर्ट करें ताकि पूरी ऐप इस्तेमाल कर सके
export const db = getFirestore(app);
export const auth = getAuth(app);