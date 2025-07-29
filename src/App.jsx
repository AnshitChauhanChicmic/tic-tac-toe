import React, { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'
import MultiplayerLobby from './components/MultiplayerLobby'
import MultiplayerGame from './components/MultiplayerGame'

function calculateWinner(squares){
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for(let i=0; i<lines.length; i++){
    const [a, b, c] = lines[i];
    if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
      return squares[a];
    }
  }
  return null;
}

function Square({value, onSquareClick}) {

  return <button
            onClick={onSquareClick} 
            className='square'
          >
            {value}
          </button>
}

function Board({ 
  gameMode, 
  currentPlayer, 
  setCurrentPlayer, 
  updateScore, 
  resetGame, 
  player1Name, 
  player2Name,
  squares,
  setSquares
}) {

  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(squares);
  let status;
  
  if (winner) {
    const winnerName = gameMode === 'local-multiplayer' 
      ? (winner === 'X' ? player1Name : player2Name) || `Player ${winner}`
      : `Player ${winner}`;
    status = `Winner: ${winnerName}`;
  } else if (squares.every(square => square !== null)) {
    status = "It's a draw!";
  } else {
    const currentPlayerName = gameMode === 'local-multiplayer'
      ? (currentPlayer === 'X' ? player1Name : player2Name) || `Player ${currentPlayer}`
      : `Player ${currentPlayer}`;
    status = `Next player: ${currentPlayerName}`;
  }

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = currentPlayer;
    setSquares(nextSquares);
    
    // Switch players
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);
    setXIsNext(!xIsNext);
  }

  // Check for winner and update score
  React.useEffect(() => {
    if (winner) {
      updateScore(winner);
    }
  }, [winner]); // Remove updateScore from dependencies

  return (
    
    <>
      <div className='status'>{status}</div>
      <div className='board-row'>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className='board-row'>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className='board-row'>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
      {(winner || squares.every(square => square !== null)) && (
        <button onClick={resetGame} className='new-game-btn'>
          New Game
        </button>
      )}
    </>
  )
}


export default function Game(){

  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameMode, setGameMode] = useState('single'); // 'single', 'local-multiplayer', 'online-multiplayer'
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [multiplayerState, setMultiplayerState] = useState('lobby'); // 'lobby', 'game'
  const [currentGameId, setCurrentGameId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [scoreUpdated, setScoreUpdated] = useState(false);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const currentSquares = history[history.length - 1];

  function handlePlay(){
    
  }

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setXIsNext(true);
    setCurrentPlayer('X');
    setScoreUpdated(false);
    setSquares(Array(9).fill(null));
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0 });
  };

  const updateScore = React.useCallback((winner) => {
    if (winner && !scoreUpdated) {
      setScores(prev => ({
        ...prev,
        [winner]: prev[winner] + 1
      }));
      setScoreUpdated(true);
    }
  }, [scoreUpdated]);

  const handleJoinGame = (gameId, symbol) => {
    setCurrentGameId(gameId);
    setPlayerSymbol(symbol);
    setMultiplayerState('game');
  };

  const handleBackToLobby = () => {
    setMultiplayerState('lobby');
    setCurrentGameId(null);
    setPlayerSymbol(null);
  };

  // Render multiplayer game
  if (gameMode === 'online-multiplayer') {
    if (multiplayerState === 'game') {
      return (
        <Auth>
          <MultiplayerGame 
            gameId={currentGameId}
            playerSymbol={playerSymbol}
            onBackToLobby={handleBackToLobby}
          />
        </Auth>
      );
    } else {
      return (
        <Auth>
          <MultiplayerLobby onJoinGame={handleJoinGame} />
        </Auth>
      );
    }
  }

  return (
    <Auth>
      <div className='game'>
        <div className='game-setup'>
          <div className='game-mode-selector'>
            <h3>Game Mode</h3>
            <div className='mode-buttons'>
              <button 
                className={gameMode === 'single' ? 'active' : ''}
                onClick={() => setGameMode('single')}
              >
                Single Player
              </button>
              <button 
                className={gameMode === 'local-multiplayer' ? 'active' : ''}
                onClick={() => setGameMode('local-multiplayer')}
              >
                Local Two Players
              </button>
              <button 
                className={gameMode === 'online-multiplayer' ? 'active' : ''}
                onClick={() => setGameMode('online-multiplayer')}
              >
                Online Multiplayer
              </button>
            </div>
          </div>

          {gameMode === 'local-multiplayer' && (
            <div className='player-names'>
              <div className='player-input'>
                <label>Player X:</label>
                <input 
                  type="text" 
                  value={player1Name} 
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter Player X name"
                />
              </div>
              <div className='player-input'>
                <label>Player O:</label>
                <input 
                  type="text" 
                  value={player2Name} 
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter Player O name"
                />
              </div>
            </div>
          )}
        </div>

        <div className='scoreboard'>
          <h3>Scoreboard</h3>
          <div className='scores'>
            <div className='score-item'>
              <span className='player-name'>
                {gameMode === 'local-multiplayer' && player1Name ? player1Name : 'Player X'}
              </span>
              <span className='score'>{scores.X}</span>
            </div>
            <div className='score-item'>
              <span className='player-name'>
                {gameMode === 'local-multiplayer' && player2Name ? player2Name : 'Player O'}
              </span>
              <span className='score'>{scores.O}</span>
            </div>
          </div>
          <button onClick={resetScores} className='reset-scores-btn'>
            Reset Scores
          </button>
        </div>

        <div className='game-board'>
          <Board 
            gameMode={gameMode}
            currentPlayer={currentPlayer}
            setCurrentPlayer={setCurrentPlayer}
            updateScore={updateScore}
            resetGame={resetGame}
            player1Name={player1Name}
            player2Name={player2Name}
            squares={squares}
            setSquares={setSquares}
          />
        </div>
      </div>
    </Auth>
  )
}