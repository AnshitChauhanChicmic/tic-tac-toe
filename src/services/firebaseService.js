import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Game collection reference
const gamesCollection = collection(db, 'games');

// Create a new multiplayer game room
export const createGameRoom = async (creatorId, creatorName) => {
  try {
    const gameData = {
      creatorId,
      creatorName,
      playerX: { id: creatorId, name: creatorName },
      playerO: null,
      squares: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'waiting', // waiting, playing, finished
      winner: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(gamesCollection, gameData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating game room:', error);
    throw error;
  }
};

// Join an existing game room
export const joinGameRoom = async (gameId, playerId, playerName) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      playerO: { id: playerId, name: playerName },
      status: 'playing',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error joining game room:', error);
    throw error;
  }
};

// Make a move in the game
export const makeMove = async (gameId, index, playerId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data();
    const squares = [...gameData.squares];
    
    // Check if the move is valid
    if (squares[index] !== null) {
      throw new Error('Invalid move');
    }

    // Check if it's the player's turn
    const currentPlayerData = gameData.currentPlayer === 'X' ? gameData.playerX : gameData.playerO;
    if (currentPlayerData.id !== playerId) {
      throw new Error('Not your turn');
    }

    // Make the move
    squares[index] = gameData.currentPlayer;
    
    // Check for winner
    const winner = calculateWinner(squares);
    const isDraw = !winner && squares.every(square => square !== null);
    
    // Update game state
    const updateData = {
      squares,
      currentPlayer: gameData.currentPlayer === 'X' ? 'O' : 'X',
      updatedAt: serverTimestamp()
    };

    if (winner) {
      updateData.status = 'finished';
      updateData.winner = winner;
    } else if (isDraw) {
      updateData.status = 'finished';
      updateData.winner = 'draw';
    }

    await updateDoc(gameRef, updateData);
  } catch (error) {
    console.error('Error making move:', error);
    throw error;
  }
};

// Get available game rooms
export const getAvailableGameRooms = async () => {
  try {
    const q = query(
      gamesCollection, 
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({ id: doc.id, ...doc.data() });
    });
    return games;
  } catch (error) {
    console.error('Error getting available game rooms:', error);
    throw error;
  }
};

// Listen to game changes in real-time
export const subscribeToGame = (gameId, callback) => {
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Get a specific game
export const getGame = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return { id: gameSnap.id, ...gameSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

// Helper function to calculate winner (same as in App.jsx)
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
} 