import { useState, useEffect } from 'react';
import { onAuthStateChange, signOutUser } from '../services/authService';
import Login from './Login';
import Signup from './Signup';

function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLoginSuccess = () => {
    // Login success is handled by the auth state listener
  };

  const handleSignupSuccess = () => {
    // Signup success is handled by the auth state listener
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-wrapper">
        {showLogin ? (
          <Login 
            onSwitchToSignup={() => setShowLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Signup 
            onSwitchToLogin={() => setShowLogin(true)}
            onSignupSuccess={handleSignupSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="user-info">
          <span>{user.displayName || 'User'}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

export default Auth; 