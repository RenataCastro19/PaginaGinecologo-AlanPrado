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