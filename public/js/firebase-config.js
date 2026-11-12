// Conexión central con Firebase y Cloudinary.
// IMPORTANTE: este es el ÚNICO archivo del proyecto que importa desde gstatic.com.
// Las demás páginas importan todo desde aquí. Para cambiar la versión del SDK,
// basta con modificar el número en las líneas de este archivo (todas deben ser iguales).

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBt7r416yfaDb85y8Z7pwlM3G415KuXE8",
  authDomain: "dr-alan-prado.firebaseapp.com",
  projectId: "dr-alan-prado",
  storageBucket: "dr-alan-prado.firebasestorage.app",
  messagingSenderId: "1082250427153",
  appId: "1:1082250427153:web:2f26401b5034c17ba3eab0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const CLOUDINARY = {
  cloudName: "ktwijk7i",
  uploadPreset: "panel_dr_alan"
};

// Funciones de Authentication que usan las páginas del proyecto
export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Funciones de Firestore que usan las páginas del proyecto
export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";