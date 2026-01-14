// ==UserScript==
// @name         Soul Predictor - Arc ( For Devs )
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Advanced mines game predictor with enhanced stats, consistent performance, and improved autoplay
// @author       You
// @match        https://stake.bet/*
// @grant        none
// ==/UserScript==

let webUrl = 'bet';

(function() {
    'use strict';

    // Text formatting utilities
    const formatText = {
        addSpace: (text) => text.replace(/(\d+)([A-Za-z])/g, '$1 $2'),
        title: (text) => text.split('-').join(' - '),
        stats: (num) => Number(num).toLocaleString()
    };

    // Core configuration stored in string format
    const getConfig = () => ({
        api: atob('aHR0cHM6Ly9zb3VsYXBpY3Jhc2gucHl0aG9uYW55d2hlcmUuY29t'),
        stakeApi: `https://stake.${webUrl}/_api/graphql`,
        selectors: {
            tile: '[data-test="mines-tile"]',
            mines: '[data-test="mines-count"]',
            bet: '[data-testid="bet-button"]',
            cash: '[data-testid="cashout-button"]',
            balance: '[data-test="balance"]',
            betAmount: '[data-test="bet-amount"]',
            currency: '[data-test="currency-selector"]'
        },
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': document.cookie.match(/session=([^;]+)/)?.[1] || '',
            'Origin': `https://stake.${webUrl}`,
            'Referer': `https://stake.${webUrl}/casino/games/mines`
        },
        storage: {
            device: 'dvid',
            key: 'lkey',
            stats: 'game_stats'
        },
        timing: {
            retry: 500,
            click: 600,
            max: 3
        }
    });

    const styles = `
        .predictor-container {
            position: fixed;
            top: 24px;
            left: 24px;
            width: 310px;
            padding: 20px;
            background: rgba(13, 17, 23, 0.95);
            color: #e6edf3;
            border: 1px solid rgba(88, 166, 255, 0.1);
            border-radius: 12px;
            z-index: 10000;
        }
        .glow-text {
            text-align: center;
            font-family: 'Brush Script MT', cursive;
            color: #fff;
            font-weight: 600;
            letter-spacing: 0.5px;
            font-size: 20px;
            margin-bottom: 18px;
        }
        .login-input {
            width: 100%;
            padding: 10px 14px;
            margin-bottom: 14px;
            background: rgba(48, 54, 61, 0.6);
            border: 1px solid rgba(48, 54, 61, 0.4);
            color: #e6edf3;
            border-radius: 4px;
            font-size: 13px;
        }
        .control-button {
            width: 100%;
            padding: 12px;
            background: #ff4757;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }
        .control-button:before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.3) 50%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: rotate(45deg);
            animation: shine 3s infinite;
        }
        .control-button:hover {
            background: #ff6b81;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
        @keyframes shine {
            0% {
                left: -50%;
            }
            100% {
                left: 150%;
            }
        }
        .message {
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            text-align: center;
            font-size: 13px;
        }
        .error-message { background-color: rgba(248, 81, 73, 0.1); color: #f85149; }
        .success-message { background-color: rgba(46, 160, 67, 0.1); color: #3fb950; }
        #mines-table-container {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            z-index: 9999;
            font-family: sans-serif;
            font-size: 13px;
            width: 280px;
            max-height: 380px;
            overflow-y: auto;
        }
        #mines-table { width: 100%; border-collapse: collapse; }
        #mines-table th, #mines-table td {
            border: 1px solid #444;
            padding: 5px;
            text-align: center;
        }
        #stats-container {
            position: fixed;
            top: 24px;
            right: 24px;
            width: 240px;
            padding: 12px;
            background-color: rgba(17, 23, 31, 0.9);
            color: #e6edf3;
            border: 1px solid rgba(48, 54, 61, 0.3);
            border-radius: 4px;
            z-index: 10000;
            font-family: sans-serif;
        }
        .stats-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .stats-row:last-child {
            border-bottom: none;
        }
        .stat-label {
            font-size: 14px;
            color: #8b949e;
        }
        .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #58a6ff;
        }
        .positive { color: #3fb950 !important; }
        .negative { color: #f85149 !important; }
        .stat-value { font-family: 'Courier New', monospace; }
    `;
    class MinesPredictor {
        constructor() {
            this.config = getConfig();
            this.state = {
                active: false,
                history: new Map(),
                clicks: 8,
                stats: this.loadStats(),
                statsVisible: false,
                balance: 0,
                currency: 'ltc',
                lastProfit: 0,
                sessionStats: {
                    startBalance: 0,
                    currentBalance: 0,
                    profit: 0
                }
            };
            this.autoplayState = {
                isAutoPlaying: false,
                currentMines: 0,
                gamesPlayed: 0,
                clicksForCurrentGame: 0,
                isDoubled: false,
                waitingForWin: false,
                baseAmount: true,
                currentBetAmount: 0.50,
                successfulWins: 0
            };
            this.init();
        }

        loadStats() {
            const defaultStats = {
                totalGames: 0,
                wins: 0,
                losses: 0,
                totalClicks: 0,
                mineHits: 0,
                successRate: 0
            };
            try {
                return JSON.parse(localStorage.getItem(this.config.storage.stats)) || defaultStats;
            } catch {
                return defaultStats;
            }
        }

        saveStats() {
            localStorage.setItem(this.config.storage.stats, JSON.stringify(this.state.stats));
        }

        updateStats(isWin, clickCount, hitMine) {
            const stats = this.state.stats;
            stats.totalClicks = (stats.totalClicks || 0) + clickCount;

            if (isWin || hitMine) {
                if (isWin) {
                    stats.wins = (stats.wins || 0) + 1;
                } else {
                    stats.losses = (stats.losses || 0) + 1;
                    if (hitMine) {
                        stats.mineHits = (stats.mineHits || 0) + 1;
                    }
                }

                stats.totalGames = (stats.wins || 0) + (stats.losses || 0);
                stats.successRate = stats.totalGames > 0
                    ? ((stats.wins / stats.totalGames) * 100).toFixed(2)
                    : '0.00';
            }

            this.saveStats();
            this.updateStatsDisplay();
        }

        updateStatsDisplay() {
            if (!this.state.statsVisible) return;

            const statsContainer = document.getElementById('stats-display');
            if (!statsContainer) return;

            const stats = this.state.stats;
            const sessionStats = this.state.sessionStats;

            statsContainer.innerHTML = `
                <div class="stats-row">
                    <span class="stat-label">Session Profit:</span>
                    <span class="stat-value ${sessionStats.profit >= 0 ? 'positive' : 'negative'}">
                        ${sessionStats.profit.toFixed(8)} ${this.state.currency}
                    </span>
                </div>
                <div class="stats-row">
                    <span class="stat-label">Last Profit:</span>
                    <span class="stat-value ${this.state.lastProfit >= 0 ? 'positive' : 'negative'}">
                        ${this.state.lastProfit.toFixed(8)} ${this.state.currency}
                    </span>
                </div>
                <div class="stats-row">
                    <span class="stat-label">Wins/Losses:</span>
                    <span class="stat-value">${stats.wins}/${stats.losses}</span>
                </div>
                <div class="stats-row">
                    <span class="stat-label">Success Rate:</span>
                    <span class="stat-value">${stats.successRate}%</span>
                </div>
                <div class="stats-row">
                    <span class="stat-label">Mine Hits:</span>
                    <span class="stat-value">${stats.mineHits}</span>
                </div>
                <div class="stats-row">
                    <span class="stat-label">Total Clicks:</span>
                    <span class="stat-value">${stats.totalClicks}</span>
                </div>`;
        }

        getRandomMines() {
            const weights = [0.4, 0.3, 0.2, 0.1]; // Higher weights for lower mine counts
            const random = Math.random();
            let sum = 0;

            for (let i = 0; i < weights.length; i++) {
                sum += weights[i];
                if (random <= sum) {
                    return i + 1;
                }
            }
            return 1;
        }

        getRandomClicks(mines) {
            const clickRanges = {
                1: [8, 12],  // More aggressive for 1 mine
                2: [5, 7],   // Balanced for 2 mines
                3: [3, 4],   // Conservative for 3 mines
                4: [2, 3]    // Very conservative for 4 mines
            };

            const range = clickRanges[mines];
            return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        }

        async init() {
            this.addStyles();
            this.createUI();
            this.setupDrag();
            this.createStatsTable();
            this.setupKeyboardShortcuts();

            // Auto-fill and auto-login with saved key
            const savedKey = localStorage.getItem(this.config.storage.key);
            if (savedKey) {
                const keyInput = this.find('#activation-key');
                if (keyInput) {
                    keyInput.value = savedKey;
                    // Automatically trigger login if key exists
                    await this.login();
                }
            }
        }
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F2') {
                    this.toggleVisibility();
                }
            });
        }

        toggleVisibility() {
            const containers = ['#predictor', '#stats-container', '#mines-table-container'];
            containers.forEach(selector => {
                const element = this.find(selector);
                if (element) {
                    element.style.display = element.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        find(selector) {
            return document.querySelector(selector);
        }

        findAll(selector) {
            return [...document.querySelectorAll(selector)];
        }

        create(tag, attrs = {}, content = '') {
            const el = document.createElement(tag);
            Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
            if (content) el.innerHTML = content;
            return el;
        }

        storage(action, key, value) {
            try {
                if (action === 'get') return localStorage.getItem(key);
                if (action === 'set') localStorage.setItem(key, value);
            } catch (e) {
                console.warn('Storage error:', e);
            }
        }

        addStyles() {
            if (!this.find('#predictor-styles')) {
                const style = this.create('style', { id: 'predictor-styles' }, styles);
                document.head.appendChild(style);
            }
        }

        createUI() {
            const container = this.create('div', {
                class: 'predictor-container',
                id: 'predictor'
            }, `
                <h2 class="glow-text">${formatText.title('Soul Predictor - Arc')}</h2>
                <input type="password" id="activation-key" placeholder="Enter Activation Key" class="login-input">
                <button id="login-button" class="control-button">
                    <span class="button-text">Activate</span>
                </button>
                <div id="login-message"></div>
            `);

            const statsContainer = this.create('div', {
                id: 'stats-container',
                class: 'draggable',
                style: 'display: none;'
            }, '<h3 class="glow-text">Game Stats</h3><div id="stats-display"></div>');

            document.body.appendChild(container);
            document.body.appendChild(statsContainer);
            this.find('#login-button').onclick = () => this.login();
        }

        setupDrag() {
            const makeElementDraggable = (element) => {
                let pos = { x: 0, y: 0 };
                let isDragging = false;

                const handlers = {
                    start: (e) => {
                        isDragging = true;
                        pos = {
                            x: e.clientX - element.offsetLeft,
                            y: e.clientY - element.offsetTop
                        };
                    },
                    move: (e) => {
                        if (!isDragging) return;
                        element.style.left = (e.clientX - pos.x) + 'px';
                        element.style.top = (e.clientY - pos.y) + 'px';
                    },
                    end: () => isDragging = false
                };

                element.addEventListener('mousedown', handlers.start);
                document.addEventListener('mousemove', handlers.move);
                document.addEventListener('mouseup', handlers.end);
            };

            makeElementDraggable(this.find('#predictor'));
            makeElementDraggable(this.find('#stats-container'));
            makeElementDraggable(this.find('#mines-table-container'));
        }

        async login() {
            const key = this.find('#activation-key').value;
            const deviceId = this.getDeviceId();

            try {
                if (!window.location.href.includes(`stake.${webUrl}`)) {
                    this.showMessage(`Please navigate to Stake.${webUrl} mines game`, `error`);
                    return;
                }

                const response = await fetch(this.config.api + '/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Identifier': deviceId
                    },
                    body: JSON.stringify({
                        activation_key: key,
                        platform: 'stake'
                    })
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    this.storage('set', this.config.storage.key, key);
                    this.showMessage('Activation successful!', 'success');
                    this.initializePredictor();

                    setInterval(() => this.trackBalance(), 1000);
                } else {
                    throw new Error(data.error || 'Activation failed');
                }
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        }

        getDeviceId() {
            let id = this.storage('get', this.config.storage.device);
            if (!id) {
                id = 'dev_' + Math.random().toString(36).substr(2, 9);
                this.storage('set', this.config.storage.device, id);
            }
            return id;
        }

        showMessage(text, type) {
            const msg = this.find('#login-message');
            msg.className = `message ${type}-message`;
            msg.textContent = text;
        }

        initializePredictor() {
            this.find('#predictor').innerHTML = `
                <h2 class="glow-text">${formatText.title('Soul Predictor - Arc')}</h2>
                <button id="start-autoplay-button" class="control-button" style="font-weight: 700;">AUTOPLAY</button>
            `;

            this.updateStatsDisplay();
            this.find('#start-autoplay-button').onclick = () => this.toggleAutoplay();
        }

        createStatsTable() {
            const container = this.create('div', {
                id: 'mines-table-container'
            }, `
                <table id="mines-table">
                    <tr>
                        <th>Tile</th>
                        <th>Mines</th>
                        <th>Clicks</th>
                        <th>Points</th>
                    </tr>
                </table>
            `);
            document.body.appendChild(container);
        }

        updateTable() {
            const table = this.find('#mines-table');
            if (!table) return;

            let html = `
                <tr>
                    <th>Tile</th>
                    <th>Mines</th>
                    <th>Clicks</th>
                    <th>Points</th>
                </tr>
            `;

            this.state.history.forEach((data, index) => {
                html += `
                    <tr style="background-color: ${data.bombs > 0 ? '#FF0000' : '#008000'}">
                        <td>${index + 1}</td>
                        <td>${data.bombs}</td>
                        <td>${data.clicks}</td>
                        <td>${this.calculateWeight(data.bombs, data.clicks).toFixed(2)}</td>
                    </tr>
                `;
            });

            table.innerHTML = html;
        }

        toggleAutoplay() {
            const btn = this.find('#start-autoplay-button');

            if (this.autoplayState.isAutoPlaying) {
                this.autoplayState.isAutoPlaying = false;
                btn.textContent = 'AUTOPLAY';

                this.autoplayState.isDoubled = false;
                this.autoplayState.waitingForWin = false;
                this.autoplayState.baseAmount = true;
                this.autoplayState.currentBetAmount = 0.50;
                this.autoplayState.successfulWins = 0;
            } else {
                this.autoplayState.isAutoPlaying = true;
                this.autoplayState.currentMines = this.getRandomMines();
                btn.textContent = 'STOP AUTOPLAY';
                this.runAutoplaySequence();
            }
        }

        showStats() {
            const statsContainer = this.find('#stats-container');
            if (statsContainer) {
                statsContainer.style.display = 'block';
            }
            this.state.statsVisible = true;
        }

        hideStats() {
            const statsContainer = this.find('#stats-container');
            if (statsContainer) {
                statsContainer.style.display = 'none';
            }
            this.state.statsVisible = false;
        }

        resetStats() {
            this.state.stats = {
                totalGames: 0,
                wins: 0,
                losses: 0,
                totalClicks: 0,
                mineHits: 0,
                successRate: 0
            };
            this.saveStats();
            this.updateStatsDisplay();
        }

        async runAutoplaySequence() {
            let gamesWithCurrentMines = 0;
            const gamesBeforeChange = 2;

            while (this.autoplayState.isAutoPlaying) {
                try {
                    // Add error recovery delay
                    await this.delay(200);

                    // Check if game is ready
                    const betBtn = await this.waitForElement(this.config.selectors.bet, 10000);
                    if (!betBtn || betBtn.disabled) {
                        console.log('Waiting for game to be ready...');
                        await this.delay(1000);
                        continue;
                    }

                    if (gamesWithCurrentMines === gamesBeforeChange) {
                        this.autoplayState.currentMines = this.getRandomMines();
                        gamesWithCurrentMines = 0;

                        const minesInput = await this.waitForElement(this.config.selectors.mines);
                        if (minesInput) {
                            minesInput.value = this.autoplayState.currentMines;
                            minesInput.dispatchEvent(new Event('change', { bubbles: true }));
                            await this.delay(200);
                        }
                    }

                    this.autoplayState.clicksForCurrentGame = this.getRandomClicks(this.autoplayState.currentMines);
                    await this.playAutoplayGame();
                    gamesWithCurrentMines++;

                    // Add recovery check
                    if (!this.autoplayState.isAutoPlaying) {
                        console.log('Autoplay stopped by user');
                        break;
                    }
                } catch (error) {
                    console.warn('Autoplay sequence error:', error);
                    // Add error recovery delay
                    await this.delay(2000);

                    // Attempt to recover from error state
                    try {
                        const cashoutBtn = this.find(this.config.selectors.cash);
                        if (cashoutBtn && !cashoutBtn.disabled) {
                            await this.cashout();
                        }
                    } catch (e) {
                        console.warn('Recovery attempt failed:', e);
                    }

                    // Continue the loop if still in autoplay mode
                    if (this.autoplayState.isAutoPlaying) {
                        continue;
                    }
                }
            }
        }

        async playAutoplayGame() {
            try {
                const betBtn = await this.waitForElement(this.config.selectors.bet, 5000);
                if (!betBtn || betBtn.disabled) {
                    throw new Error('Bet button not ready');
                }

                await this.delay(200);
                betBtn.click();
                await this.delay(200);

                const tiles = await this.waitForElement(this.config.selectors.tile, 5000);
                if (!tiles) {
                    throw new Error('Tiles not found');
                }

                const tileElements = this.findAll(this.config.selectors.tile);
                if (tileElements.length > 0) {
                    await this.playAutoplayRound(tileElements);
                } else {
                    throw new Error('No tile elements found');
                }
            } catch (error) {
                console.warn('Game play error:', error);
                // Add recovery delay
                await this.delay(1000);
                throw error; // Propagate error for handling in runAutoplaySequence
            }
        }

        async playAutoplayRound(tiles) {
            this.initializeTiles(tiles);
            let clicks = 0;

            // Slower, more consistent delays
            const getRandomDelay = () => {
                const baseDelay = this.autoplayState.currentMines <= 2 ? 800 : 1200;
                return Math.floor(Math.random() * 400) + baseDelay;
            };

            while (clicks < this.autoplayState.clicksForCurrentGame && this.autoplayState.isAutoPlaying) {
                try {
                    const tile = await this.selectTile(tiles);
                    if (!tile) {
                        this.updateStats(false, clicks, false);
                        await this.delay(getRandomDelay());
                        return;
                    }

                    clicks++;
                    await this.delay(getRandomDelay());

                    const isMine = tile.className.includes('mine');
                    this.updateHistory(tile, isMine);

                    if (isMine) {
                        this.updateStats(false, clicks, true);
                        // Modified recovery strategy - more aggressive for low mine counts
                        if (this.autoplayState.currentMines <= 2) {
                            if (this.autoplayState.currentBetAmount <= 2.00 && !this.autoplayState.isDoubled) {
                                await this.delay(getRandomDelay());
                                await this.pressAmountDoubleButton();
                                this.autoplayState.isDoubled = true;
                                this.autoplayState.waitingForWin = true;
                                this.autoplayState.baseAmount = false;
                                this.autoplayState.currentBetAmount *= 2;
                            }
                        } else {
                            // More conservative recovery for higher mine counts
                            if (this.autoplayState.currentBetAmount <= 1.00 && !this.autoplayState.isDoubled) {
                                await this.delay(getRandomDelay());
                                await this.pressAmountDoubleButton();
                                this.autoplayState.isDoubled = true;
                                this.autoplayState.waitingForWin = true;
                                this.autoplayState.baseAmount = false;
                                this.autoplayState.currentBetAmount *= 2;
                            }
                        }
                        await this.delay(getRandomDelay());
                        return;
                    }

                    if (clicks === this.autoplayState.clicksForCurrentGame) {
                        this.updateStats(true, clicks, false);
                        await this.cashout();

                        if (this.autoplayState.currentBetAmount > 0.50) {
                            this.autoplayState.successfulWins++;

                            if (this.autoplayState.successfulWins >= 2) {
                                await this.delay(getRandomDelay());
                                await this.pressAmountHalveButton();
                                this.autoplayState.isDoubled = false;
                                this.autoplayState.waitingForWin = false;
                                this.autoplayState.baseAmount = true;
                                this.autoplayState.currentBetAmount = 0.50;
                                this.autoplayState.successfulWins = 0;
                            }
                        }
                        await this.delay(getRandomDelay());
                        return;
                    }
                } catch (error) {
                    console.warn('Round error:', error);
                    await this.delay(1000);
                    return;
                }
            }
        }

        async pressAmountDoubleButton() {
            const doubleButton = document.querySelector('[data-testid="amount-double"]');
            if (doubleButton) {
                doubleButton.click();
                await this.delay(500);
            }
        }

        async pressAmountHalveButton() {
            const halveButton = document.querySelector('[data-testid="amount-halve"]');
            if (halveButton) {
                halveButton.click();
                await this.delay(500);
            }
        }

        initializeTiles(tiles) {
            tiles.forEach((_, index) => {
                if (!this.state.history.has(index)) {
                    this.state.history.set(index, { bombs: 0, clicks: 0 });
                }
            });
        }

        calculateWeight(bombs, clicks) {
            // Improved tile selection weight calculation
            const bombPenalty = Math.pow(2, bombs);
            const clickPenalty = clicks * 0.5;
            return 1 / (1 + bombPenalty + clickPenalty);
        }

        async selectTile(tiles) {
            // Add randomization to tile selection
            if (Math.random() < 0.10) { // 15% chance of pure random selection
                const availableTiles = tiles.filter(t => !t.className.includes('revealed'));
                if (availableTiles.length > 0) {
                    const randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
                    randomTile.click();
                    return randomTile;
                }
            }

            // Original weighted selection logic
            const weights = [];
            this.state.history.forEach((data, index) => {
                weights.push({
                    index,
                    weight: this.calculateWeight(data.bombs, data.clicks)
                });
            });

            const totalWeight = weights.reduce((sum, tile) => sum + tile.weight, 0);
            const normalized = weights.map(tile => ({
                ...tile,
                weight: tile.weight / totalWeight
            }));

            const random = Math.random();
            let sum = 0;
            for (const tile of normalized) {
                sum += tile.weight;
                if (random <= sum) {
                    const selectedTile = tiles[tile.index];
                    if (selectedTile) {
                        selectedTile.click();
                        return selectedTile;
                    }
                }
            }
            return null;
        }

        updateHistory(tile, isMine) {
            const index = this.findAll(this.config.selectors.tile).indexOf(tile);
            if (this.state.history.has(index)) {
                const data = this.state.history.get(index);
                data.clicks++;
                if (isMine) data.bombs++;
                this.updateTable();
            }
        }

        async cashout() {
            const maxAttempts = 5;
            let attempts = 0;

            while (attempts < maxAttempts) {
                try {
                    const cashoutBtn = this.find(this.config.selectors.cash);
                    if (cashoutBtn && !cashoutBtn.disabled) {
                        await this.delay(100);
                        cashoutBtn.click();
                        await this.delay(150);

                        const betBtn = this.find(this.config.selectors.bet);
                        if (betBtn && !betBtn.disabled) {
                            await this.delay(150);
                            return true;
                        }
                    }

                    attempts++;
                    await this.delay(190);
                } catch (error) {
                    attempts++;
                    await this.delay(190);
                }
            }
            return false;
        }

        async waitForElement(selector, timeout = 5000) {
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                const element = this.find(selector);
                if (element) {
                    // Add small delay to ensure element is fully loaded
                    await this.delay(150);
                    return element;
                }
                await this.delay(150);
            }

            return null; // Return null instead of throwing error for better error handling
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, Math.max(ms, 100)));
        }

        async safeExecute(operation, fallback = null) {
            try {
                return await operation();
            } catch (error) {
                console.warn('Operation error:', error);
                return fallback;
            }
        }

        async trackBalance() {
            const balanceEl = this.find(this.config.selectors.balance);
            if (balanceEl) {
                const newBalance = parseFloat(balanceEl.textContent);
                if (this.state.balance !== newBalance) {
                    const profit = newBalance - this.state.balance;
                    this.state.lastProfit = profit;
                    this.state.balance = newBalance;
                    this.updateSessionStats();
                }
            }
        }

        updateSessionStats() {
            if (this.state.sessionStats.startBalance === 0) {
                this.state.sessionStats.startBalance = this.state.balance;
            }
            this.state.sessionStats.currentBalance = this.state.balance;
            this.state.sessionStats.profit = this.state.sessionStats.currentBalance - this.state.sessionStats.startBalance;
            this.updateStatsDisplay();
        }

        async validateStakeSession() {
            try {
                const sessionToken = document.cookie.match(/session=([^;]+)/)?.[1];
                if (!sessionToken) {
                    return false;
                }

                const response = await fetch(this.config.stakeApi, {
                    method: 'POST',
                    headers: {
                        ...this.config.headers,
                        'x-access-token': sessionToken,
                        'x-lockdown-token': document.cookie.match(/cf_clearance=([^;]+)/)?.[1] || ''
                    },
                    body: JSON.stringify({
                        query: `
                            query {
                                user {
                                    id
                                }
                            }
                        `
                    })
                });

                const data = await response.json();

                if (data?.data?.user?.id) {
                    return true;
                }

                const balanceElement = document.querySelector(this.config.selectors.balance);
                if (balanceElement) {
                    return true;
                }

                if (window.location.href.includes(`stake.${webUrl}/casino/games/mines`)) {
                    return true;
                }

                return false;
            } catch (error) {
                console.warn('Stake session validation error:', error);
                return document.querySelector(this.config.selectors.balance) !== null;
            }
        }
    }

    const initializeScript = () => {
        try {
            window._predictor = new MinesPredictor();
        } catch (error) {
            console.warn('Initialization error:', error);
            setTimeout(initializeScript, 5000);
        }
    };

    if (document.readyState === 'complete') {
        initializeScript();
    } else {
        window.addEventListener('load', initializeScript);
    }
})();