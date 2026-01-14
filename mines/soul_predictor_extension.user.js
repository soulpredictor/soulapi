// ==UserScript==
// @name         Soul Predictor Extension
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Smart middleware for Soul Predictor - Prevents Cloudflare blocks
// @author       Soul Predictor Team
// @match        https://stake.ac/*
// @match        https://*.stake.ac/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.soulpredictor.xyz
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const BACKEND_URL = 'https://api.soulpredictor.xyz';
    const CHECK_INTERVAL = 2000; // Check for game updates every 2 seconds
    
    let apiToken = GM_getValue('soul_api_token', '');
    let isConnected = false;
    let currentGameType = null; // 'mines' or 'crash'
    let checkInterval = null;

    // Inject CSS for the extension UI
    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        #soul-extension-ui {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 20px;
            z-index: 999999;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            color: #E2E8F0;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.02) inset;
        }
        
        #soul-extension-ui.minimized {
            width: 60px;
            height: 60px;
            padding: 0;
            overflow: hidden;
            cursor: pointer;
        }
        
        #soul-extension-ui .minimize-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #soul-extension-ui .minimize-btn:hover {
            background: rgba(139, 92, 246, 0.3);
            transform: scale(1.1);
        }
        
        #soul-extension-ui .ui-content {
            display: block;
        }
        
        #soul-extension-ui.minimized .ui-content {
            display: none;
        }
        
        #soul-extension-ui .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        
        #soul-extension-ui .logo h2 {
            margin: 0;
            font-size: 20px;
            color: #ffffff;
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        
        #soul-extension-ui .status {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            margin-bottom: 15px;
        }
        
        #soul-extension-ui .status-light {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #F56565;
            box-shadow: 0 0 8px rgba(245, 101, 101, 0.5);
        }
        
        #soul-extension-ui .status-light.connected {
            background: #8B5CF6;
            box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
        }
        
        #soul-extension-ui .status-light.connecting {
            background: #ECC94B;
            box-shadow: 0 0 8px rgba(236, 201, 75, 0.5);
            animation: pulse 1.5s infinite;
        }
        
        #soul-extension-ui .input-group {
            margin-bottom: 15px;
        }
        
        #soul-extension-ui .input-group label {
            display: block;
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        }
        
        #soul-extension-ui .input-group input {
            width: 100%;
            padding: 10px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            color: #ffffff;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
        }
        
        #soul-extension-ui .input-group input:focus {
            outline: none;
            border-color: rgba(139, 92, 246, 0.5);
            background: rgba(139, 92, 246, 0.05);
            box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.2);
        }
        
        #soul-extension-ui .btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-weight: 600;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        
        #soul-extension-ui .btn:hover {
            background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }
        
        #soul-extension-ui .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        #soul-extension-ui .btn.disconnect {
            background: linear-gradient(135deg, #F56565, #DC2626);
        }
        
        #soul-extension-ui .game-info {
            font-size: 12px;
            color: #6B7280;
            text-align: center;
            padding: 10px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            margin-top: 15px;
        }
        
        #soul-extension-ui .game-info strong {
            color: #8B5CF6;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
        }
        
        .soul-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 15px 20px;
            color: #E2E8F0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            z-index: 9999999;
            animation: slideIn 0.3s ease;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.02) inset;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `);

    // Create the extension UI
    function createUI() {
        const ui = document.createElement('div');
        ui.id = 'soul-extension-ui';
        ui.innerHTML = `
            <button class="minimize-btn" onclick="this.parentElement.classList.toggle('minimized')">−</button>
            <div class="ui-content">
                <div class="logo">
                    <h2>🎯 Soul Predictor</h2>
                </div>
                
                <div class="status">
                    <span id="soul-status-text">Disconnected</span>
                    <div class="status-light" id="soul-status-light"></div>
                </div>
                
                <div class="input-group">
                    <label>Stake API Token</label>
                    <input type="password" id="soul-api-token" placeholder="Enter your Stake API token" value="${apiToken}">
                </div>
                
                <button class="btn" id="soul-connect-btn">Connect</button>
                
                <div class="game-info" id="soul-game-info">
                    <div>Game: <strong id="soul-game-type">None</strong></div>
                    <div>Auto-Prediction: <strong id="soul-auto-status">Inactive</strong></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // Add event listeners
        document.getElementById('soul-connect-btn').addEventListener('click', handleConnect);
        document.getElementById('soul-api-token').addEventListener('input', function() {
            apiToken = this.value;
            GM_setValue('soul_api_token', apiToken);
        });
    }

    // Show notification
    function showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'soul-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Update UI status
    function updateStatus(text, status) {
        const statusText = document.getElementById('soul-status-text');
        const statusLight = document.getElementById('soul-status-light');
        
        if (statusText) statusText.textContent = text;
        if (statusLight) {
            statusLight.className = 'status-light';
            if (status === 'connected') {
                statusLight.classList.add('connected');
            } else if (status === 'connecting') {
                statusLight.classList.add('connecting');
            }
        }
    }

    // Handle connect/disconnect
    async function handleConnect() {
        const btn = document.getElementById('soul-connect-btn');
        const token = document.getElementById('soul-api-token').value.trim();
        
        if (!token) {
            showNotification('❌ Please enter your Stake API token first!');
            return;
        }
        
        if (isConnected) {
            // Disconnect
            isConnected = false;
            if (checkInterval) clearInterval(checkInterval);
            updateStatus('Disconnected', 'disconnected');
            btn.textContent = 'Connect';
            btn.classList.remove('disconnect');
            document.getElementById('soul-auto-status').textContent = 'Inactive';
            
            // Notify backend
            sendToBackend('/extension_disconnect', { token: apiToken });
            showNotification('✅ Disconnected from Soul Predictor');
        } else {
            // Connect
            updateStatus('Connecting...', 'connecting');
            btn.disabled = true;
            
            try {
                // Register with backend
                const response = await sendToBackend('/extension_connect', {
                    token: apiToken,
                    url: window.location.href
                });
                
                if (response.status === 'success') {
                    isConnected = true;
                    updateStatus('Connected', 'connected');
                    btn.textContent = 'Disconnect';
                    btn.classList.add('disconnect');
                    btn.disabled = false;
                    document.getElementById('soul-auto-status').textContent = 'Active';
                    
                    showNotification('✅ Connected to Soul Predictor!');
                    
                    // Start monitoring games
                    startGameMonitoring();
                } else {
                    throw new Error(response.message || 'Connection failed');
                }
            } catch (error) {
                console.error('Connection error:', error);
                updateStatus('Connection Failed', 'disconnected');
                btn.disabled = false;
                showNotification('❌ Connection failed: ' + error.message);
            }
        }
    }

    // Send data to backend
    function sendToBackend(endpoint, data) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: BACKEND_URL + endpoint,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(data),
                onload: function(response) {
                    try {
                        const result = JSON.parse(response.responseText);
                        resolve(result);
                    } catch (e) {
                        reject(new Error('Invalid response from server'));
                    }
                },
                onerror: function(error) {
                    reject(new Error('Backend connection failed'));
                },
                ontimeout: function() {
                    reject(new Error('Request timeout'));
                },
                timeout: 10000
            });
        });
    }

    // Detect current game type
    function detectGameType() {
        const url = window.location.href;
        if (url.includes('/games/mines')) {
            return 'mines';
        } else if (url.includes('/games/crash')) {
            return 'crash';
        }
        return null;
    }

    // Track last bet state
    let lastBetState = {
        is_active: false,
        bet_id: null,
        mines: null,
        bet_amount: null,
        is_fake_bet: false
    };
    
    // Track fake bet start time for stable bet ID generation
    let fakeBetStartTime = null;

    // Cache for username to avoid fetching too frequently
    let usernameCache = {
        data: null,
        timestamp: 0,
        cacheDuration: 60000  // 1 minute cache
    };
    
    // Fetch username from Stake API
    async function fetchUsername() {
        try {
            // Use cached data if recent
            const now = Date.now();
            if (usernameCache.data && (now - usernameCache.timestamp) < usernameCache.cacheDuration) {
                return usernameCache.data;
            }
            
            // Fetch user data from Stake API using proper GraphQL query
            const response = await fetch('https://stake.ac/_api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': apiToken,
                    'x-language': 'en'
                },
                body: JSON.stringify({
                    query: `query GetUser {
                        user {
                            name
                        }
                    }`,
                    operationName: 'GetUser'
                })
            });
            
            if (response.ok) {
                const jsonData = await response.json();
                if (jsonData.data && jsonData.data.user) {
                    const username = jsonData.data.user.name || '';
                    usernameCache.data = username;
                    usernameCache.timestamp = now;
                    return username;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching username:', error);
            return usernameCache.data;  // Return cached data if available
        }
    }
    
    // Fetch active mines bet data from Stake API
    async function fetchMinesBetData() {
        try {
            const response = await fetch('https://stake.ac/_api/casino/active-bet/mines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': apiToken,
                    'x-language': 'en'
                },
                body: JSON.stringify({})
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching mines bet data:', error);
            return null;
        }
    }
    
    // Check if testmines.js (fake bet script) is active
    function isFakeBetActive() {
        // Check for fake bet indicators
        const fakeInput = document.querySelector('#fake-bet-input');
        const betActiveClass = document.body.classList.contains('bet-active');
        const wrapperBetActive = document.querySelector('.input-button-wrap.svelte-dka04o')?.classList.contains('bet-active');
        
        // Check if testmines.js functions exist (indirect detection)
        const hasFakeInput = fakeInput !== null;
        const hasBetActive = betActiveClass || wrapperBetActive;
        
        return hasFakeInput && hasBetActive;
    }
    
    // Extract fake bet data from testmines.js
    function extractFakeBetData() {
        try {
            const fakeInput = document.querySelector('#fake-bet-input');
            const minesSelect = document.querySelector('select[data-testid="mines-count"]');
            const currencySelect = document.querySelector('select[name="currency"]');
            const betActiveClass = document.body.classList.contains('bet-active');
            const wrapperBetActive = document.querySelector('.input-button-wrap.svelte-dka04o')?.classList.contains('bet-active');
            
            // Check if fake bet is active
            const isActive = betActiveClass || wrapperBetActive;
            
            // Get mines count
            let minesCount = 3; // Default
            if (minesSelect) {
                minesCount = parseInt(minesSelect.value) || 3;
            } else {
                // Fallback: try other selectors
                const altSelect = document.querySelector('select[name="mines"], input[aria-label*="mines" i]');
                if (altSelect) {
                    minesCount = parseInt(altSelect.value) || 3;
                }
            }
            
            // Get bet amount
            let betAmount = 0;
            if (fakeInput) {
                betAmount = parseFloat(fakeInput.value) || 0;
            } else {
                // Fallback: try regular input
                const altInput = document.querySelector('input[name="amount"], input[aria-label*="amount" i]');
                if (altInput) {
                    betAmount = parseFloat(altInput.value) || 0;
                }
            }
            
            // Get currency
            let currency = '';
            if (currencySelect) {
                currency = currencySelect.value || '';
            }
            
            // Generate unique bet ID for fake bets when bet becomes active
            // Use a combination that changes when bet starts but stays stable during the bet
            let betId = null;
            if (isActive) {
                // Check if this is a new bet (mines count or bet amount changed, or bet just became active)
                const wasActive = lastBetState.is_active;
                const minesChanged = lastBetState.mines !== minesCount;
                const amountChanged = lastBetState.bet_amount !== betAmount;
                const isNewBet = !wasActive || minesChanged || amountChanged;
                
                if (isNewBet) {
                    // New bet started - generate new bet ID
                    fakeBetStartTime = Date.now();
                    betId = `fake_${minesCount}_${betAmount}_${fakeBetStartTime}`;
                } else {
                    // Same bet continues - use existing bet ID from lastBetState
                    betId = lastBetState.bet_id || `fake_${minesCount}_${betAmount}_${fakeBetStartTime || Date.now()}`;
                }
            } else {
                // Bet is not active - reset start time
                fakeBetStartTime = null;
            }
            
            return {
                is_fake_bet: true,
                is_active: isActive,
                bet_id: betId,
                bet_amount: betAmount,
                currency: currency,
                mines: minesCount
            };
        } catch (error) {
            console.error('Error extracting fake bet data:', error);
            return null;
        }
    }

    // Extract Mines game data - Fetch from Stake API or detect fake bets
    async function extractMinesData() {
        try {
            // First check if fake bet (testmines.js) is active
            const fakeBetData = extractFakeBetData();
            const isFakeBet = fakeBetData && fakeBetData.is_fake_bet;
            
            // Build game data object
            const gameData = {
                game_type: 'mines',
                token: apiToken,
                timestamp: Date.now(),
                is_fake_bet: isFakeBet || false
            };
            
            // If fake bet is detected, use fake bet data
            if (isFakeBet && fakeBetData) {
                gameData.is_active = fakeBetData.is_active;
                gameData.bet_id = fakeBetData.bet_id;
                gameData.bet_amount = fakeBetData.bet_amount;
                gameData.currency = fakeBetData.currency;
                gameData.mines = fakeBetData.mines;
                gameData.is_fake_bet = true;
                
                // Try to get username from Stake API (for display purposes)
                try {
                    const username = await fetchUsername();
                    if (username) {
                        gameData.username = username;
                    }
                } catch (e) {
                    console.log('Could not fetch username for fake bet');
                }
                
                console.log('🎮 Fake bet detected:', {
                    is_active: gameData.is_active,
                    bet_id: gameData.bet_id,
                    mines: gameData.mines,
                    bet_amount: gameData.bet_amount
                });
                
                return gameData;
            }
            
            // If fake input exists but bet is not active, still mark as fake bet but inactive
            const fakeInput = document.querySelector('#fake-bet-input');
            if (fakeInput && !isFakeBet) {
                // Fake bet script is loaded but bet is not active
                gameData.is_fake_bet = true;
                gameData.is_active = false;
                gameData.bet_id = null;
                
                // Still extract mines count for when bet becomes active
                const minesSelect = document.querySelector('select[data-testid="mines-count"]');
                if (minesSelect) {
                    gameData.mines = parseInt(minesSelect.value) || 3;
                }
            }
            
            // Otherwise, fetch real bet data from Stake API
            const betData = await fetchMinesBetData();
            
            // Process bet data from Stake API - structure: { user: { activeCasinoBet: {...} } }
            if (betData && betData.user) {
                const activeBet = betData.user.activeCasinoBet;
                
                if (activeBet && activeBet.active) {
                    // Active bet exists
                    gameData.is_active = true;
                    gameData.bet_id = activeBet.id;
                    gameData.bet_amount = activeBet.amount || 0;
                    gameData.currency = activeBet.currency || '';
                    gameData.mines = activeBet.state?.minesCount || 3;
                    gameData.username = activeBet.user?.name || betData.user.name || '';
                    
                    // Include full raw bet data
                    gameData.raw_bet_data = betData;
                } else {
                    // No active bet
                    gameData.is_active = false;
                    gameData.bet_id = null;
                    gameData.username = betData.user.name || '';
                    
                    // Try to extract mines count from UI (for when no active bet)
                    const minesSelect = document.querySelector('select[name="mines"], select[data-testid="mines-count"], input[aria-label*="mines" i]');
                    if (minesSelect) {
                        gameData.mines = parseInt(minesSelect.value) || 3;
                    } else {
                        gameData.mines = 3; // Default
                    }
                    
                    // Try to extract bet amount from UI
                    const betInput = document.querySelector('input[name="amount"], input[aria-label*="amount" i], #fake-bet-input');
                    if (betInput) {
                        gameData.bet_amount = betInput.value;
                    }
                    
                    // Try to extract currency from UI
                    const currencySelect = document.querySelector('select[name="currency"]');
                    if (currencySelect) {
                        gameData.currency = currencySelect.value;
                    }
                    
                    // Include raw data even if no active bet
                    gameData.raw_bet_data = betData;
                }
            } else {
                // No bet data at all - fallback to UI scraping
                gameData.is_active = false;
                gameData.bet_id = null;
                
                // Try to extract mines count from UI
                const minesSelect = document.querySelector('select[name="mines"], select[data-testid="mines-count"], input[aria-label*="mines" i]');
                if (minesSelect) {
                    gameData.mines = parseInt(minesSelect.value) || 3;
                } else {
                    gameData.mines = 3; // Default
                }
                
                // Try to extract bet amount from UI
                const betInput = document.querySelector('input[name="amount"], input[aria-label*="amount" i], #fake-bet-input');
                if (betInput) {
                    gameData.bet_amount = betInput.value;
                }
                
                // Try to extract currency from UI
                const currencySelect = document.querySelector('select[name="currency"]');
                if (currencySelect) {
                    gameData.currency = currencySelect.value;
                }
            }
            
            return gameData;
        } catch (error) {
            console.error('Error extracting mines data:', error);
            return null;
        }
    }

    // Cache for crash history to avoid fetching too frequently
    let crashHistoryCache = {
        data: null,
        timestamp: 0,
        cacheDuration: 5000  // 5 seconds cache
    };
    
    // Fetch crash history from Stake API
    async function fetchCrashHistory() {
        try {
            // Use cached data if recent
            const now = Date.now();
            if (crashHistoryCache.data && (now - crashHistoryCache.timestamp) < crashHistoryCache.cacheDuration) {
                return crashHistoryCache.data;
            }
            
            // GraphQL query for crash history
            const graphqlQuery = {
                query: `
                    query CrashGameListHistory($limit: Int, $offset: Int) {
                        crashGameList(limit: $limit, offset: $offset) {
                            id
                            startTime
                            crashpoint
                            hash {
                                id
                                hash
                                __typename
                            }
                            __typename
                        }
                    }
                `,
                operationName: "CrashGameListHistory",
                variables: {
                    limit: 25,
                    offset: 0
                }
            };
            
            // Fetch from Stake API using user's session
            const response = await fetch('https://stake.ac/_api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': apiToken,
                    'x-language': 'en'
                },
                body: JSON.stringify(graphqlQuery)
            });
            
            if (response.ok) {
                const jsonData = await response.json();
                if (jsonData.data && jsonData.data.crashGameList) {
                    // Extract crash points
                    const crashPoints = jsonData.data.crashGameList.map(game => parseFloat(game.crashpoint));
                    crashHistoryCache.data = crashPoints;
                    crashHistoryCache.timestamp = now;
                    return crashPoints;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching crash history:', error);
            return crashHistoryCache.data;  // Return cached data if available
        }
    }
    
    // Extract Crash game data
    async function extractCrashData() {
        try {
            const gameData = {
                game_type: 'crash',
                token: apiToken,
                timestamp: Date.now()
            };
            
            // Fetch username from Stake API
            const username = await fetchUsername();
            if (username) {
                gameData.username = username;
            }
            
            // Try to extract bet amount
            const betInput = document.querySelector('input[name="amount"], input[aria-label*="amount" i]');
            if (betInput) {
                gameData.bet_amount = betInput.value;
            }
            
            // Try to extract currency
            const currencySelect = document.querySelector('select[name="currency"]');
            if (currencySelect) {
                gameData.currency = currencySelect.value;
            }
            
            // Check if game is waiting/active
            const gameStatus = document.querySelector('[class*="status"], [class*="waiting"]');
            gameData.game_status = gameStatus ? gameStatus.textContent : 'unknown';
            
            // Fetch crash history and include it
            const crashHistory = await fetchCrashHistory();
            if (crashHistory && crashHistory.length > 0) {
                gameData.crash_history = crashHistory;
            }
            
            return gameData;
        } catch (error) {
            console.error('Error extracting crash data:', error);
            return null;
        }
    }

    // Monitor games and send data
    function startGameMonitoring() {
        if (checkInterval) clearInterval(checkInterval);
        
        checkInterval = setInterval(async () => {
            if (!isConnected) return;
            
            const gameType = detectGameType();
            if (!gameType) {
                document.getElementById('soul-game-type').textContent = 'None';
                return;
            }
            
            if (gameType !== currentGameType) {
                currentGameType = gameType;
                document.getElementById('soul-game-type').textContent = gameType.toUpperCase();
                showNotification(`🎮 Detected ${gameType.toUpperCase()} game`);
            }
            
            let gameData = null;
            if (gameType === 'mines') {
                gameData = await extractMinesData();  // Now async (fetches username)
            } else if (gameType === 'crash') {
                gameData = await extractCrashData();  // Now async
            }
            
            if (gameData) {
                // For mines - only send when bet state CHANGES
                if (gameType === 'mines') {
                    const currentState = {
                        is_active: gameData.is_active,
                        bet_id: gameData.bet_id,
                        mines: gameData.mines,
                        bet_amount: gameData.bet_amount,
                        is_fake_bet: gameData.is_fake_bet || false
                    };
                    
                    // Check if state changed
                    const stateChanged = 
                        currentState.is_active !== lastBetState.is_active ||
                        currentState.bet_id !== lastBetState.bet_id ||
                        (currentState.is_fake_bet && currentState.is_active && !lastBetState.is_active); // Fake bet becoming active
                    
                    if (!stateChanged) {
                        // State unchanged - don't send
                        return;
                    }
                    
                    // Update last state
                    lastBetState = currentState;
                    
                    // Log state change
                    if (currentState.is_active && currentState.bet_id) {
                        const betType = currentState.is_fake_bet ? '🎮 Fake' : '🎲 Real';
                        console.log(`${betType} bet started: ${currentState.bet_id} (Mines: ${currentState.mines})`);
                        showNotification(`${betType === '🎮 Fake' ? '🎮' : '🎲'} New bet detected!`);
                    } else if (!currentState.is_active) {
                        console.log('⏳ Bet ended, waiting for new bet');
                    }
                }
                
                try {
                    // Send game data to backend
                    console.log('📤 Sending game data to backend:', {
                        game_type: gameData.game_type,
                        is_active: gameData.is_active,
                        bet_id: gameData.bet_id,
                        mines: gameData.mines,
                        username: gameData.username ? 'present' : 'missing'
                    });
                    const response = await sendToBackend('/extension_game_data', gameData);
                    
                    if (response.status === 'success' && response.has_prediction) {
                        // Backend has generated prediction, frontend will receive it
                        console.log('✅ Prediction generated by backend');
                    } else {
                        console.log('ℹ️ Backend response:', response);
                    }
                } catch (error) {
                    console.error('Error sending game data:', error);
                }
            }
        }, CHECK_INTERVAL);
    }

    // Initialize extension
    function init() {
        // Wait for page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        // Create UI after a short delay to ensure Stake page is loaded
        setTimeout(() => {
            createUI();
            console.log('Soul Predictor Extension loaded');
            
            // Auto-connect if token is saved
            if (apiToken) {
                setTimeout(() => {
                    const connectBtn = document.getElementById('soul-connect-btn');
                    if (connectBtn) {
                        showNotification('🔄 Auto-connecting with saved token...');
                        connectBtn.click();
                    }
                }, 2000);
            }
        }, 1000);
    }

    // Start initialization
    init();
})();

