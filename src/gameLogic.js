/**
 * Core game logic functions for tic-tac-toe V2
 * These functions are exported for testing
 */

/**
 * Get all adjacent cells for a given position
 * @param {number} i - Cell index
 * @param {number} boardSize - Size of the board
 * @returns {number[]} Array of adjacent cell indices
 */
function getAdjacency(i, boardSize) {
  const adj = [];
  const row = Math.floor(i / boardSize);
  const col = i % boardSize;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
        adj.push(r * boardSize + c);
      }
    }
  }
  return adj;
}

/**
 * Check if current player has won
 */
function checkWin(board, currentPlayer, boardSize, winLength) {
  const patterns = [];

  // Horizontal patterns
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c <= boardSize - winLength; c++) {
      patterns.push([...Array(winLength)].map((_, i) => r * boardSize + c + i));
    }
  }

  // Vertical patterns
  for (let c = 0; c < boardSize; c++) {
    for (let r = 0; r <= boardSize - winLength; r++) {
      patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + c));
    }
  }

  // Diagonal patterns
  for (let r = 0; r <= boardSize - winLength; r++) {
    for (let c = 0; c <= boardSize - winLength; c++) {
      patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + (c + i)));
      patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + (c + winLength - 1 - i)));
    }
  }

  return patterns.find(p => p.every(i => board[i] === currentPlayer)) || null;
}

/**
 * NEW: Logic for the Earthquake mechanic
 * Shuffles all existing pieces to random empty locations
 */
function shuffleBoard(board, boardSize) {
  let pieces = board.map((cell, idx) => ({cell, idx})).filter(o => o.cell !== null);
  let indices = [...Array(boardSize * boardSize).keys()].sort(() => Math.random() - 0.5);
  let newBoard = Array(boardSize * boardSize).fill(null);
  
  pieces.forEach((p, i) => { 
    newBoard[indices[i]] = p.cell; 
  });
  return newBoard;
}

/**
 * Updated isValidMove to respect Blocked Cells
 */
function isValidMove(targetIndex, selectedIndex, board, boardSize, maxPieces, currentPlayer, blockedCells = []) {
  // Cannot move into a blocked cell
  if (blockedCells.includes(targetIndex)) return false;

  const pieces = board.filter(cell => cell === currentPlayer).length;

  // Phase 1: Placement
  if (pieces < maxPieces) {
    return board[targetIndex] === null;
  }

  // Phase 2: Movement
  if (selectedIndex !== null && board[targetIndex] === null) {
    return getAdjacency(selectedIndex, boardSize).includes(targetIndex);
  }

  return false;
}

/**
 * Power Card Logic Handlers
 */
function applyPower(type, board, targetIndex, boardSize, currentPlayer) {
  const newBoard = [...board];
  const opponent = currentPlayer === "X" ? "O" : "X";

  switch (type) {
    case 'refresh':
      // Clears the entire row of the target index
      const row = Math.floor(targetIndex / boardSize);
      for (let c = 0; c < boardSize; c++) {
        newBoard[row * boardSize + c] = null;
      }
      break;

    case 'tornado':
      // Moves an opponent's piece to a random empty spot
      if (newBoard[targetIndex] === opponent) {
        const emptyIndices = newBoard.map((c, i) => c === null ? i : null).filter(i => i !== null);
        if (emptyIndices.length > 0) {
          const randomDest = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          newBoard[randomDest] = opponent;
          newBoard[targetIndex] = null;
        }
      }
      break;
      
    // 'blocker' doesn't change the board directly, it adds to blockedCells state in the UI
  }
  return newBoard;
}

// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAdjacency,
    checkWin,
    isValidMove,
    shuffleBoard,
    applyPower
  };
}