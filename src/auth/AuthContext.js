import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail } from 'firebase/auth';
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
auth.languageCode = 'pt-BR';
const googleProvider = new GoogleAuthProvider();

const API_BASE_URL = 'http://localhost:8080';

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

  const [, setVersion] = useState(0);
  const refreshUser = () => setVersion((v) => v + 1);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const atualizarNome = async (nome) => {
    await updateProfile(auth.currentUser, { displayName: nome });
    refreshUser();
  };

  const reautenticar = (senhaAtual) => {
    const user = auth.currentUser;
    const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
    return reauthenticateWithCredential(user, credencial);
  };

  const alterarSenha = async (senhaAtual, novaSenha) => {
    await reautenticar(senhaAtual);
    await updatePassword(auth.currentUser, novaSenha);
  };

  const alterarEmail = async (senhaAtual, novoEmail) => {
    await reautenticar(senhaAtual);
    await verifyBeforeUpdateEmail(auth.currentUser, novoEmail);
  };

  const temSenha = !!currentUser?.providerData?.some((p) => p.providerId === 'password');

  const value = {
    resetPassword,
    atualizarNome,
    alterarSenha,
    alterarEmail,
    temSenha,
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