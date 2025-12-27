import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvyFXgRpfZ1AYpWbPJsIewpf7Ng2Hc6l4",
  authDomain: "vitaly-login.firebaseapp.com",
  projectId: "vitaly-login",
  storageBucket: "vitaly-login.firebasestorage.app",
  messagingSenderId: "696294071128",
  appId: "1:696294071128:web:8ed3b708d52c147297632d",
};

// Evita inicializar múltiples veces
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };