import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth'; //
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyACJziOGGZFkBEzez29Ye8GIBDle6ONJ3U", 
  authDomain: "finanzas-b79fb.firebaseapp.com", 
  projectId: "finanzas-b79fb", 
  storageBucket: "finanzas-b79fb.firebasestorage.app", 
  messagingSenderId: "983109493563", 
  appId: "1:983109493563:web:571b90cc3e220870294d1e", 
  measurementId: "G-WTC6NG323T" 
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const API_BASE_URL = 'https://finanzas-backend-rmik.onrender.com';

axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user && config.url && config.url.startsWith(API_BASE_URL)) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    auth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};