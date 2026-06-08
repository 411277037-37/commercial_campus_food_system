import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2MaB_Cb8iPVNQ6iIXMicvv5lTDfGzRNg",
  authDomain: "campus-food-system.firebaseapp.com",
  projectId: "campus-food-system",
  storageBucket: "campus-food-system.firebasestorage.app",
  messagingSenderId: "527890369905",
  appId: "1:527890369905:web:f3e810925e11c4f626bad0"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);