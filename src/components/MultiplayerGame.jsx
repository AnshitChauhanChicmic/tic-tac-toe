import React, { useState, useEffect } from 'react';
import { subscribeToGame, makeMove } from '../services/firebaseService';
import { getCurrentUser } from '../services/authService';

function MultiplayerGame({ gameId, playerSymbol, onBackToLobby }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Subscribe to real-time game updates
    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      if (gameData) {
        setGame(gameData);
        
        // Show status messages
        if (gameData.status === 'waiting') {
          setMessage('⏳ Waiting for another player to join...');
        } else if (gameData.status === 'playing') {
          setMessage('');
        } else if (gameData.status === 'finished') {
          if (gameData.winner === 'draw') {
            setMessage('🤝 It\'s a draw!');
          } else {
            const winnerName = gameData.winner === 'X' 
              ? gameData.playerX?.name 
              : gameData.playerO?.name;
            setMessage(`🏆 Winner: ${winnerName || `Player ${gameData.winner}`}`);
          }
        }
      } else {
        setMessage('❌ Game not found');
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  const handleSquareClick = async (index) => {
    if (!game || !currentUser) return;

    // Check if it's the player's turn
    const currentPlayerData = game.currentPlayer === 'X' ? game.playerX : game.playerO;
    if (currentPlayerData?.id !== currentUser.uid) {
      setMessage('⏳ Not your turn!');
      return;
    }

    // Check if the square is already filled
    if (game.squares[index] !== null) {
      setMessage('❌ This square is already taken!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await makeMove(gameId, index, currentUser.uid);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerInfo = (symbol) => {
    if (symbol === 'X') {
      return game?.playerX;
    } else {
      return game?.playerO;
    }
  };

  const isMyTurn = () => {
    if (!game || !currentUser) return false;
    const currentPlayerData = game.currentPlayer === 'X' ? game.playerX : game.playerO;
    return currentPlayerData?.id === currentUser.uid;
  };

  const isGameActive = () => {
    return game?.status === 'playing';
  };

  if (!game) {
    return (
      <div className="multiplayer-game">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="multiplayer-game">
      <div className="game-header">
        <h2>Multiplayer Game</h2>
        <button onClick={onBackToLobby} className="back-btn">
          ← Back to Lobby
        </button>
      </div>

      <div className="game-info">
        <div className="players">
          <div className={`player ${game.currentPlayer === 'X' ? 'active' : ''}`}>
            <span className="player-symbol">X</span>
            <span className="player-name">
              {game.playerX?.name || 'Player X'}
            </span>
            {game.playerX?.id === currentUser?.uid && <span className="you">(You)</span>}
          </div>
          <div className={`player ${game.currentPlayer === 'O' ? 'active' : ''}`}>
            <span className="player-symbol">O</span>
            <span className="player-name">
              {game.playerO?.name || 'Waiting...'}
            </span>
            {game.playerO?.id === currentUser?.uid && <span className="you">(You)</span>}
          </div>
        </div>

        {message && (
          <div className={`game-message ${message.includes('🏆') ? 'winner' : message.includes('⏳') ? 'waiting' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="game-board">
        <div className="board-grid">
          {game.squares.map((value, index) => (
            <button
              key={index}
              className={`square ${value ? 'filled' : ''} ${isMyTurn() && isGameActive() && !value ? 'clickable' : ''}`}
              onClick={() => handleSquareClick(index)}
              disabled={!isMyTurn() || !isGameActive() || value !== null || loading}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {game.status === 'finished' && (
        <div className="game-over">
          <button onClick={onBackToLobby} className="new-game-btn">
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
}

export default MultiplayerGame; 