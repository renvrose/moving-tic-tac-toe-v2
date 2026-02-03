/** Done by Li Xuan - Fixed for Updated Logic */

const { getAdjacency, checkWin, hasValidMove, countPieces, isValidMove } = require('../src/gameLogic.js');

describe('Game Logic - Adjacency', () => {
  describe('getAdjacency', () => {
    test('returns 8 neighbors for center cell (3x3 board)', () => {
      const adj = getAdjacency(4, 3);
      expect(adj.length).toBe(8);
      expect(adj).toContain(1);
      expect(adj).toContain(3);
      expect(adj).toContain(5);
      expect(adj).toContain(7);
    });

    test('returns 3 neighbors for corner cell', () => {
      const adj = getAdjacency(0, 3);
      expect(adj.length).toBe(3);
      expect(adj).toEqual(expect.arrayContaining([1, 3, 4]));
    });

    test('returns 5 neighbors for edge cell', () => {
      const adj = getAdjacency(1, 3);
      expect(adj.length).toBe(5);
      expect(adj).toEqual(expect.arrayContaining([0, 2, 3, 4, 5]));
    });

    test('no adjacency includes same cell', () => {
      const adj = getAdjacency(4, 3);
      expect(adj).not.toContain(4);
    });
  });
});

describe('Game Logic - Win Detection', () => {
  describe('checkWin', () => {
    test('detects horizontal win', () => {
      const board = ['X', 'X', 'X', null, 'O', null, null, 'O', null];
      const result = checkWin(board, 'X', 3, 3);
      expect(result).toEqual([0, 1, 2]);
    });

    test('detects diagonal win', () => {
      const board = ['X', 'O', null, null, 'X', 'O', null, null, 'X'];
      const result = checkWin(board, 'X', 3, 3);
      expect(result).toEqual([0, 4, 8]);
    });

    test('returns null when no win', () => {
      const board = ['X', 'O', null, 'O', 'X', null, null, null, null];
      const result = checkWin(board, 'X', 3, 3);
      expect(result).toBeNull();
    });
  });
});

describe('Game Logic - Valid Moves', () => {
  describe('isValidMove', () => {
    test('allows placement on empty cell when under max pieces', () => {
      const board = ['X', null, null, null, null, null, null, null, null];
      // Fixed: Added [] for blockedCells
      const result = isValidMove(1, null, board, 3, 3, 'X', []);
      expect(result).toBe(true);
    });

    test('prevents placement on occupied cell', () => {
      const board = ['X', 'O', null, null, null, null, null, null, null];
      // Fixed: Added [] for blockedCells
      const result = isValidMove(1, null, board, 3, 3, 'X', []);
      expect(result).toBe(false);
    });

    test('allows movement to adjacent empty cell after max pieces', () => {
      const board = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
      const selectedIndex = 0;
      // Fixed: Added [] for blockedCells
      const result = isValidMove(3, selectedIndex, board, 3, 3, 'X', []);
      expect(result).toBe(true);
    });

    test('prevents movement to non-adjacent cell', () => {
      const board = ['X', 'X', 'X', 'O', 'O', 'O', null, null, null];
      const selectedIndex = 0;
      // Fixed: Added [] for blockedCells
      const result = isValidMove(8, selectedIndex, board, 3, 3, 'X', []);
      expect(result).toBe(false);
    });
  });
});

describe('Functional Tests - 3x3 Board', () => {
  const boardSize = 3;
  const maxPieces = 3;

  test('cannot place on occupied cell', () => {
    const board = Array(boardSize * boardSize).fill(null);
    board[0] = 'X';
    board[1] = 'O';
    // Fixed: Added [] for blockedCells
    expect(isValidMove(1, null, board, boardSize, maxPieces, 'X', [])).toBe(false);
  });

  test('cannot place more than 3 pieces per player', () => {
    const board = ['X', 'X', 'X', 'O', 'O', 'O', null, null, null];
    // Fixed: Added [] for blockedCells
    expect(isValidMove(6, null, board, boardSize, maxPieces, 'X', [])).toBe(false);
  });
});

describe('Functional Tests - 4x4 Board', () => {
  const boardSize = 4;
  const maxPieces = 4;

  test('can move pieces on larger board', () => {
    const board = Array(boardSize * boardSize).fill(null);
    board[0] = 'X'; board[1] = 'X'; board[2] = 'X'; board[3] = 'X';
    // Fixed: Added [] for blockedCells
    expect(isValidMove(4, 0, board, boardSize, maxPieces, 'X', [])).toBe(true);
  });
});

describe('Functional Tests - 5x5 Board', () => {
  const boardSize = 5;
  const maxPieces = 5;

  test('can move pieces on 5x5 board', () => {
    const board = Array(boardSize * boardSize).fill(null);
    board[0] = 'X'; board[1] = 'X'; board[2] = 'X'; board[3] = 'X'; board[4] = 'X';
    // Fixed: Added [] for blockedCells
    expect(isValidMove(5, 0, board, boardSize, maxPieces, 'X', [])).toBe(true);
  });
});