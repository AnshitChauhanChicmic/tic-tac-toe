import React, { useState, useEffect } from 'react';
import { createGameRoom, getAvailableGameRooms, joinGameRoom } from '../services/firebaseService';
import { getCurrentUser } from '../services/authService';

function MultiplayerLobby({ onJoinGame }) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    loadAvailableRooms();
    // Refresh rooms every 5 seconds
    const interval = setInterval(loadAvailableRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAvailableRooms = async () => {
    try {
      const rooms = await getAvailableGameRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const createRoom = async () => {
    setCreatingRoom(true);
    setMessage('');

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setMessage('❌ You must be logged in to create a room');
        return;
      }

      const roomId = await createGameRoom(
        currentUser.uid,
        currentUser.displayName || currentUser.email
      );

      setMessage(`✅ Room created! Room ID: ${roomId}`);
      onJoinGame(roomId, 'X');
    } catch (error) {
      setMessage(`❌ Error creating room: ${error.message}`);
    } finally {
      setCreatingRoom(false);
    }
  };

  const joinRoom = async (roomId) => {
    setLoading(true);
    setMessage('');

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setMessage('❌ You must be logged in to join a room');
        return;
      }

      await joinGameRoom(
        roomId,
        currentUser.uid,
        currentUser.displayName || currentUser.email
      );

      onJoinGame(roomId, 'O');
    } catch (error) {
      setMessage(`❌ Error joining room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="multiplayer-lobby">
      <h2>Multiplayer Lobby</h2>
      
      <div className="lobby-actions">
        <button 
          onClick={createRoom}
          disabled={creatingRoom}
          className="create-room-btn"
        >
          {creatingRoom ? 'Creating Room...' : 'Create New Room'}
        </button>
        
        <button 
          onClick={loadAvailableRooms}
          className="refresh-btn"
        >
          Refresh Rooms
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="available-rooms">
        <h3>Available Rooms ({availableRooms.length})</h3>
        
        {availableRooms.length === 0 ? (
          <p className="no-rooms">No rooms available. Create one to get started!</p>
        ) : (
          <div className="room-list">
            {availableRooms.map((room) => (
              <div key={room.id} className="room-item">
                <div className="room-info">
                  <span className="room-creator">
                    Created by: {room.creatorName}
                  </span>
                  <span className="room-time">
                    {room.createdAt?.toDate?.()?.toLocaleTimeString() || 'Just now'}
                  </span>
                </div>
                <button 
                  onClick={() => joinRoom(room.id)}
                  disabled={loading}
                  className="join-room-btn"
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiplayerLobby; 