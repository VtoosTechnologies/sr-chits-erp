// Firebase Config

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrDmjvUEqdX58W5KTF3jVn0ejZYqXBwnM",
  authDomain: "sr-chits-erp-5e2d1.firebaseapp.com",
  projectId: "sr-chits-erp-5e2d1",
  storageBucket: "sr-chits-erp-5e2d1.firebasestorage.app",
  messagingSenderId: "540491586931",
  appId: "1:540491586931:web:8b0869ca86a344e1857906"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
