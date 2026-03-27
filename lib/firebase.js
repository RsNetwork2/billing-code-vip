import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7DwAsJPHJSDCRT6fQcR1CobpQoTCokrY",
  authDomain: "my-isp-billing.firebaseapp.com",
  projectId: "my-isp-billing",
  storageBucket: "my-isp-billing.firebasestorage.app",
  messagingSenderId: "572162678706",
  appId: "1:572162678706:web:fd60703377cbd7d9384eab"
};

// অ্যাপটি একবারই ইনিশিয়ালাইজ করার জন্য এই চেকটি জরুরি
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
