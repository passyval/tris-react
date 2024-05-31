import React, { useState } from 'react';
import './App.css';

function Square({ value, onSquareClick, isWinningSquare, gameStarted }) {
  return (
    <button className={isWinningSquare ? "square winning-square" : "square"} onClick={gameStarted ? onSquareClick : null}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winningLine, gameStarted, playerXName, playerOName }) {
  function handleClick(i) {
    if (!gameStarted || calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const nextPlayer = xIsNext ? playerXName : playerOName;

  return (
    <>
      <div className="status">{winner ? 'Winner: ' + winner : 'NEXT PLAYER: ' + nextPlayer}</div>  
      {[0, 1, 2].map(row => (
        <div key={row} className="board-row">
          {[0, 1, 2].map(col => {
            const index = row * 3 + col;
            const isWinningSquare = winningLine && winningLine.includes(index);
            return (
              <Square key={col} value={squares[index]} onSquareClick={() => handleClick(index)} isWinningSquare={isWinningSquare} gameStarted={gameStarted} />
            );
          })}
        </div>
      ))}
    </>
  );
}

function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [playerXWinsRoom1, setPlayerXWinsRoom1] = useState(parseInt(localStorage.getItem('playerXWinsRoom1')) || 0);
  const [playerOWinsRoom1, setPlayerOWinsRoom1] = useState(parseInt(localStorage.getItem('playerOWinsRoom1')) || 0);
  const [playerXWinsRoom2, setPlayerXWinsRoom2] = useState(parseInt(localStorage.getItem('playerXWinsRoom2')) || 0);
  const [playerOWinsRoom2, setPlayerOWinsRoom2] = useState(parseInt(localStorage.getItem('playerOWinsRoom2')) || 0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(1); //stanza di partenza 1
  const [xIsNext, setXIsNext] = useState(true);
  const [currentSquares, setCurrentSquares] = useState(Array(9).fill(null));
  const [winningLine, setWinningLine] = useState(null);
  const [playerXName, setPlayerXName] = useState('');
  const [playerOName, setPlayerOName] = useState('');

  function handlePlay(nextSquares) {
    const winner = calculateWinner(nextSquares);
    if (winner) {
      if (winner.winner === 'X') {
        if (selectedRoom === 1) {
          setPlayerXWinsRoom1(prevWins => {
            const newWins = prevWins + 1;
            localStorage.setItem('playerXWinsRoom1', newWins);
            return newWins;
          });
        } else {
          setPlayerXWinsRoom2(prevWins => {
            const newWins = prevWins + 1;
            localStorage.setItem('playerXWinsRoom2', newWins);
            return newWins;
          });
        }
      } else {
        if (selectedRoom === 1) {
          setPlayerOWinsRoom1(prevWins => {
            const newWins = prevWins + 1;
            localStorage.setItem('playerOWinsRoom1', newWins);
            return newWins;
          });
        } else {
          setPlayerOWinsRoom2(prevWins => {
            const newWins = prevWins + 1;
            localStorage.setItem('playerOWinsRoom2', newWins);
            return newWins;
          });
        }
      }
    }
    setHistory(prevHistory => [...prevHistory, nextSquares]);
    setCurrentSquares(nextSquares);
    setXIsNext(!xIsNext);
    setWinningLine(winner ? winner.line : null);
  }

  function startGame() {
    setGameStarted(true);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]); //griglia di gioco vuota inizialmente
    setCurrentSquares(Array(9).fill(null));
    setGameStarted(false); //gioco non attivo all'inizio
    setWinningLine(null); //attualmente non ce una linea vincente
    setXIsNext(true); //X sarà il primo giocatore
  }

  function changeRoom(roomNumber) {
    setSelectedRoom(roomNumber);
    const savedPlayerXName = localStorage.getItem(`playerXNameRoom${roomNumber}`) || '';
    const savedPlayerOName = localStorage.getItem(`playerONameRoom${roomNumber}`) || '';
    setPlayerXName(savedPlayerXName);
    setPlayerOName(savedPlayerOName);
    resetGame();
  }
  

  function handlePlayerXNameChange(name) {
    setPlayerXName(name);
    localStorage.setItem(`playerXNameRoom${selectedRoom}`, name);
  }

  function handlePlayerONameChange(name) {
    setPlayerOName(name);
    localStorage.setItem(`playerONameRoom${selectedRoom}`, name);
  }

  function resetScores() {
    setPlayerXWinsRoom1(0);
    setPlayerOWinsRoom1(0);
    setPlayerXWinsRoom2(0);
    setPlayerOWinsRoom2(0);
    localStorage.removeItem('playerXWinsRoom1');
    localStorage.removeItem('playerOWinsRoom1');
    localStorage.removeItem('playerXWinsRoom2');
    localStorage.removeItem('playerOWinsRoom2');
  }

  
function formatName(name) {
  const maxLength = 5; // Lunghezza massima consentita per il nome
  if (name.length > maxLength) {
    return (
      <span style={{ display: 'inline-block', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name.substring(0, maxLength)}...
      </span>
    );
  }
  return name;
}

  return (
    <div className="game light-theme">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningLine={winningLine}
          gameStarted={gameStarted}
          playerXName={playerXName}
          playerOName={playerOName}
        />
      </div>
      <div className="game-info">
        <div>
          <p>{playerXName ? `${formatName(playerXName)} Wins:` : 'Player X Wins:'} {selectedRoom === 1 ? playerXWinsRoom1 : playerXWinsRoom2}</p>
          <p>{playerOName ? `${formatName(playerOName)} Wins:` : 'Player O Wins:'} {selectedRoom === 1 ? playerOWinsRoom1 : playerOWinsRoom2}</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Nome giocatore X"
            className="player-name-input"
            value={playerXName}
            onChange={(e) => handlePlayerXNameChange(e.target.value)}
            disabled={gameStarted}
          />
          <input
            type="text"
            placeholder="Nome giocatore O"
            className="player-name-input"
            value={playerOName}
            onChange={(e) => handlePlayerONameChange(e.target.value)}
            disabled={gameStarted}
          />
        </div>
        <ol>{history.map((squares, move) => (
          <li key={move}>
            {/* <button onClick={() => jumpTo(move)}>Go to move #{move}</button> */}
          </li>
        ))}</ol>
        <div>
          <button onClick={startGame} disabled={gameStarted}>INIZIA PARTITA</button>
          <button onClick={resetGame} disabled={!gameStarted}>RESET</button>
          <button onClick={resetScores}>RESET DEL PUNTEGGIO</button>
          <div>
            <button onClick={() => changeRoom(1)}>Stanza 1</button>
            <button onClick={() => changeRoom(2)}>Stanza 2</button>
          </div>
        </div>
        <p>STANZA: Stanza {selectedRoom}</p>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // righe
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonne
    [0, 4, 8], [2, 4, 6] // diagonali
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { line: lines[i], winner: squares[a] };
    }
  }
  return null;
}

export default Game;