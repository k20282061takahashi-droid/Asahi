// Firebaseへの接続をまとめたファイル
// 他の画面からは、ここで作った db や app を import して使う

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Next.js は同じコードが何度も読み込まれることがあるため、
// すでに初期化済みなら使い回し、まだなら新しく作る
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore（データベース）を、他のファイルから使えるようにする
export const db = getFirestore(app);