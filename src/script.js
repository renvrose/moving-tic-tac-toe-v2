document.addEventListener("DOMContentLoaded", () => {
    // --- UI Elements ---
    const grid = document.getElementById("grid");
    const status = document.getElementById("status");
    const resetBtn = document.getElementById("resetBtn");
    const undoBtn = document.getElementById("undoBtn");
    const boardSizeSelect = document.getElementById("boardSizeSelect");
    const startBtn = document.getElementById("startBtn");
    const playerXInput = document.getElementById("playerXInput");
    const playerOInput = document.getElementById("playerOInput");
    const setup = document.getElementById("setup");
    const game = document.getElementById("game");

    // --- NEW THEME ELEMENT ---
    const globalThemeSelect = document.getElementById("globalThemeSelect");

    // --- State Variables ---
    let boardSize = 3;
    let board = [];
    let currentPlayer = "X";
    let selected = null;
    let gameOver = false;
    let winningCells = null;
    let history = [];
    let maxPieces = 3; 
    let winLength = 3;
    let moveCount = 0;
    const QUAKE_EVERY = 5; 
    const MAX_MOVES = 40; 

    let playerXName = "Player X";
    let playerOName = "Player O";

    let isUsingPower = false;
    let currentPowerType = '';
    let blockedCells = [];
    let usedPowers = { X: false, O: false };

    const powerCards = [
        { id: 'blocker', name: '🚫 Blocker' },
        { id: 'refresh', name: '♻️ Refresh' },
        { id: 'tornado', name: '🌪️ Tornado' }
    ];

    // ================= CORE RENDERING =================

    function render() {
        grid.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        grid.innerHTML = "";
        
        board.forEach((cell, i) => {
            const div = document.createElement("div");
            div.className = "cell";
            div.textContent = cell || "";
            
            if (cell === "X") div.classList.add("X");
            if (cell === "O") div.classList.add("O");
            if (blockedCells.includes(i)) {
                div.classList.add("blocked");
                div.textContent = "🚫";
            }
            if (i === selected) div.classList.add("selected");
            
            if (selected !== null && board[i] === null && !blockedCells.includes(i)) {
                if (getAdjacency(selected).includes(i)) {
                    div.classList.add("valid");
                }
            }
            
            if (winningCells && winningCells.includes(i)) div.classList.add("win");
            
            if (!gameOver) {
                div.onclick = () => handleClick(i);
            } else {
                div.style.cursor = "default";
            }
            grid.appendChild(div);
        });

        const btnX = document.getElementById('usePowerX');
        const btnO = document.getElementById('usePowerO');
        if(btnX) btnX.disabled = (gameOver || currentPlayer !== 'X' || usedPowers.X || isUsingPower);
        if(btnO) btnO.disabled = (gameOver || currentPlayer !== 'O' || usedPowers.O || isUsingPower);
    }

    // ================= GAMEPLAY LOGIC =================

    function handleClick(i) {
        if (gameOver) return;
        if (isUsingPower) {
            handlePowerCardClick(i);
            return;
        }

        const piecesOnBoard = board.filter(c => c === currentPlayer).length;

        // Phase 1: Placement
        if (piecesOnBoard < maxPieces) {
            if (board[i] === null && !blockedCells.includes(i)) {
                saveHistory();
                board[i] = currentPlayer;
                moveCount++;
                endTurn();
            }
            return;
        }

        // Phase 2: Movement - Select piece
        if (board[i] === currentPlayer) {
            selected = (selected === i) ? null : i;
            updateStatusMessage();
            render();
            return;
        }

        // Phase 2: Movement - Move piece
        if (selected !== null && board[i] === null && !blockedCells.includes(i)) {
            if (getAdjacency(selected).includes(i)) {
                saveHistory();
                board[i] = currentPlayer;
                board[selected] = null;
                selected = null;
                moveCount++;
                endTurn();
            }
        }
    }

    function endTurn() {
        const winPattern = checkWin();
        if (winPattern) {
            winningCells = winPattern;
            gameOver = true;
            status.textContent = `🎉 ${currentPlayer === "X" ? playerXName : playerOName} wins!`;
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70 });
            render();
            return; 
        }

        if (moveCount >= MAX_MOVES) {
            gameOver = true;
            status.textContent = "🤝 It's a Draw!";
            const drawPop = document.getElementById('drawPopUp');
            if (drawPop) drawPop.style.display = 'flex';
            render();
            return;
        }

        if (moveCount > 0 && moveCount % QUAKE_EVERY === 0) {
            triggerQuakeSequence();
        } else {
            finalizeTurn();
        }
    }

    function finalizeTurn() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        selected = null;
        updateStatusMessage();
        render();
    }

    // ================= POWER SYSTEM =================

    function usePowerCard(player, card) {
        if (gameOver || currentPlayer !== player || usedPowers[player]) return;
        isUsingPower = true;
        currentPowerType = card.id;

        const powerPop = document.getElementById('powerPopUp');
        if (powerPop) {
            document.getElementById('powerText').textContent = `${card.name.toUpperCase()} ACTIVATED!`;
            powerPop.style.display = 'flex';
            setTimeout(() => { powerPop.style.display = 'none'; }, 1500);
        }

        status.textContent = `Using ${card.name}: Select Target`;
        render();
    }

    function handlePowerCardClick(i) {
        const opponent = currentPlayer === "X" ? "O" : "X";
        let success = false;

        if (currentPowerType === 'blocker' && board[i] === null) {
            blockedCells.push(i);
            success = true;
        } else if (currentPowerType === 'refresh') {
            const row = Math.floor(i / boardSize);
            for (let c = 0; c < boardSize; c++) board[row * boardSize + c] = null;
            success = true;
        } else if (currentPowerType === 'tornado' && board[i] === opponent) {
            const empty = board.map((c, idx) => c === null ? idx : null).filter(idx => idx !== null);
            if (empty.length > 0) {
                board[empty[Math.floor(Math.random() * empty.length)]] = opponent;
                board[i] = null;
                success = true;
            }
        }

        if (success) {
            usedPowers[currentPlayer] = true;
            const btn = document.getElementById(`usePower${currentPlayer}`);
            if (btn) btn.textContent = "❌ Used";
            
            isUsingPower = false;
            currentPowerType = '';
            moveCount++; 
            endTurn();
        }
    }

    // ================= EARTHQUAKE SEQUENCER =================

    function triggerQuakeSequence() {
        const alertBox = document.getElementById('earthquakeAlert');
        const counter = document.getElementById('quakeCounter');
        if (!alertBox) return finalizeTurn();

        alertBox.style.display = 'flex';
        let count = 3;
        counter.textContent = count;

        const timer = setInterval(() => {
            count--;
            counter.textContent = count;
            if (count <= 0) {
                clearInterval(timer);
                alertBox.style.display = 'none';
                doEarthquake();
            }
        }, 1000);
    }

    function doEarthquake() {
        document.body.classList.add('earthquake-shake');
        let pieces = board.map((cell, idx) => ({cell, idx})).filter(o => o.cell !== null);
        let indices = [...Array(boardSize * boardSize).keys()].sort(() => Math.random() - 0.5);
        board = Array(boardSize * boardSize).fill(null);
        pieces.forEach((p, i) => { board[indices[i]] = p.cell; });

        setTimeout(() => {
            document.body.classList.remove('earthquake-shake');
            render();
            finalizeTurn();
        }, 600);
    }

    // ================= HELPERS & INIT =================

    function updateStatusMessage() {
        const name = currentPlayer === "X" ? playerXName : playerOName;
        if (gameOver) return;
        if (isUsingPower) return; 
        status.textContent = (selected !== null) ? `${name}: Select destination` : `${name}'s turn`;
    }

    function getAdjacency(i) {
        const adj = [];
        const row = Math.floor(i / boardSize);
        const col = i % boardSize;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr, c = col + dc;
                if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) adj.push(r * boardSize + c);
            }
        }
        return adj;
    }

    function checkWin() {
        const patterns = [];
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j <= boardSize - winLength; j++) {
                patterns.push([...Array(winLength)].map((_, k) => i * boardSize + j + k)); 
                patterns.push([...Array(winLength)].map((_, k) => (j + k) * boardSize + i)); 
            }
        }
        for (let r = 0; r <= boardSize - winLength; r++) {
            for (let c = 0; c <= boardSize - winLength; c++) {
                patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + (c + i)));
                patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + (c + winLength - 1 - i)));
            }
        }
        return patterns.find(p => p.every(idx => board[idx] === currentPlayer)) || null;
    }

    function assignPowerCards() {
        const cardX = powerCards[Math.floor(Math.random() * powerCards.length)];
        const cardO = powerCards[Math.floor(Math.random() * powerCards.length)];
        document.getElementById('powerNameX').textContent = cardX.name;
        document.getElementById('powerNameO').textContent = cardO.name;
        document.getElementById('usePowerX').onclick = () => usePowerCard('X', cardX);
        document.getElementById('usePowerO').onclick = () => usePowerCard('O', cardO);
        document.getElementById('usePowerX').textContent = "Use Power";
        document.getElementById('usePowerO').textContent = "Use Power";
    }

    function saveHistory() { history.push([...board]); }

    function resetGame() {
        playerXName = playerXInput.value || "Player X";
        playerOName = playerOInput.value || "Player O";
        
        document.getElementById('displayXName').textContent = playerXName;
        document.getElementById('displayOName').textContent = playerOName;
        
        boardSize = parseInt(boardSizeSelect.value);
        maxPieces = boardSize;
        winLength = boardSize;
        board = Array(boardSize * boardSize).fill(null);

        currentPlayer = "X";
        gameOver = false;
        winningCells = null;
        moveCount = 0;
        history = [];
        blockedCells = [];
        usedPowers = { X: false, O: false };
        selected = null;
        
        assignPowerCards();
        updateStatusMessage();
        render();
    }

    // ================= NAVIGATION LOGIC =================

    startBtn.onclick = () => {
        setup.style.display = "none";
        game.style.display = "flex";
        resetGame();
    };

    resetBtn.onclick = () => {
        game.style.display = "none";
        setup.style.display = "flex";
    };

    const drawHomeBtn = document.getElementById("drawHomeBtn");
    if (drawHomeBtn) {
        drawHomeBtn.onclick = () => {
            document.getElementById('drawPopUp').style.display = 'none';
            game.style.display = "none";
            setup.style.display = "flex";
        };
    }

    undoBtn.onclick = () => {
        if (history.length > 0 && !gameOver) {
            board = history.pop();
            currentPlayer = (currentPlayer === "X") ? "O" : "X";
            moveCount--;
            render();
            updateStatusMessage();
        }
    };

    // ================= NEW THEME LOGIC =================
    if (globalThemeSelect) {
        globalThemeSelect.addEventListener("change", (e) => {
            document.body.setAttribute("data-theme", e.target.value);
        });
    }
});