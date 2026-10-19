import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYpfCHvjy0BxvacXdHZlFLz-6xALep9oA",
  authDomain: "armoniosamente-a89fe.firebaseapp.com",
  projectId: "armoniosamente-a89fe",
  storageBucket: "armoniosamente-a89fe.firebasestorage.app",
  messagingSenderId: "940914513282",
  appId: "1:940914513282:web:f945df8ff20a2ab6856b9b",
  measurementId: "G-1E054TPFTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportar autenticación y funciones para Google
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error al iniciar sesión con Google", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión", error);
  }
};