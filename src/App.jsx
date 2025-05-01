
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UploadProvider } from './contexts/UploadContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UploadProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </UploadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
