{/*
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call PHP endpoint to validate session/token
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/validate`, {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Store cookies
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials');
      }

      const data = await response.json();
      setUser(data.user);
      toast.success('Login successful');
      return data;
    } catch (error) {
      toast.error('Login failed: ' + error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
*/}
// src/contexts/AuthContext.jsx
//require('dotenv').config(); // Load environment variables from .env file
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';

// 1. Your Firebase config (replace with your own values)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  //measurementId: "G-6YLQ2GG6SH"
};

// 2. Initialize Firebase app & auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//const database = getDatabase(app);

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 3. Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 4. Firebase sign-in
  const login = async (email, password) => {
    try {
      setLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
      return credential.user;
    } catch (err) {
      toast.error('Login failed: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Firebase sign-out
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
      console.error(err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
