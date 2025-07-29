import { useState } from 'react';
import { auth } from '../firebase-alt';

function FirebaseAuthTest() {
  const [testResult, setTestResult] = useState('');

  const testAuthConfig = () => {
    try {
      setTestResult('Testing Firebase Auth configuration...');
      
      // Check if auth is properly initialized
      if (!auth) {
        setTestResult('❌ Auth is not initialized');
        return;
      }

      // Check auth config
      const authConfig = auth.config;
      console.log('Auth config:', authConfig);
      
      // Test if we can access auth methods
      const currentUser = auth.currentUser;
      const authState = auth.app.options;
      
      setTestResult(`✅ Auth initialized successfully
Project ID: ${authState?.projectId || 'Not found'}
Auth Domain: ${authState?.authDomain || 'Not found'}
Current User: ${currentUser ? currentUser.email : 'None'}
Auth App: ${auth.app.name}
Auth Config Available: ${authConfig ? 'Yes' : 'No'}`);
      
    } catch (error) {
      setTestResult(`❌ Auth test failed: ${error.message}
Error Code: ${error.code}
Error Details: ${JSON.stringify(error, null, 2)}`);
      console.error('Auth test error:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white'
    }}>
      <h3>Firebase Auth Configuration Test</h3>
      <button 
        onClick={testAuthConfig}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Test Auth Configuration
      </button>
      <pre style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        padding: '10px', 
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        fontSize: '12px'
      }}>
        {testResult}
      </pre>
    </div>
  );
}

export default FirebaseAuthTest; 