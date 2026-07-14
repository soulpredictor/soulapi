// ==UserScript==
// @name         Soul Predictor | Devs MAIN | 2Games
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Advanced mines game predictor with enhanced stats, consistent performance, and improved autoplay
// @author       You
// @match        https://stake.ac/*
// @grant        none
// ==/UserScript==

let webUrl = 'ac';

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
        api: atob('aHR0cHM6Ly9hcGkuc291bHByZWRpY3Rvci54eXo='),
        stakeApi: `https://stake.${webUrl}/_api/graphql`,
        selectors: {
            tile: '[data-testid^="game-tile-"]',
            mines: '[data-testid="mines-count"]',
            bet: '[data-testid="bet-button"]',
            cash: '[data-testid="cashout-button"]',
            balance: '[data-test="balance"]',
            betAmount: '[data-test="bet-amount"]',
            currency: '[data-test="currency-selector"]',
            // Blackjack-specific selectors
            blackjackDealerValue: '[data-testid="dealer"] .value',
            blackjackPlayerValue: '[data-testid="player"] .value',
            blackjackActionBtn: (action) => `[data-testid="action"][data-test-action="${action}"]`,
            blackjackGame: '[data-testid="game-blackjack"]',
            blackjackActions: '[data-testid="actions-insurance"]',
            blackjackInsurance: '[data-testid="actions-insurance"]',
            blackjackInsuranceAccept: '[data-testid="action"][data-test-action="insurance"]',
            blackjackInsuranceDecline: '[data-testid="action"][data-test-action="noInsurance"]'
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
            background: #8A2BE2;
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
            background: #9B30FF;
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
        .predictor-pop { animation: predictorPop 220ms cubic-bezier(0.2, 0.6, 0.2, 1) both; }
        @keyframes predictorPop {
            0% { transform: scale(1); }
            60% { transform: scale(1.08); }
            100% { transform: scale(1); }
        }
        .scanning-dot {
            position: absolute;
            width: 36px;
            height: 36px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10001;
            pointer-events: none;
        }
        .scanning-dot::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 36px;
            height: 36px;
            border: 2.5px solid #00ff00;
            border-radius: 50%;
            box-shadow: 0 0 8px #00ff00, 0 0 16px rgba(0, 255, 0, 0.6);
        }
        .scanning-dot::after {
            content: '+';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ff00;
            font-size: 28px;
            font-weight: 900;
            line-height: 1;
            text-shadow: 0 0 6px #00ff00, 0 0 10px rgba(0, 255, 0, 0.8);
            letter-spacing: -2px;
        }
        .scanning-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            min-width: 22px;
            height: 22px;
            background: #00ff00;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            font-size: 13px;
            font-weight: bold;
            color: #000;
            box-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
        }
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
                successfulWins: 0,
                doubledFromAmount: null
            };
            this.scanningState = {
                isActive: false,
                highlightInterval: null,
                currentGameTiles: new Set(),
                betObserverSetup: false
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
            // Uniform random between 1 and 6 inclusive
            return Math.floor(Math.random() * 6) + 1;
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

            // Auto-fill and auto-login with saved email
            const savedEmail = localStorage.getItem(this.config.storage.key);
            if (savedEmail) {
                const emailInput = this.find('#activation-key');
                if (emailInput) {
                    emailInput.value = savedEmail;
                    // Automatically trigger login if email exists
                    await this.login();
                }
            }
            
            // Start periodic plan check (like fakemines.js)
            this.startPlanCheck();
        }
        
        startPlanCheck() {
            // Check plan validity every 30 seconds
            setInterval(async () => {
                const savedEmail = localStorage.getItem(this.config.storage.key);
                if (!savedEmail) return;
                
                try {
                    const response = await fetch(this.config.api + '/user-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Device-ID': this.getDeviceId()
                        },
                        body: JSON.stringify({ email: savedEmail })
                    });
                    
                    const data = await response.json();
                    if (data.status === 'success' && data.user) {
                        const user = data.user;
                        const allowedPlans = ['silver', 'gold'];
                        const userPlan = (user.subscription_plan || 'free').toLowerCase();
                        const planActive = user.plan_active || false;
                        
                        // If plan is no longer valid, logout
                        if (!allowedPlans.includes(userPlan) || !planActive) {
                            this.logout('Plan access revoked or expired');
                        }
                    } else {
                        this.logout('Session invalid');
                    }
                } catch (error) {
                    console.error('Plan check error:', error);
                }
            }, 30000);
        }
        
        logout(reason = 'Logged out') {
            // Clear stored email
            localStorage.removeItem(this.config.storage.key);
            // Show login UI again
            this.find('#predictor').innerHTML = `
                <h2 class="glow-text">Soul Predictor</h2>
                <input type="email" id="activation-key" placeholder="Enter your SoulAI email" class="login-input">
                <button id="login-button" class="control-button">
                    <span class="button-text">Login</span>
                </button>
                <div id="login-message" class="error-message">${reason}. Please login again.</div>
            `;
            this.find('#login-button').onclick = () => this.login();
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
                <h2 class="glow-text">Soul Predictor</h2>
                <input type="email" id="activation-key" placeholder="Enter your SoulAI email" class="login-input">
                <button id="login-button" class="control-button">
                    <span class="button-text">Login</span>
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
            const email = this.find('#activation-key').value.trim();
            const deviceId = this.getDeviceId();

            try {
                if (!window.location.href.includes(`stake.${webUrl}`)) {
                    this.showMessage(`Please navigate to Stake.${webUrl} mines game`, `error`);
                    return;
                }

                if (!email) {
                    this.showMessage('Please enter your email', 'error');
                    return;
                }

                if (!email.includes('@')) {
                    this.showMessage('Enter a valid email address', 'error');
                    return;
                }

                // Check user plan access before allowing login
                const response = await fetch(this.config.api + '/user-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Device-ID': deviceId
                    },
                    body: JSON.stringify({
                        email: email
                    })
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    const user = data.user;
                    
                    // Check if user has Silver or Gold plan active
                    const allowedPlans = ['silver', 'gold'];
                    const userPlan = (user.subscription_plan || 'free').toLowerCase();
                    const planActive = user.plan_active || false;
                    
                    if (!allowedPlans.includes(userPlan)) {
                        this.showMessage(`Access denied. ${userPlan === 'free' ? 'Free plan not allowed' : 'Your plan does not have access'}. Required: Silver or Gold`, 'error');
                        return;
                    }
                    
                    if (!planActive) {
                        this.showMessage('Your plan has expired. Please renew to continue.', 'error');
                        return;
                    }
                    
                    // Store email and proceed
                    this.storage('set', this.config.storage.key, email);
                    this.showMessage(`Login successful! Plan: ${userPlan.toUpperCase()}`, 'success');
                    this.initializePredictor();

                    setInterval(() => this.trackBalance(), 1000);
                } else {
                    throw new Error(data.message || 'Login failed');
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
                <h2 class="glow-text">Soul Predictor</h2>
                <button id="start-autoplay-button" class="control-button" style="font-weight: 700;">AUTOPLAY MINES</button>
                <button id="scanning-mode-button" class="control-button" style="font-weight: 700; background:#00ff00; color:#000;">SCANNING MODE</button>
                <button id="start-blackjack-autoplay-button" class="control-button" style="font-weight: 700; background:#1f6feb;">AUTOPLAY BLACKJACK</button>
            `;

            this.updateStatsDisplay();
            this.find('#start-autoplay-button').onclick = () => this.toggleAutoplay();
            this.find('#scanning-mode-button').onclick = () => this.toggleScanningMode();
            this.find('#start-blackjack-autoplay-button').onclick = () => this.toggleBlackjackAutoplay();
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

        toggleScanningMode() {
            const btn = this.find('#scanning-mode-button');

            if (this.scanningState.isActive) {
                this.scanningState.isActive = false;
                btn.textContent = 'SCANNING MODE';
                btn.style.background = '#00ff00';
                btn.style.color = '#000';
                this.clearScanningHighlights();
                if (this.scanningState.highlightInterval) {
                    clearInterval(this.scanningState.highlightInterval);
                    this.scanningState.highlightInterval = null;
                }
                this.scanningState.betObserverSetup = false;
            } else {
                this.scanningState.isActive = true;
                btn.textContent = 'STOP SCANNING';
                btn.style.background = '#ff0000';
                btn.style.color = '#fff';
                this.startScanningMode();
            }
        }

        getScanningTileCount(mines) {
            const ranges = {
                1: [8, 12],
                2: [4, 6],
                3: [3, 5],
                4: [2, 4],
                5: [1, 3],
                6: [2, 3]
            };
            const range = ranges[mines] || [2, 4];
            return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        }

        clearScanningHighlights() {
            const dots = document.querySelectorAll('.scanning-dot');
            dots.forEach(dot => dot.remove());
            this.scanningState.currentGameTiles.clear();
        }

        async startScanningMode() {
            // Setup observer for bet button clicks and tile appearance
            this.setupBetObserver();

            // Check if tiles already exist (game in progress)
            setTimeout(() => this.checkAndUpdateHighlights(), 500);
        }

        setupBetObserver() {
            // Observe for bet button clicks
            const checkBetButton = () => {
                const betBtn = this.find(this.config.selectors.bet);
                if (betBtn && !this.scanningState.betObserverSetup) {
                    this.scanningState.betObserverSetup = true;
                    betBtn.addEventListener('click', () => {
                        if (this.scanningState.isActive) {
                            setTimeout(() => this.updateHighlightsOnNewBet(), 800);
                        }
                    });
                }
            };

            // Check immediately and also set up interval
            checkBetButton();
            setInterval(checkBetButton, 1000);
        }

        async checkAndUpdateHighlights() {
            if (!this.scanningState.isActive) return;

            const tiles = this.findAll(this.config.selectors.tile);
            if (tiles.length === 0) return;

            // Check if tiles are revealed (game in progress)
            const hasRevealedTiles = tiles.some(t => {
                const revealed = t.getAttribute('data-revealed') === 'true';
                const status = t.getAttribute('data-game-tile-status');
                return revealed || status === 'revealed';
            });

            // Only show highlights if game just started (tiles exist but none revealed yet)
            if (!hasRevealedTiles && tiles.length > 0) {
                const tileIds = new Set(tiles.map(t => t.getAttribute('data-testid') || tiles.indexOf(t)));
                const isNewGame = !this.scanningState.currentGameTiles.has(Array.from(tileIds)[0]);

                if (isNewGame) {
                    this.scanningState.currentGameTiles = tileIds;
                    await this.updateHighlightsOnNewBet();
                }
            }
        }

        async updateHighlightsOnNewBet() {
            if (!this.scanningState.isActive) return;

            this.clearScanningHighlights();

            const minesSelect = this.find(this.config.selectors.mines);
            if (!minesSelect) return;

            const minesCount = parseInt(minesSelect.value) || 1;
            const tiles = this.findAll(this.config.selectors.tile);

            if (tiles.length === 0) return;

            // Filter out revealed tiles
            const availableTiles = tiles.filter(t => {
                const revealed = t.getAttribute('data-revealed') === 'true';
                const status = t.getAttribute('data-game-tile-status');
                return !revealed && status !== 'revealed';
            });

            if (availableTiles.length === 0) return;

            const highlightCount = Math.min(this.getScanningTileCount(minesCount), availableTiles.length);
            const shuffled = [...availableTiles].sort(() => Math.random() - 0.5);
            const tilesToHighlight = shuffled.slice(0, highlightCount);

            tilesToHighlight.forEach((tile) => {
                // Make sure tile has position relative for absolute positioning
                const tileStyle = window.getComputedStyle(tile);
                if (tileStyle.position === 'static') {
                    tile.style.position = 'relative';
                }

                const dot = document.createElement('div');
                dot.className = 'scanning-dot';

                tile.appendChild(dot);
            });
        }

        // === Blackjack Autoplay ===
        toggleBlackjackAutoplay() {
            if (!this.blackjackState) {
                this.blackjackState = {
                    running: false,
                    isDoubled: false,
                    waitingForWin: false,
                    baseAmount: true,
                    currentBetAmount: 0.50,
                    successfulWins: 0,
                    doubledFromAmount: null
                };
            }
            const btn = this.find('#start-blackjack-autoplay-button');
            if (this.blackjackState.running) {
                this.blackjackState.running = false;
                if (btn) btn.textContent = 'AUTOPLAY BLACKJACK';
                this.showMessage('Blackjack autoplay stopped.', 'success');

                // Reset bet management state
                this.blackjackState.isDoubled = false;
                this.blackjackState.waitingForWin = false;
                this.blackjackState.baseAmount = true;
                this.blackjackState.currentBetAmount = 0.50;
                this.blackjackState.successfulWins = 0;
                this.blackjackState.doubledFromAmount = null;
                return;
            }
            this.blackjackState.running = true;
            if (btn) btn.textContent = 'STOP AUTOPLAY BLACKJACK';
            this.runBlackjackAutoplayLoop();
        }

        async runBlackjackAutoplayLoop() {
            // Basic-strategy style loop; no system can guarantee 100% wins.
            while (this.blackjackState && this.blackjackState.running) {
                try {
                    // Wait for bet availability
                    const betBtn = await this.waitForElement(this.config.selectors.bet, 10000);
                    if (!betBtn || betBtn.disabled) {
                        await this.delay(300);
                        continue;
                    }

                    console.log('Placing bet...');
                    // Place bet
                    betBtn.click();
                    await this.delay(1000);

                    // Wait for cards to be dealt and actions to appear
                    const gameReady = await this.waitForBlackjackGameReady();
                    if (!gameReady) {
                        console.log('Game not ready, continuing...');
                        await this.delay(1000);
                        continue;
                    }

                    console.log('Game ready, playing hand...');
                    // Play current hand according to parsed totals and action buttons availability
                    await this.playOneBlackjackHand();
                } catch (e) {
                    console.log('Blackjack loop error:', e);
                    await this.delay(800);
                }
            }
        }

        async waitForBlackjackGameReady() {
            const start = Date.now();
            while (Date.now() - start < 10000) {
                // Check if game container exists
                const gameContainer = this.find(this.config.selectors.blackjackGame);
                if (!gameContainer) {
                    await this.delay(200);
                    continue;
                }

                // Check for insurance first
                const insuranceContainer = this.find(this.config.selectors.blackjackInsurance);
                if (insuranceContainer) {
                    const insuranceText = insuranceContainer.textContent;
                    if (insuranceText && insuranceText.includes('Insurance')) {
                        console.log('Insurance offer detected, declining...');
                        await this.handleInsuranceOffer();
                        await this.delay(1000);
                        continue;
                    }
                }

                // Check if actions are available and enabled
                const actionsContainer = this.find(this.config.selectors.blackjackActions);
                if (actionsContainer) {
                    const actionButtons = actionsContainer.querySelectorAll('[data-testid="action"]');
                    // Check if at least one button is enabled using same logic as getBJActionButton
                    const enabledButtons = Array.from(actionButtons).filter(btn => {
                        const enabledAttr = btn.getAttribute('data-test-action-enabled');
                        const isDisabled = btn.disabled || btn.hasAttribute('disabled');

                        if (enabledAttr !== null) {
                            return enabledAttr === 'true';
                        } else {
                            return !isDisabled;
                        }
                    });
                    if (enabledButtons.length > 0) {
                        console.log('Enabled action buttons found:', enabledButtons.length);
                        return true;
                    }
                }

                // Check if cards are visible
                const dealerCards = this.findAll('[data-testid="dealer"] [data-testid^="card-"]');
                const playerCards = this.findAll('[data-testid="player"] [data-testid^="card-"]');

                if (dealerCards.length > 0 && playerCards.length > 0) {
                    console.log('Cards found - dealer:', dealerCards.length, 'player:', playerCards.length);
                    return true;
                }

                await this.delay(200);
            }
            return false;
        }

        async handleInsuranceOffer() {
            try {
                // Try to find decline button using same pattern as action buttons
                const actionsContainer = this.find(this.config.selectors.blackjackActions);
                let declineBtn = null;

                if (actionsContainer) {
                    declineBtn = actionsContainer.querySelector(this.config.selectors.blackjackInsuranceDecline);
                }

                if (!declineBtn) {
                    declineBtn = this.find(this.config.selectors.blackjackInsuranceDecline);
                }

                if (declineBtn) {
                    const enabledAttr = declineBtn.getAttribute('data-test-action-enabled');
                    const isDisabled = declineBtn.disabled || declineBtn.hasAttribute('disabled');

                    let isEnabled = false;
                    if (enabledAttr !== null) {
                        isEnabled = enabledAttr === 'true';
                    } else {
                        isEnabled = !isDisabled;
                    }

                    if (isEnabled) {
                        console.log('Declining insurance offer...');
                        await this.robustClick(declineBtn);
                        await this.delay(500);
                        return true;
                    }
                }
            } catch (e) {
                console.log('Error handling insurance:', e);
            }
            return false;
        }

        parseBJValue(text) {
            const num = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
            return Number.isFinite(num) ? num : null;
        }

        readBlackjackTotals() {
            // Try multiple selectors for dealer value
            let dealerEl = this.find('[data-testid="dealer"] .value');
            if (!dealerEl) {
                dealerEl = this.find('[data-testid="dealer"] [class*="value"]');
            }
            if (!dealerEl) {
                dealerEl = this.find('[data-testid="dealer"] div:last-child');
            }

            // Try multiple selectors for player value
            let playerEl = this.find('[data-testid="player"] .value');
            if (!playerEl) {
                playerEl = this.find('[data-testid="player"] [class*="value"]');
            }
            if (!playerEl) {
                playerEl = this.find('[data-testid="player"] div:last-child');
            }

            const dealer = dealerEl ? this.parseBJValue(dealerEl.textContent) : null;
            const player = playerEl ? this.parseBJValue(playerEl.textContent) : null;

            console.log('Reading totals - dealer:', dealer, 'player:', player);
            return { dealer, player };
        }

        readBlackjackCards() {
            // Try to read individual cards to detect soft hands and pairs
            const playerCards = this.findAll('[data-testid="player"] [data-testid^="card-"]');
            const dealerCards = this.findAll('[data-testid="dealer"] [data-testid^="card-"]');

            // Also try alternative selectors
            if (playerCards.length === 0) {
                const altCards = this.findAll('[data-testid="player"] .card, [data-testid="player"] img[alt*="card"], [data-testid="player"] [class*="card"]');
                if (altCards.length > 0) playerCards.push(...altCards);
            }
            if (dealerCards.length === 0) {
                const altCards = this.findAll('[data-testid="dealer"] .card, [data-testid="dealer"] img[alt*="card"], [data-testid="dealer"] [class*="card"]');
                if (altCards.length > 0) dealerCards.push(...altCards);
            }

            const parseCardValue = (cardEl) => {
                if (!cardEl) return null;
                const text = (cardEl.textContent || cardEl.getAttribute('aria-label') || cardEl.getAttribute('alt') || '').toUpperCase();
                const rank = text.match(/([A23456789JQK]|10)/)?.[1];
                if (!rank) return null;

                if (rank === 'A') return 11; // Ace as 11
                if (['J', 'Q', 'K'].includes(rank)) return 10;
                return parseInt(rank, 10);
            };

            const playerValues = playerCards.map(parseCardValue).filter(v => v !== null);
            const dealerValues = dealerCards.map(parseCardValue).filter(v => v !== null);

            const playerTotal = this.readBlackjackTotals().player;

            // Detect soft hand: has ace and total is between 12-21 (ace counted as 11)
            // If total is 11 or less with ace, it's definitely soft
            // If total is 12-21 with ace, check if it could be soft (ace as 11)
            const hasAce = playerValues.some(v => v === 11);
            let isSoft = false;
            if (hasAce && playerTotal !== null) {
                // If we have exactly 2 cards and one is ace, and total is 12-21, it's likely soft
                if (playerValues.length === 2 && playerTotal >= 12 && playerTotal <= 21) {
                    isSoft = true;
                } else if (playerTotal >= 12 && playerTotal <= 21 && playerValues.length <= 3) {
                    // Heuristic: if total is reasonable and we have ace, likely soft
                    isSoft = true;
                }
            }

            // Detect pair (exactly 2 cards with same value)
            // Normalize face cards (J/Q/K = 10) for pair detection
            const normalizeForPair = (val) => val === 11 ? 11 : (val === 10 ? 10 : val);
            const normalizedValues = playerValues.map(normalizeForPair);
            const isPair = normalizedValues.length === 2 && normalizedValues[0] === normalizedValues[1];
            const pairValue = isPair ? normalizedValues[0] : null;

            // Dealer up card (first visible card, or use total if only one card visible)
            let dealerUpCard = null;
            if (dealerValues.length > 0) {
                dealerUpCard = dealerValues[0];
            } else {
                // Fallback: if dealer has only one card visible, the total might be the up card
                const dealerTotal = this.readBlackjackTotals().dealer;
                if (dealerTotal !== null && dealerTotal >= 2 && dealerTotal <= 11) {
                    dealerUpCard = dealerTotal;
                }
            }

            return {
                playerCards: playerValues,
                dealerCards: dealerValues,
                dealerUpCard,
                isSoft,
                isPair,
                pairValue
            };
        }

        getStrategyReason(action, playerTotal, dealerUpCard, isSoft, isPair, pairValue) {
            if (isPair && action === 'split') {
                return `Split pair of ${pairValue}s`;
            }
            if (isSoft && action === 'double') {
                return `Double soft ${playerTotal}`;
            }
            if (isSoft && action === 'stand') {
                return `Stand on soft ${playerTotal}`;
            }
            if (isSoft && action === 'hit') {
                return `Hit soft ${playerTotal}`;
            }
            if (action === 'double') {
                return `Double ${playerTotal} vs dealer ${dealerUpCard}`;
            }
            if (action === 'stand') {
                return `Stand on ${playerTotal} vs dealer ${dealerUpCard}`;
            }
            if (action === 'hit') {
                return `Hit ${playerTotal} vs dealer ${dealerUpCard}`;
            }
            return `Basic strategy decision`;
        }

        getBasicStrategyAction(playerTotal, dealerUpCard, isSoft, isPair, pairValue, canHit, canStand, canDouble, canSplit) {
            // Comprehensive basic strategy tables

            // 1. Pairs (split strategy)
            if (isPair && canSplit && pairValue !== null) {
                const splitStrategy = {
                    11: true,  // Always split Aces
                    10: false, // Never split 10s (including J/Q/K)
                    9: dealerUpCard !== null && dealerUpCard >= 2 && dealerUpCard <= 9 && dealerUpCard !== 7, // Split 9s vs 2-6, 8-9
                    8: true,  // Always split 8s
                    7: dealerUpCard !== null && dealerUpCard >= 2 && dealerUpCard <= 7, // Split 7s vs 2-7
                    6: dealerUpCard !== null && dealerUpCard >= 3 && dealerUpCard <= 6, // Split 6s vs 3-6
                    5: false, // Never split 5s (treat as 10)
                    4: dealerUpCard !== null && dealerUpCard >= 5 && dealerUpCard <= 6, // Split 4s vs 5-6 only
                    3: dealerUpCard !== null && dealerUpCard >= 4 && dealerUpCard <= 7, // Split 3s vs 4-7
                    2: dealerUpCard !== null && dealerUpCard >= 4 && dealerUpCard <= 7  // Split 2s vs 4-7
                };

                const shouldSplit = splitStrategy[pairValue];
                if (shouldSplit === true) {
                    return 'split';
                }
            }

            // 2. Soft hands (Ace counted as 11)
            if (isSoft && playerTotal !== null) {
                // Soft totals strategy
                if (playerTotal >= 19) {
                    return canStand ? 'stand' : null;
                }
                if (playerTotal === 18) {
                    if (dealerUpCard !== null) {
                        if (dealerUpCard >= 9) {
                            return canHit ? 'hit' : (canStand ? 'stand' : null);
                        }
                        if (dealerUpCard >= 2 && dealerUpCard <= 8) {
                            if (canDouble && dealerUpCard >= 3 && dealerUpCard <= 6) {
                                return 'double';
                            }
                            return canStand ? 'stand' : null;
                        }
                    }
                    return canStand ? 'stand' : null;
                }
                if (playerTotal === 17) {
                    if (dealerUpCard !== null && dealerUpCard >= 3 && dealerUpCard <= 6 && canDouble) {
                        return 'double';
                    }
                    return canHit ? 'hit' : (canStand ? 'stand' : null);
                }
                if (playerTotal >= 13 && playerTotal <= 16) {
                    if (dealerUpCard !== null && dealerUpCard >= 4 && dealerUpCard <= 6 && canDouble) {
                        return 'double';
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal <= 12) {
                    if (dealerUpCard !== null && dealerUpCard >= 5 && dealerUpCard <= 6 && canDouble) {
                        return 'double';
                    }
                    return canHit ? 'hit' : null;
                }
            }

            // 3. Hard totals (no ace or ace counted as 1)
            if (playerTotal !== null && dealerUpCard !== null) {
                // Normalize dealer up card (Ace = 11, but treat as strong card)
                const dealerValue = dealerUpCard === 11 ? 11 : dealerUpCard;

                // Hard totals basic strategy
                if (playerTotal >= 17) {
                    return canStand ? 'stand' : null;
                }
                if (playerTotal === 16) {
                    if (dealerValue >= 2 && dealerValue <= 6) {
                        return canStand ? 'stand' : null;
                    }
                    // Surrender 16 vs 9, 10, A if available (not implemented, but hit as fallback)
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 15) {
                    if (dealerValue >= 2 && dealerValue <= 6) {
                        return canStand ? 'stand' : null;
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 14) {
                    if (dealerValue >= 2 && dealerValue <= 6) {
                        return canStand ? 'stand' : null;
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 13) {
                    if (dealerValue >= 2 && dealerValue <= 6) {
                        return canStand ? 'stand' : null;
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 12) {
                    if (dealerValue >= 4 && dealerValue <= 6) {
                        return canStand ? 'stand' : null;
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 11) {
                    // Always double 11 vs dealer 2-10 (including face cards)
                    if (dealerValue >= 2 && dealerValue <= 10 && canDouble) {
                        return 'double';
                    }
                    // Hit vs Ace
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 10) {
                    // Double 10 vs dealer 2-9
                    if (dealerValue >= 2 && dealerValue <= 9 && canDouble) {
                        return 'double';
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal === 9) {
                    // Double 9 vs dealer 3-6
                    if (dealerValue >= 3 && dealerValue <= 6 && canDouble) {
                        return 'double';
                    }
                    return canHit ? 'hit' : null;
                }
                if (playerTotal <= 8) {
                    // Always hit 8 or less (can't bust with one card)
                    return canHit ? 'hit' : null;
                }
            }

            // Fallback: if we have player total but no dealer up card
            if (playerTotal !== null) {
                if (playerTotal >= 17) {
                    return canStand ? 'stand' : null;
                }
                if (playerTotal >= 12 && playerTotal <= 16) {
                    // Conservative: stand on 12-16 if dealer total is low
                    const dealerTotal = this.readBlackjackTotals().dealer;
                    if (dealerTotal !== null && dealerTotal >= 2 && dealerTotal <= 6) {
                        return canStand ? 'stand' : null;
                    }
                    return canHit ? 'hit' : null;
                }
                return canHit ? 'hit' : null;
            }

            return null;
        }

        getBJActionButton(action) {
            // Primary selector: find button with data-testid="action" and data-test-action matching
            const actionsContainer = this.find(this.config.selectors.blackjackActions);

            if (actionsContainer) {
                // Primary selector: [data-testid="action"][data-test-action="${action}"]
                let btn = actionsContainer.querySelector(`[data-testid="action"][data-test-action="${action}"]`);

                // Fallback: try with action attribute
                if (!btn) {
                    btn = actionsContainer.querySelector(`[data-testid="action"][action="${action}"]`);
                }

                // Fallback: try button tag
                if (!btn) {
                    btn = actionsContainer.querySelector(`button[data-test-action="${action}"]`);
                }

                if (btn) {
                    // Check enabled state: prioritize data-test-action-enabled attribute
                    const enabledAttr = btn.getAttribute('data-test-action-enabled');
                    const isDisabled = btn.disabled || btn.hasAttribute('disabled');

                    // Button is enabled if: data-test-action-enabled="true" OR (attribute not set AND not disabled)
                    let isEnabled = false;
                    if (enabledAttr !== null) {
                        isEnabled = enabledAttr === 'true';
                    } else {
                        isEnabled = !isDisabled;
                    }

                    if (isEnabled) {
                        console.log(`Found enabled ${action} button (enabled=${enabledAttr}, disabled=${isDisabled})`);
                        return btn;
                    } else {
                        console.log(`${action} button found but disabled (enabled=${enabledAttr}, disabled=${isDisabled})`);
                    }
                }
            }

            // Fallback: search entire document
            let btn = this.find(`[data-testid="action"][data-test-action="${action}"]`);
            if (!btn) {
                btn = this.find(`button[data-test-action="${action}"]`);
            }

            if (btn) {
                const enabledAttr = btn.getAttribute('data-test-action-enabled');
                const isDisabled = btn.disabled || btn.hasAttribute('disabled');

                let isEnabled = false;
                if (enabledAttr !== null) {
                    isEnabled = enabledAttr === 'true';
                } else {
                    isEnabled = !isDisabled;
                }

                if (isEnabled) {
                    console.log(`Found enabled ${action} button (fallback, enabled=${enabledAttr})`);
                    return btn;
                }
            }

            console.log(`No enabled ${action} button found`);
            return null;
        }

        async playOneBlackjackHand() {
            let handResolved = false;
            let isWin = false;
            let isLoss = false;

            console.log('Starting blackjack hand play...');

            // Poll actions until hand resolves
            for (let i = 0; i < 60 && !handResolved; i++) {
                // Check for insurance during hand play
                const insuranceContainer = this.find(this.config.selectors.blackjackInsurance);
                if (insuranceContainer && insuranceContainer.textContent.includes('Insurance')) {
                    console.log('Insurance offer during hand, declining...');
                    await this.handleInsuranceOffer();
                    await this.delay(500);
                    continue;
                }

                const { dealer, player } = this.readBlackjackTotals();
                // Get button references once to avoid multiple queries
                const hitBtn = this.getBJActionButton('hit');
                const standBtn = this.getBJActionButton('stand');
                const doubleBtn = this.getBJActionButton('double');
                const splitBtn = this.getBJActionButton('split');

                const canHit = !!hitBtn;
                const canStand = !!standBtn;
                const canDouble = !!doubleBtn;
                const canSplit = !!splitBtn;

                console.log(`Hand ${i}: dealer=${dealer}, player=${player}, canHit=${canHit}, canStand=${canStand}, canDouble=${canDouble}`);

                // If neither action available, assume hand resolved
                if (!canHit && !canStand && !canDouble && !canSplit) {
                    console.log('No actions available, hand resolved');
                    await this.delay(400);

                    // Determine if hand was won or lost
                    const finalTotals = this.readBlackjackTotals();
                    if (finalTotals.player != null && finalTotals.dealer != null) {
                        if (finalTotals.player > 21) {
                            isLoss = true;
                            console.log('Player bust - LOSS');
                        } else if (finalTotals.dealer > 21) {
                            isWin = true;
                            console.log('Dealer bust - WIN');
                        } else if (finalTotals.player > finalTotals.dealer) {
                            isWin = true;
                            console.log('Player beats dealer - WIN');
                        } else if (finalTotals.player < finalTotals.dealer) {
                            isLoss = true;
                            console.log('Dealer beats player - LOSS');
                        } else {
                            console.log('Push/Tie');
                        }
                    }

                    handResolved = true;
                    break;
                }

                // Enhanced basic strategy with soft hands, pairs, and comprehensive decisions
                if (player != null) {
                    // Read card details for advanced strategy
                    const cardInfo = this.readBlackjackCards();
                    const dealerUpCard = cardInfo.dealerUpCard || dealer;

                    // Get optimal action from basic strategy
                    const actionToTake = this.getBasicStrategyAction(
                        player,
                        dealerUpCard,
                        cardInfo.isSoft,
                        cardInfo.isPair,
                        cardInfo.pairValue,
                        canHit,
                        canStand,
                        canDouble,
                        canSplit
                    );

                    if (actionToTake) {
                        const strategyReason = this.getStrategyReason(
                            actionToTake,
                            player,
                            dealerUpCard,
                            cardInfo.isSoft,
                            cardInfo.isPair,
                            cardInfo.pairValue
                        );
                        console.log(`Taking action: ${actionToTake.toUpperCase()} - ${strategyReason}`);
                        await this.clickBJActionButton(actionToTake, 5);
                    } else {
                        console.log('No optimal action available, waiting for hand resolution...');
                    }
                }

                await this.delay(800);
            }

            // Handle bet management after hand resolution
            if (handResolved) {
                console.log('Hand resolved, managing bets...');
                await this.handleBlackjackBetManagement(isWin, isLoss);
            }
        }

        async handleBlackjackBetManagement(isWin, isLoss) {
            if (isLoss) {
                // Reset win streak on loss
                this.blackjackState.successfulWins = 0;

                // Double bet after loss if not already doubled
                if (!this.blackjackState.isDoubled) {
                    this.blackjackState.doubledFromAmount = this.getDisplayedBetAmount() || this.blackjackState.currentBetAmount;
                    await this.waitForPreBetState();
                    await this.waitForAmountButtonsReady();

                    let doubled = await this.setBetAmountByFactor(2);
                    if (!doubled) {
                        doubled = await this.pressAmountDoubleButton();
                    }

                    if (doubled) {
                        this.blackjackState.isDoubled = true;
                        this.blackjackState.waitingForWin = true;
                        this.blackjackState.baseAmount = false;
                        this.blackjackState.currentBetAmount = this.blackjackState.currentBetAmount * 2;
                    }
                }
            } else if (isWin) {
                // Track consecutive wins and try to halve after two
                this.blackjackState.successfulWins++;

                if (this.blackjackState.successfulWins >= 2 && this.blackjackState.isDoubled) {
                    await this.waitForPreBetState(8000);
                    await this.waitForAmountButtonsReady(8000);

                    const target = this.blackjackState.doubledFromAmount || (this.blackjackState.currentBetAmount * 0.5);
                    let restored = await this.setBetAmountToValue(target);
                    if (!restored) {
                        restored = await this.pressAmountHalveButton();
                    }

                    if (restored) {
                        this.blackjackState.currentBetAmount = target;
                        this.blackjackState.isDoubled = false;
                        this.blackjackState.waitingForWin = false;
                        this.blackjackState.baseAmount = (Math.abs(target - 0.50) < 1e-8);
                        this.blackjackState.successfulWins = 0;
                        this.blackjackState.doubledFromAmount = null;
                    }
                }
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

                    // Always pick a new mines count before each game
                    this.autoplayState.currentMines = this.getRandomMines();
                    await this.setMinesCountSafely(this.autoplayState.currentMines);
                    await this.delay(200);

                    this.autoplayState.clicksForCurrentGame = this.getRandomClicks(this.autoplayState.currentMines);
                    await this.playAutoplayGame();

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

                // Update scanning highlights if active
                if (this.scanningState.isActive) {
                    setTimeout(() => this.updateHighlightsOnNewBet(), 500);
                }

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
                    // Run selection animation before clicking
                    await this.runTileSelectionAnimation(tile, tiles);

                    const isMine = await this.detectLossAfterClick(tile);
                    this.updateHistory(tile, isMine);

                    if (isMine) {
                        this.updateStats(false, clicks, true);
                        // reset win streak on loss
                        this.autoplayState.successfulWins = 0;
                        // Always attempt to double after a loss, once, with UI-ready wait
                        if (!this.autoplayState.isDoubled) {
                            // capture original amount before doubling
                            this.autoplayState.doubledFromAmount = this.getDisplayedBetAmount() || this.autoplayState.currentBetAmount;
                            await this.waitForPreBetState();
                            await this.waitForAmountButtonsReady();
                            // Force set amount first to avoid UI intercepts
                            let doubled = await this.setBetAmountByFactor(2);
                            if (!doubled) {
                                doubled = await this.pressAmountDoubleButton();
                            }
                            if (doubled) {
                                this.autoplayState.isDoubled = true;
                                this.autoplayState.waitingForWin = true;
                                this.autoplayState.baseAmount = false;
                                this.autoplayState.currentBetAmount = this.autoplayState.currentBetAmount * 2;
                            }
                        }
                        // Change mines after every bet (loss)
                        await this.changeMinesForNextRound();
                        await this.delay(getRandomDelay());
                        return;
                    }

                    if (clicks === this.autoplayState.clicksForCurrentGame) {
                        this.updateStats(true, clicks, false);
                        await this.cashout();

                        // Track consecutive wins and try to halve after two
                        this.autoplayState.successfulWins++;

                        if (this.autoplayState.successfulWins >= 2 && this.autoplayState.isDoubled) {
                            await this.waitForPreBetState(8000);
                            await this.waitForAmountButtonsReady(8000);
                            const target = this.autoplayState.doubledFromAmount || (this.autoplayState.currentBetAmount * 0.5);
                            let restored = await this.setBetAmountToValue(target);
                            if (!restored) {
                                // Fallback to 1/2
                                restored = await this.pressAmountHalveButton();
                            }
                            if (restored) {
                                this.autoplayState.currentBetAmount = target;
                                this.autoplayState.isDoubled = false;
                                this.autoplayState.waitingForWin = false;
                                this.autoplayState.baseAmount = (Math.abs(target - 0.50) < 1e-8);
                                this.autoplayState.successfulWins = 0;
                                this.autoplayState.doubledFromAmount = null;
                            }
                        }
                        // Change mines after every bet (win)
                        await this.changeMinesForNextRound();
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
            // Try same style as bet/cashout
            const clicked = await this.clickButtonWithRetries('[data-testid="amount-double"]', 6, 150);
            if (clicked) return true;
            // Fallback: prior approach
            const maxAttempts = 4;
            for (let i = 0; i < maxAttempts; i++) {
                const before = this.getDisplayedBetAmount();
                const btn = this.getClickableButton('[data-testid="amount-double"]');
                if (btn) {
                    await this.robustClick(btn);
                    await this.delay(300);
                    const after = this.getDisplayedBetAmount();
                    if (before && after && after >= before * 1.95) return true;
                }
                await this.delay(140);
            }
            // Final fallback: set amount directly
            return await this.setBetAmountByFactor(2);
        }

        async pressAmountHalveButton() {
            // Try same style as bet/cashout
            const clicked = await this.clickButtonWithRetries('[data-testid="amount-halve"]', 6, 150);
            if (clicked) return true;
            // Fallback: prior approach
            const maxAttempts = 4;
            for (let i = 0; i < maxAttempts; i++) {
                const before = this.getDisplayedBetAmount();
                const btn = this.getClickableButton('[data-testid="amount-halve"]');
                if (btn) {
                    await this.robustClick(btn);
                    await this.delay(300);
                    const after = this.getDisplayedBetAmount();
                    if (before && after && after <= before * 0.55) return true;
                }
                await this.delay(140);
            }
            // Final fallback: set amount directly
            return await this.setBetAmountByFactor(0.5);
        }

        async waitForPreBetState(timeout = 5000) {
            const start = Date.now();
            while (Date.now() - start < timeout) {
                const betBtn = this.find(this.config.selectors.bet);
                const cashBtn = this.find(this.config.selectors.cash);
                if (betBtn && !betBtn.disabled && (!cashBtn || cashBtn.disabled)) {
                    return true;
                }
                await this.delay(100);
            }
            return false;
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
            // Filter out revealed tiles
            const availableTiles = tiles.filter(t => {
                const revealed = t.getAttribute('data-revealed') === 'true';
                const status = t.getAttribute('data-game-tile-status');
                return !revealed && status !== 'revealed';
            });

            if (availableTiles.length === 0) {
                return null;
            }

            // Add randomization to tile selection
            if (Math.random() < 0.10) { // 10% chance of pure random selection
                const randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
                return randomTile;
            }

            // Original weighted selection logic
            const weights = [];
            availableTiles.forEach((tile, idx) => {
                const originalIndex = tiles.indexOf(tile);
                if (originalIndex !== -1 && this.state.history.has(originalIndex)) {
                    const data = this.state.history.get(originalIndex);
                    weights.push({
                        index: originalIndex,
                        weight: this.calculateWeight(data.bombs, data.clicks)
                    });
                } else {
                    // Default weight for tiles without history
                    weights.push({
                        index: originalIndex,
                        weight: 1.0
                    });
                }
            });

            if (weights.length === 0) {
                return availableTiles[0];
            }

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
                    if (selectedTile && availableTiles.includes(selectedTile)) {
                        return selectedTile;
                    }
                }
            }

            // Fallback to first available tile
            return availableTiles[0];
        }

        async runTileSelectionAnimation(targetTile, tiles) {
            try {
                const availableTiles = tiles;
                if (availableTiles.length === 0) {
                    targetTile.click();
                    await this.delay(120);
                    return;
                }

                // Random walk animation across tiles for a brief period, then stop on target
                const steps = Math.min(availableTiles.length * 2, 20);
                for (let i = 0; i < steps; i++) {
                    const currentIndex = Math.floor(Math.random() * availableTiles.length);
                    const tile = availableTiles[currentIndex];
                    if (!tile) break;
                    tile.classList.add('predictor-pop');
                    await this.delay(80 + Math.floor(Math.random() * 80));
                    tile.classList.remove('predictor-pop');
                }

                // Final highlight on target and click
                targetTile.classList.add('predictor-pop');
                await this.delay(180);
                targetTile.classList.remove('predictor-pop');
                targetTile.click();
                await this.delay(160);
            } catch {
                targetTile.click();
                await this.delay(120);
            }
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

                        // Clear scanning highlights on cashout
                        if (this.scanningState.isActive) {
                            this.clearScanningHighlights();
                        }

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

        async detectLossAfterClick(tile) {
            // Wait a moment for DOM to update
            await this.delay(220);
            try {
                // New DOM: button.tile.mine[data-revealed="true"] contains div.mine.revealed and an effect img
                if (tile.matches('.tile.mine[data-revealed="true"]')) return true;
                if (tile.querySelector('div.mine.revealed')) return true;
                if (tile.querySelector('img[alt="mine effect"]')) return true;

                // Secondary: generic revealed+mine-like indicators
                const revealed = tile.getAttribute('data-revealed') === 'true';
                const mineLike = tile.className.includes('mine')
                    || tile.querySelector('[data-testid*="mine"], .mine, [data-state*="mine"]');
                if (revealed && mineLike) return true;

                // Fallback: game state reset (cashout disabled/hidden, bet enabled)
                const cashBtn = this.find(this.config.selectors.cash);
                const betBtn = this.find(this.config.selectors.bet);
                const cashInactive = !cashBtn || cashBtn.disabled;
                const betReady = !!(betBtn && !betBtn.disabled);
                if (cashInactive && betReady) {
                    await this.delay(120);
                    const betReadyAgain = !!(this.find(this.config.selectors.bet) && !this.find(this.config.selectors.bet).disabled);
                    const cashStillInactive = (() => { const c = this.find(this.config.selectors.cash); return !c || c.disabled; })();
                    if (betReadyAgain && cashStillInactive) return true;
                }
            } catch {}
            return false;
        }

        async setMinesCountSafely(count) {
            try {
                const selectEl = await this.waitForElement(this.config.selectors.mines, 5000);
                if (!selectEl) return false;

                const start = Date.now();
                while (selectEl.disabled && Date.now() - start < 5000) {
                    await this.delay(100);
                }
                if (selectEl.disabled) return false;

                selectEl.value = String(count);
                selectEl.dispatchEvent(new Event('input', { bubbles: true }));
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                selectEl.blur();

                // Trigger scanning mode update if active
                if (this.scanningState.isActive) {
                    setTimeout(() => {
                        const tiles = this.findAll(this.config.selectors.tile);
                        if (tiles.length > 0) {
                            this.clearScanningHighlights();
                            const minesCount = parseInt(count) || 1;
                            const availableTiles = tiles.filter(t => {
                                const revealed = t.getAttribute('data-revealed') === 'true';
                                const status = t.getAttribute('data-game-tile-status');
                                return !revealed && status !== 'revealed';
                            });
                            if (availableTiles.length > 0) {
                                const highlightCount = Math.min(this.getScanningTileCount(minesCount), availableTiles.length);
                                const shuffled = [...availableTiles].sort(() => Math.random() - 0.5);
                                const tilesToHighlight = shuffled.slice(0, highlightCount);
                                tilesToHighlight.forEach(tile => {
                                    const rect = tile.getBoundingClientRect();
                                    const dot = document.createElement('div');
                                    dot.className = 'scanning-dot';
                                    dot.style.left = (rect.left + rect.width / 2 - 6) + 'px';
                                    dot.style.top = (rect.top + rect.height / 2 - 6) + 'px';
                                    document.body.appendChild(dot);
                                });
                            }
                        }
                    }, 300);
                }

                return true;
            } catch {
                return false;
            }
        }

        async changeMinesForNextRound() {
            this.autoplayState.currentMines = this.getRandomMines();
            await this.setMinesCountSafely(this.autoplayState.currentMines);
        }

        getDisplayedBetAmount() {
            try {
                // Prefer the visible amount input value
                const activeInput = this.getBetInputElement();
                const candidates = [
                    activeInput,
                    this.find(this.config.selectors.betAmount),
                    this.find('[data-testid="bet-amount"]'),
                    this.find('[data-test="bet-amount"]')
                ].filter(Boolean);
                for (const el of candidates) {
                    let text = '';
                    if ('value' in el && el.value !== undefined) text = el.value;
                    else text = el.textContent || '';
                    const num = parseFloat((text || '').replace(/[^0-9.]/g, ''));
                    if (!isNaN(num)) return num;
                }
            } catch {}
            return null;
        }

        async setBetAmountByFactor(factor) {
            try {
                const before = this.getDisplayedBetAmount();
                if (!before) return false;
                const next = Number((before * factor).toFixed(8));
                const inputs = this.getAllBetInputs();
                for (const input of inputs) {
                    input.focus();
                    input.value = String(next);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    await this.delay(120);
                    const after = this.getDisplayedBetAmount();
                    if (after && Math.abs(after - next) < 1e-6) return true;
                }
                return false;
            } catch {
                return false;
            }
        }

        async setBetAmountToValue(value) {
            try {
                const next = Number(value);
                if (!isFinite(next)) return false;
                const inputs = this.getAllBetInputs();
                for (const input of inputs) {
                    input.focus();
                    input.value = String(next);
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    await this.delay(120);
                    const after = this.getDisplayedBetAmount();
                    if (after && Math.abs(after - next) < 1e-6) return true;
                }
                return false;
            } catch {
                return false;
            }
        }

        getBetInputElement() {
            const inputs = this.getAllBetInputs();
            return inputs[0] || null;
        }

        getAllBetInputs() {
            const nodes = Array.from(document.querySelectorAll('[data-testid="input-game-amount"], [data-testid="amount-input"], input[name="amount"], input[type="number"], input[inputmode="decimal"]'));
            // Return visible and interactive inputs first, then the rest
            const visible = nodes.filter(n => this.isElementInteractive(n));
            const hidden = nodes.filter(n => !this.isElementInteractive(n));
            return [...visible, ...hidden];
        }

        isElementInteractive(el) {
            try {
                const style = window.getComputedStyle(el);
                const visible = el.getClientRects().length > 0 && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0.01;
                const clickable = style.pointerEvents !== 'none' && !el.disabled;
                // Also ensure none of ancestor wrappers disable pointer events
                let parent = el.parentElement;
                while (parent) {
                    const ps = window.getComputedStyle(parent);
                    if (ps.pointerEvents === 'none' || ps.visibility === 'hidden' || parseFloat(ps.opacity || '1') === 0) {
                        return false;
                    }
                    parent = parent.parentElement;
                }
                return visible && clickable;
            } catch {
                return false;
            }
        }

        async waitForAmountButtonsReady(timeout = 5000) {
            const start = Date.now();
            while (Date.now() - start < timeout) {
                const dbl = this.getClickableButton('[data-testid="amount-double"]');
                const hlv = this.getClickableButton('[data-testid="amount-halve"]');
                if (dbl && hlv) {
                    return true;
                }
                await this.delay(120);
            }
            return false;
        }

        async clickButtonWithRetries(selector, maxAttempts = 5, delayMs = 150) {
            let attempts = 0;
            while (attempts < maxAttempts) {
                try {
                    const btn = this.find(selector);
                    if (btn && !btn.disabled) {
                        await this.delay(100);
                        btn.click();
                        await this.delay(delayMs);
                        return true;
                    }
                    attempts++;
                    await this.delay(delayMs);
                } catch (e) {
                    attempts++;
                    await this.delay(delayMs);
                }
            }
            return false;
        }

        async clickBJActionButton(action, maxAttempts = 5) {
            // Use getBJActionButton to find enabled button
            let attempts = 0;
            while (attempts < maxAttempts) {
                try {
                    const btn = this.getBJActionButton(action);

                    if (btn) {
                        // Scroll, focus, and click
                        try {
                            btn.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
                        } catch {}
                        btn.focus();
                        await this.delay(100);

                        // Try multiple click methods for robustness
                        btn.click();
                        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

                        console.log(`${action.toUpperCase()} button clicked successfully (attempt ${attempts + 1})`);
                        await this.delay(200);
                        return true;
                    }

                    attempts++;
                    await this.delay(150);
                } catch (e) {
                    console.error(`Error clicking ${action} button (attempt ${attempts + 1}):`, e);
                    attempts++;
                    await this.delay(150);
                }
            }
            console.log(`Failed to click ${action.toUpperCase()} button after ${maxAttempts} attempts`);
            return false;
        }

        getClickableButton(selector) {
            const els = Array.from(document.querySelectorAll(selector));
            for (const el of els) {
                const disabledAttr = el.getAttribute('aria-disabled');
                const isDisabled = el.disabled || disabledAttr === 'true';
                const isVisible = !!(el.offsetParent || el.getClientRects().length);
                if (!isDisabled && isVisible) return el;
            }
            return null;
        }

        async robustClick(el) {
            try {
                el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
            } catch {}
            el.focus();
            const opts = { bubbles: true, cancelable: true, view: window };
            el.dispatchEvent(new PointerEvent('pointerdown', opts));
            el.dispatchEvent(new MouseEvent('mousedown', opts));
            el.dispatchEvent(new MouseEvent('click', opts));
            el.dispatchEvent(new MouseEvent('mouseup', opts));
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