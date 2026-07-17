// Firebase Config

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvc55aBx-wv8JqHdXv0HKz5DFT-Mm6WN0",
  authDomain: "sr-chits-erp.firebaseapp.com",
  projectId: "sr-chits-erp",
  storageBucket: "sr-chits-erp.firebasestorage.app",
  messagingSenderId: "62741844196",
  appId: "1:62741844196:web:d8c2ad943838cdf9a35cf1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
