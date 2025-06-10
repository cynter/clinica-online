// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDHKewLxCZ68EOcw4_dCOzokZwhWpa0TWs",
  authDomain: "clinica-online-b51f0.firebaseapp.com",
  projectId: "clinica-online-b51f0",
  storageBucket: "clinica-online-b51f0.firebasestorage.app",
  messagingSenderId: "907284778656",
  appId: "1:907284778656:web:8c7230b6b05ce9662043c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);