import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, loading, toasts } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-secondary)'
        }}
      >
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--color-primary)' }} />
        <span style={{ marginTop: '16px', fontSize: '18px', fontWeight: 5 }}>Verifying secure session...</span>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : authView === 'login' ? (
        <Login toggleView={setAuthView} />
      ) : (
        <Register toggleView={setAuthView} />
      )}
      
      {/* Toast Notification Layer */}
      <Toast toasts={toasts} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
