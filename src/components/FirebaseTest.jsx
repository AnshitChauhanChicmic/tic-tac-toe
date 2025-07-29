import { useState, useEffect } from 'react';
import { createGame, getRecentGames } from '../services/firebaseService';

function FirebaseTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Test Firebase connection on component mount
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      // Try to create a test game
      const gameId = await createGame({
        squares: Array(9).fill(null),
        xIsNext: true,
        status: 'Test game'
      });
      
      if (gameId) {
        setIsConnected(true);
        setTestResult('✅ Firebase connected successfully! Test game created with ID: ' + gameId);
      }
    } catch (error) {
      setIsConnected(false);
      setTestResult('❌ Firebase connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetGames = async () => {
    try {
      setLoading(true);
      const games = await getRecentGames(5);
      setTestResult(`✅ Retrieved ${games.length} recent games`);
    } catch (error) {
      setTestResult('❌ Failed to get games: ' + error.message);
    } finally {
      setLoading(false);
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
      <h3>Firebase Connection Test</h3>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <p>{testResult}</p>
      
      <div style={{ marginTop: '15px' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button 
          onClick={testGetGames}
          disabled={loading || !isConnected}
          style={{
            padding: '8px 16px',
            backgroundColor: isConnected ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || !isConnected) ? 'not-allowed' : 'pointer'
          }}
        >
          Test Get Games
        </button>
      </div>
    </div>
  );
}

export default FirebaseTest; 