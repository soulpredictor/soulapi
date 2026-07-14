document.addEventListener('DOMContentLoaded', function() {
    const minesContent = document.getElementById('mines-content');
    const molesContent = document.getElementById('moles-content');
    if (!minesContent) {
        return;
    }

    // Get all required elements
    const predictButton = document.querySelector('button.svelte-h4ldgr');
    const buttonContent = predictButton ? predictButton.querySelector('.content') : null;
    const stakeTokenInput = document.querySelector('input[id="stake_token"]');
    const betAmountInput = document.querySelector('input[id="bet"]');
    
    const MODEL_NAME = 'Codex 5.3';
    const minesSelect = document.querySelector('select[id="mines"]');
    // Currency + username are no longer used in UI (Model is fixed text)
    const currencySelect = document.getElementById('currency');
    const tiles = document.querySelectorAll('.tile');
    const gameContent = document.querySelector('.game-content');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const loadingMessage = document.querySelector('.loading-message');
    const gameStatusText = document.getElementById('game-status-text');
    const statusLight = document.getElementById('status-light');
    
    // Function to show loading state
    function showLoading(message = 'Analyzing game patterns...') {
        // User requested: no full-screen prediction/loading animation.
        if (predictButton) predictButton.disabled = true;
        if (buttonContent) buttonContent.textContent = 'Predicting...';
    }

    // Function to hide loading state
    function hideLoading() {
        // User requested: no full-screen prediction/loading animation.
        if (isConnected) {
            updateGameStatus('Connected', isGameActive ? 'active' : 'connected');
            // Reset grid if not in an active game to ensure no leftover gems are shown
            if (!isGameActive) {
                resetGrid();
            }
        } else {
            updateGameStatus('Not connected', 'inactive');
            resetGrid(); // Ensure grid is empty when disconnected
        }
    }
    
    // Disable all interactive elements by default until connection is established
    if (betAmountInput) {
        betAmountInput.disabled = true;
        betAmountInput.placeholder = MODEL_NAME;
        betAmountInput.value = MODEL_NAME;
    }
    if (minesSelect) {
        minesSelect.disabled = true;
    }
    if (currencySelect) {
        // currency select removed from UI; keep safe no-op
        currencySelect.disabled = true;
    }
    
    // Stake.ac API configuration
    const stakeApiConfig = {
        apiUrl: 'https://stake.ac/_api/graphql',
        minesGameUrl: 'https://stake.ac/casino/games/mines',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json',
            'Origin': 'https://stake.ac',
            'Referer': 'https://stake.ac/casino/games/mines'
        }
    };
    
    // Mobile user agents for cloudscraper (similar to stake.py)
    const mobileUserAgents = [
        'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ];
    
    let isConnected = false;
    let lastApiReachable = false;
    let stakeSession = null;
    let activeGameData = null;
    let isGameActive = false;
    // Mines grid must only update from API (extension -> /get_prediction).
    // Disable legacy auto-countdown + direct prediction flow.
    let lastPredictedBetId = null;
    let isPredicting = false;
    let autoPredictCountdown = null;
    let waitingForNewBet = false;

    let betsCount = 0;
    const betsCounter = document.getElementById('betsCounter');

    // Disable predict button by default
    predictButton.disabled = true;
    predictButton.style.opacity = '0.5';
    predictButton.style.cursor = 'not-allowed';

    const loadingMessages = [
        "Initializing Prediction",
        "Connecting to userApi",
        "Analyzing patterns",
        "Fetching probabilities",
        "Generating prediction"
    ];

    let currentMessageIndex = 0;
    let loadingMessageInterval;
    let countdownInterval = null;
    let isCountdownActive = false;

    function startButtonCooldown() {
        isCountdownActive = false;
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (isConnected) {
            updateGameStatus('Connected', isGameActive ? 'active' : 'connected');
        } else {
            updateGameStatus('Not connected', 'inactive');
        }
    }

    function startLoading() {
        if (predictButton) {
            predictButton.disabled = true;
            predictButton.style.opacity = '0.5';
            predictButton.style.cursor = 'not-allowed';
        }
        // User requested: no full-screen prediction/loading animation.
    }

    function stopLoading() {
        if (loadingMessageInterval) {
            clearInterval(loadingMessageInterval);
            loadingMessageInterval = null;
        }
    }

    // Function to validate the Stake API token
async function validateStakeToken(token) {
    if (!token || token.trim() === '') {
        showError('Stake API token is required');
        updateGameStatus('Not connected', 'inactive');
        return false;
    }
    
    // Update status to connecting and show loading spinner
    updateGameStatus('Connecting...', 'connecting');
    showLoadingSpinner(true);
    
    try {
        // Real connection check (same as main.py): verify extension is connected with this token
        const checkResponse = await fetch('https://api.soulpredictor.xyz/check_extension', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });

        const checkData = await checkResponse.json().catch(() => ({}));

        if (!checkResponse.ok) {
            throw new Error('Backend connection failed');
        }

        if (!checkData || checkData.connected !== true) {
            showLoadingSpinner(false);
            isConnected = false;
            updateGameStatus('Connection failed', 'inactive');
            showError('Connection failed: extension is not connected with this API token.');
            return false;
        }

        clearError();
        isConnected = true;

        // Model field is fixed
        if (betAmountInput) betAmountInput.value = MODEL_NAME;

        // Optional: fetch stake game data for active bet / mines count (also updates username if available)
        await fetchStakeGameData(token);

        showLoadingSpinner(false);
        updateGameStatus('Connected', 'connected');
        return true;
    } catch (error) {
        console.error('Stake API connection error:', error);
        showError('Connection error: could not verify extension connection.');
        updateGameStatus('Not connected', 'inactive');
        showLoadingSpinner(false);
        return false;
    }
}
    
    // Function to fetch active game data from Stake.ac
    async function fetchStakeGameData(token) {
        if (!token || token.trim() === '') {
            return null;
        }
        
        try {
            // Use our proxy server to fetch game data from Stake.ac API
            const response = await fetch('https://api.soulpredictor.xyz/stake_game_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ access_token: token })
            });
            
            const data = await response.json();

            // If we got any 2xx response, treat the API as reachable.
            // data.status === 'success' means we have game_data, otherwise treat as connected but no active bet.
            if (response.ok) {
                lastApiReachable = true;
                // Update active game data (new structure from extension/backend)
                activeGameData = data && data.status === 'success' ? data.game_data : null;

                // Check if there's an active bet (new structure: game_data.is_active and game_data.id)
                if (activeGameData && activeGameData.is_active && activeGameData.id) {
                    isGameActive = true;

                    // Model field is fixed
                    if (betAmountInput) betAmountInput.value = MODEL_NAME;

                    // Currency removed from UI

                    // Update mines count
                    if (activeGameData.mines && minesSelect) {
                        minesSelect.value = activeGameData.mines;
                    }

                // Connected and have an active bet
                isConnected = true;
                updateGameStatus('Prediction ready', 'active');
                return activeGameData;
            } else {
                // No active bet found but API responded successfully -> connected
                isGameActive = false;
                isConnected = true;

                // Model field is fixed
                if (betAmountInput) betAmountInput.value = MODEL_NAME;

                    // Reflect connection (no active bet)
                    updateGameStatus('Connected', 'connected');
                }

                return activeGameData;
            } else {
                lastApiReachable = false;
                // Non-2xx response: treat as disconnected
                showError(data?.error || 'Failed to fetch game data');
                updateGameStatus('Not connected', 'inactive');
                return null;
            }
        } catch (error) {
            lastApiReachable = false;
            console.error('Game data fetch error:', error);
            showError('Failed to fetch game data from Stake.ac');
            updateGameStatus('Not connected', 'inactive');
            return null;
        }
    }
    
    // Legacy auto-prediction countdown (disabled)
    function startAutoPredictionCountdown() {
        return;
        if (autoPredictCountdown) {
            clearInterval(autoPredictCountdown);
        }
        
        let countdownSeconds = 3; // 3 seconds countdown for auto-prediction
        
        // Disabled (extension-only predictions)
        
        // Always disable the button during auto-prediction
        if (predictButton) {
            predictButton.disabled = false;
            predictButton.style.opacity = '1';
            predictButton.style.cursor = 'pointer';
        }
        
        autoPredictCountdown = setInterval(() => {
            countdownSeconds--;
            
            if (countdownSeconds > 0) {
                // Disabled (extension-only predictions)
            } else {
                // Clear the interval when countdown reaches zero
                clearInterval(autoPredictCountdown);
                autoPredictCountdown = null;
                
                // Trigger prediction automatically
                if (form && isGameActive && activeGameData) {
                    // Check for new bet using new structure (gameData.is_active and gameData.id)
                    const currentBetId = activeGameData.id || (activeGameData.user?.activeCasinoBet?.id);
                    
                    if (!lastPredictedBetId || currentBetId !== lastPredictedBetId) {
                        // Store the current bet ID to prevent repeated predictions
                        lastPredictedBetId = currentBetId;
                        
                        // Disabled: do not run local prediction flow
                        // form.dispatchEvent(new Event('submit'));
                        
                        // Set the waiting flag to true after prediction
                        waitingForNewBet = true;
                    }
                }
            }
        }, 1000);
    }

    function updateGameStatus(message, status) {
        // status: 'inactive' (no connection), 'connecting', 'connected' (connected but no active bet), 'active' (has active bet)
        if (gameStatusText) {
            if (status === 'inactive') {
                gameStatusText.textContent = 'Not connected';
            } else if (status === 'connecting') {
                gameStatusText.textContent = 'Connecting';
            } else if (status === 'connected') {
                gameStatusText.textContent = 'Connected';
            } else if (status === 'active') {
                // Keep simple label but can indicate active
                gameStatusText.textContent = 'Connected';
            }
        }

        if (statusLight) {
            // Normalize class name to one of the supported states so CSS picks correct color
            const lightClass = status === 'active' ? 'active' : (status === 'connecting' ? 'connecting' : (status === 'connected' ? 'active' : 'inactive'));
            statusLight.className = 'status-light ' + lightClass;
        }

        // Update button content based on connection and bet status
        if (predictButton && buttonContent) {
            if (isPredicting) return;

            predictButton.classList.remove('connecting');

            if (status === 'inactive') {
                isConnected = false;
                const stakeToken = stakeTokenInput?.value?.trim() || '';
                const hasToken = stakeToken !== '';
                buttonContent.textContent = 'Connect';
                predictButton.disabled = !hasToken;
                predictButton.style.opacity = hasToken ? '1' : '0.5';
                predictButton.style.cursor = hasToken ? 'pointer' : 'not-allowed';
                waitingForNewBet = false;
            } else if (status === 'connecting') {
                buttonContent.textContent = 'Connecting...';
                predictButton.disabled = true;
                predictButton.style.opacity = '0.5';
                predictButton.style.cursor = 'not-allowed';
                predictButton.classList.add('connecting');
            } else if (status === 'connected') {
                isConnected = true;
                buttonContent.textContent = 'Disconnect';
                predictButton.disabled = false;
                predictButton.style.opacity = '1';
                predictButton.style.cursor = 'pointer';
                waitingForNewBet = false;
            } else if (status === 'active') {
                isConnected = true;
                // ONLY trigger countdown for mines predictor, NOT crash
                const crashContent = document.getElementById('crash-content');
                const isCrashMode = crashContent && crashContent.style.display !== 'none';
                
                if (isCrashMode) {
                    // For crash predictor, don't show countdown - it uses auto-fetch
                    buttonContent.textContent = 'Disconnect';
                    predictButton.disabled = false;
                    predictButton.style.opacity = '1';
                    predictButton.style.cursor = 'pointer';
                    return; // Don't proceed with mines logic
                }
                
                // Use new structure: activeGameData.id or fallback to old structure
                const currentBetId = activeGameData?.id || activeGameData?.user?.activeCasinoBet?.id;

                // Disabled: countdown-based prediction; extension polling drives predictions.
                if (waitingForNewBet) {
                    buttonContent.textContent = 'Disconnect (Waiting For New Bet)';
                    predictButton.disabled = false;
                    predictButton.style.opacity = '1';
                    predictButton.style.cursor = 'pointer';
                } else {
                    buttonContent.textContent = 'Disconnect';
                    predictButton.disabled = false;
                    predictButton.style.opacity = '1';
                    predictButton.style.cursor = 'pointer';
                }
            }
        }
    }

    // Function to check if inputs are valid and update connect button state
    async function checkInputs() {
        const stakeToken = stakeTokenInput?.value?.trim() || '';
        
        // Always ensure bet amount input is disabled
        if (betAmountInput) {
            betAmountInput.disabled = true;
        }
        
        if (stakeToken === '') {
            isConnected = false;
            updateGameStatus('Not connected', 'inactive');
            if (betAmountInput) betAmountInput.value = MODEL_NAME;
            return;
        }

        if (!isConnected && !isCountdownActive && !isPredicting) {
            updateGameStatus('Not connected', 'inactive');
        }
    }

    // Add event listeners to all inputs
    if (stakeTokenInput) {
        stakeTokenInput.addEventListener('input', checkInputs);
        
        // Add blur event to fetch game data when user finishes typing
        stakeTokenInput.addEventListener('blur', async () => {
            const token = stakeTokenInput.value.trim();
            if (token) {
                await checkInputs();
            }
        });
    }
    if (predictButton && buttonContent) {
        buttonContent.textContent = 'Connect';
        predictButton.disabled = true;
        predictButton.style.opacity = '0.5';
        predictButton.style.cursor = 'not-allowed';

        predictButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isConnected) {
                // Handle disconnect
                isConnected = false;
                activeGameData = null;
                isGameActive = false;
                lastPredictedBetId = null;
                waitingForNewBet = false;
                if (autoPredictCountdown) {
                    clearInterval(autoPredictCountdown);
                    autoPredictCountdown = null;
                }
                updateGameStatus('Not connected', 'inactive');
                return;
            }
            
            const stakeToken = stakeTokenInput?.value?.trim() || '';
            if (!stakeToken || isCountdownActive || isPredicting) {
                return;
            }
            await validateStakeToken(stakeToken);
        });
    }
    if (betAmountInput) {
        betAmountInput.addEventListener('input', checkInputs);
    }
    if (minesSelect) {
        minesSelect.addEventListener('change', checkInputs);
    }
    
    // Function to show or hide loading spinner
    function showLoadingSpinner(show) {
        if (show) {
            // Add loading spinner to bet amount, mines, and currency fields
            if (betAmountInput && betAmountInput.parentNode) {
                betAmountInput.parentNode.classList.add('loading');
            }
            if (minesSelect && minesSelect.parentNode) {
                minesSelect.parentNode.classList.add('loading');
            }
            // currency select removed from UI
        } else {
            // Remove loading spinner
            if (betAmountInput && betAmountInput.parentNode) {
                betAmountInput.parentNode.classList.remove('loading');
            }
            if (minesSelect && minesSelect.parentNode) {
                minesSelect.parentNode.classList.remove('loading');
            }
            // currency select removed from UI
        }
    }
    
    // Polling loop (1s) with change-detection snapshot
    // This fetches raw game data in the background and only updates the UI
    // when relevant fields actually change. Keeps UI stable during polling.
    let pollingIntervalId = null;
    let lastSnapshot = null; // stringified minimal snapshot

    async function fetchStakeGameDataRaw(token) {
        if (!token || token.trim() === '') return { ok: false };
        try {
            const response = await fetch('https://api.soulpredictor.xyz/stake_game_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: token })
            });
            const data = await response.json();
            if (response.ok) {
                // If API is reachable, return ok true. game_data may be null if API indicates no active bet
                return { ok: true, game_data: data && data.status === 'success' ? data.game_data || null : null };
            }
            return { ok: false };
        } catch (err) {
            // Network error or backend down - mark as not ok
            console.error('Polling fetch error:', err);
            return { ok: false };
        }
    }

    // Create a minimal snapshot object (only fields that affect UI/state)
    function makeSnapshot(result) {
        // result is the wrapper returned by fetchStakeGameDataRaw: { ok: boolean, game_data: object|null }
        try {
            if (!result || result.ok === false) return null; // error snapshot
            const gameData = result.game_data || null;
            // New structure: gameData.is_active, gameData.id, gameData.user.name
            return JSON.stringify({
                isGameActive: gameData?.is_active || false,
                betId: gameData?.id || null,
                betName: gameData?.user?.name || null,
                betAmount: gameData?.betAmount || null,
                currency: (gameData?.currency || '')?.toUpperCase() || null,
                minesCount: gameData?.mines || null
            });
        } catch (e) {
            return null;
        }
    }

    // Apply minimal UI updates using requestAnimationFrame for best paint timing
    function applyUiUpdatesFromGameData(result, prevSnapshotStr) {
        // result is { ok: true, game_data }
        window.requestAnimationFrame(() => {
            const gameData = result.game_data || null;

            if (gameData && gameData.is_active && gameData.id) {
                // Active bet present (new structure)
                activeGameData = gameData;
                isGameActive = true;

                if (betAmountInput) betAmountInput.value = MODEL_NAME;
                if (minesSelect && gameData.mines && String(minesSelect.value) !== String(gameData.mines)) {
                    minesSelect.value = gameData.mines;
                }

                updateGameStatus('Prediction ready', 'active');
            } else {
                // No active bet but API responded successfully -> connected
                isGameActive = false;
                activeGameData = gameData;

                if (betAmountInput) betAmountInput.value = MODEL_NAME;

                updateGameStatus('Connected', 'connected');
            }
        });
    }

    // Start polling every 1s
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    pollingIntervalId = setInterval(async () => {
        const token = stakeTokenInput?.value?.trim() || '';

        // If no token provided, maintain current UI state but ensure status is 'Not connected'
        if (!token) {
            // Only update status if previously connected
            if (isGameActive || lastSnapshot !== null) {
                // Keep UI stable; update minimal status
                window.requestAnimationFrame(() => updateGameStatus('Not connected', 'inactive'));
                lastSnapshot = null;
            }
            return;
        }
        
        if (!isConnected) {
            return;
        }

        // Fetch raw data silently
        const result = await fetchStakeGameDataRaw(token); // {ok, game_data}

        // Build snapshot (null means fetch error)
        const newSnapshot = makeSnapshot(result);

        // If snapshot is null -> temporary fetch issue, keep connected state
        if (newSnapshot === null) {
            if (isConnected) {
                window.requestAnimationFrame(() => updateGameStatus('Reconnecting', 'connecting'));
            }
            return;
        }

        // If snapshot unchanged, do nothing
        if (newSnapshot === lastSnapshot) return;

        // Snapshot changed -> apply updates
        const previousSnapshot = lastSnapshot;
        lastSnapshot = newSnapshot;

        // Apply UI updates from successful response
        applyUiUpdatesFromGameData(result, previousSnapshot);

        // Detect new bet transition to trigger auto-prediction logic
        const prev = previousSnapshot ? JSON.parse(previousSnapshot) : null;
        const prevBetId = prev?.betId || null;
        const currBetId = JSON.parse(newSnapshot)?.betId || null;

        const newBetDetected = currBetId && (!prevBetId || currBetId !== prevBetId);
        if (newBetDetected && !isPredicting && !waitingForNewBet && currBetId !== lastPredictedBetId) {
            window.requestAnimationFrame(() => updateGameStatus('Connected', 'active'));
        }
    }, 1000); // 1s polling

    // Initialize grid appearance
    function initializeGrid() {
        tiles.forEach(tile => {
            const cover = tile.querySelector('.cover');
            if (cover) {
                cover.style.background = '';
                cover.style.boxShadow = '';
            }
        });
    }

    function toIndexList(setLike) {
        const out = [];
        if (!setLike) return out;
        // supports Set, Array, or object keys
        try {
            if (setLike instanceof Set) {
                for (const v of setLike.values()) out.push(v);
            } else if (Array.isArray(setLike)) {
                for (const v of setLike) out.push(v);
            } else {
                for (const k of Object.keys(setLike)) out.push(k);
            }
        } catch (e) {}
        return out
            .map(v => Number.parseInt(String(v), 10))
            .filter(n => Number.isFinite(n) && n >= 0 && n < 25);
    }

    // mode:
    // - "direct": show API indices
    // - "exclude_all": show gems on every tile except API indices
    // - "exclude_same_count": show same number of gems, but only on tiles NOT in API indices
    function revealGemsStagger(gridEl, safeTilesSet, mode = 'direct') {
        if (!gridEl) return;
        // Reset all tiles to neutral
        for (let i = 0; i < 25; i++) {
            const tile = gridEl.children[i];
            if (tile) tile.classList.remove('gem', 'bomb');
        }
        const safeSet = new Set(toIndexList(safeTilesSet));
        let indices = [];
        if (mode === 'exclude_all') {
            indices = Array.from({ length: 25 }, (_, i) => i).filter(i => !safeSet.has(i));
        } else if (mode === 'exclude_same_count') {
            // Show prediction on alternate random tiles (never on backend gem indices).
            const wanted = safeSet.size;
            const candidates = Array.from({ length: 25 }, (_, i) => i).filter(i => !safeSet.has(i));
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = candidates[i];
                candidates[i] = candidates[j];
                candidates[j] = tmp;
            }
            indices = candidates.slice(0, Math.min(wanted, candidates.length));
        } else {
            // direct
            indices = Array.from(safeSet.values());
        }
        indices.forEach((idx, order) => {
            setTimeout(() => {
                const tile = gridEl.children[idx];
                if (tile) tile.classList.add('gem');
            }, 45 * order);
        });
    }

    // Show error message
    function showError(message) {
        const errorSpan = stakeTokenInput?.closest('.container')?.querySelector('.error');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    // Clear error message
    function clearError() {
        const errorSpan = stakeTokenInput?.closest('.container')?.querySelector('.error');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }

    


    function createNewGrid() {
        const newGrid = document.createElement('div');
        newGrid.className = 'wrap svelte-1fb1q7t';
        
        for (let i = 0; i < 25; i++) {
            const tile = document.createElement('button');
            tile.className = 'tile svelte-ad2de7';
            
            const cover = document.createElement('div');
            cover.className = 'cover svelte-ad2de7';
            
            tile.appendChild(cover);
            newGrid.appendChild(tile);
        }
        
        return newGrid;
    }



    // Reset grid
    window.resetGrid = function() {
        const currentTiles = document.querySelectorAll('.tile.svelte-ad2de7');
        if (!currentTiles) return;
        currentTiles.forEach(tile => {
            tile.classList.remove('gem', 'bomb');
            const cover = tile.querySelector('.cover');
            if (cover) {
                cover.style.animation = '';
                cover.style.background = '';
                cover.style.boxShadow = '';
            }
        });
    }

    // Handle form submission (legacy direct prediction) - DISABLED
    const form = document.querySelector('form[action="?/predict"]');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            showError('Predictions are extension-only. Please connect the extension and place a bet.');
            return;
            
            // Clear current prediction gems before starting new one
            resetGrid();
            
            // Allow submission if button is not disabled or if auto-prediction is triggering it
            if (!predictButton.disabled || autoPredictCountdown === null) {
                // Set predicting flag to true
                isPredicting = true;
                
                // Array of loading messages to cycle through
                const loadingMessages = [
                    'Analyzing game patterns...',
                    'Calculating probabilities...',
                    'Processing game data...',
                    'Predicting safe tiles...',
                    'Optimizing prediction model...'
                ];
                
                let messageIndex = 0;
                showLoading(loadingMessages[0]);
                
                // Cycle through messages every 2 seconds
                const messageInterval = setInterval(() => {
                    messageIndex = (messageIndex + 1) % loadingMessages.length;
                    loadingMessage.textContent = loadingMessages[messageIndex];
                }, 2000);
                
                try {
                    const oldGrid = document.querySelector('.wrap.svelte-1fb1q7t');
                    const newGrid = createNewGrid();
                    
                    // Increment bets counter
                    betsCount++;
                    if (betsCounter) {
                        betsCounter.textContent = betsCount;
                    }

                    // Add slight delay for loading animation to look natural but fast
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Refresh game data to ensure we have the latest
                    await fetchStakeGameData(stakeTokenInput.value);
                    
                    if (!isGameActive || !activeGameData) {
                        throw new Error('No active bet found on Stake.ac');
                    }

                    // Use our backend to get predictions based on the active game data
                    // This endpoint should be updated to match your deployed proxy URL if needed
                    const response = await fetch('https://api.soulpredictor.xyz/stake_predict', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: stakeTokenInput.value,
                            game_data: activeGameData,
                            mines: parseInt(minesSelect.value)
                        })
                    });

                    const data = await response.json();
                    
                    if (response.ok && data.status === 'success') {
                        // Fade out old grid
                        if (oldGrid) {
                            oldGrid.style.opacity = '0';
                            oldGrid.style.transition = 'opacity 0.3s ease';
                            
                            await new Promise(resolve => setTimeout(resolve, 300));
                            
                            if (oldGrid.parentNode) {
                                oldGrid.parentNode.removeChild(oldGrid);
                            }
                        }
                        
                        // Clear game content
                        while (gameContent.firstChild) {
                            gameContent.removeChild(gameContent.firstChild);
                        }
                        
                        // Add new grid
                        gameContent.appendChild(newGrid);
                        
                        // Fade in new grid
                        newGrid.style.opacity = '0';
                        requestAnimationFrame(() => {
                            newGrid.style.opacity = '1';
                            newGrid.style.transition = 'opacity 0.3s ease';
                        });

                        // Reveal patterns with delay
                        setTimeout(() => {
                            // Mark safe tiles
                            const safeTiles = new Set(data.gems);
                            // Show prediction exactly on API gem indices.
                            revealGemsStagger(newGrid, safeTiles, 'direct');
                        }, 300);
                        
                        // Update game status with prediction info
                        updateGameStatus(`Prediction ready (${data.gems.length} gems)`, 'active');
                    } else {
                        throw new Error(data.error || 'Failed to generate prediction');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showError(error.message || 'An error occurred while processing your request');
                    updateGameStatus('Prediction failed', 'inactive');
                    
                    // Reset waiting flag on error so we can try again
                    waitingForNewBet = false;
                } finally {
                    // Clear the message interval and hide loading
                    clearInterval(messageInterval);
                    hideLoading();
                    // Reset predicting flag
                    isPredicting = false;
                    
                    // Stop loading animation
                    stopLoading();
                }
            }
        });
    }

    // Extension prediction polling
    let extensionPredictionInterval = null;
    let currentExtensionToken = null;
    let lastPredictionBetId = null;
    let pendingPrediction = null;
    let predictionTimer = null;
    let isDisplayingPrediction = false;
    let lastBlackjackPredictionJson = null;
    let lastBlackjackPredictionTs = 0;
    let lastMolesPredictionTs = 0;
    let blackjackLoadingInterval = null;
    let blackjackLoadingTick = 0;

    function stopBlackjackPredictionLoading() {
        if (blackjackLoadingInterval) {
            clearInterval(blackjackLoadingInterval);
            blackjackLoadingInterval = null;
        }
    }

    function startBlackjackPredictionLoading() {
        const advAction = document.getElementById('bj-advice-action');
        const advDetail = document.getElementById('bj-advice-detail');
        if (!advAction || blackjackLoadingInterval) return;

        blackjackLoadingTick = 0;
        advAction.className = 'bj-advice-action bj-advice-loading';
        const render = function () {
            const dots = '.'.repeat((blackjackLoadingTick % 3) + 1);
            advAction.textContent = 'GETTING PREDICTION FROM AI' + dots;
            blackjackLoadingTick += 1;
        };
        render();
        if (advDetail) {
            advDetail.textContent = 'Analyzing live cards and dealer up-card...';
        }
        blackjackLoadingInterval = setInterval(render, 450);
    }

    function bjRankLabel(rank) {
        const r = String(rank || '').toUpperCase();
        if (r === '10') return '10';
        return r || '?';
    }

    function bjSuitSymbol(suit) {
        const su = String(suit || '').toUpperCase();
        const map = { S: '\u2660', H: '\u2665', D: '\u2666', C: '\u2663' };
        return map[su] || su || '';
    }

    function createPlayingCard(rank, suit, extraClass) {
        const el = document.createElement('div');
        el.className = 'bj-card' + (extraClass ? ' ' + extraClass : '');
        const su = String(suit || '').toUpperCase();
        if (su === 'H' || su === 'D') {
            el.classList.add('bj-red');
        }
        el.innerHTML =
            '<span class="bj-card-rank">' +
            bjRankLabel(rank) +
            '</span><span class="bj-card-suit">' +
            bjSuitSymbol(su) +
            '</span>';
        return el;
    }

    function actionLabel(action) {
        if (!action) return '-';
        const a = String(action).toLowerCase();
        if (a === 'hit') return 'HIT';
        if (a === 'stand') return 'STAND';
        if (a === 'double') return 'DOUBLE';
        if (a === 'split') return 'SPLIT';
        if (a === 'surrender') return 'SURRENDER';
        return action.toUpperCase();
    }

    window.clearBlackjackPredictionUI = function () {
        stopBlackjackPredictionLoading();
        lastBlackjackPredictionJson = null;
        lastBlackjackPredictionTs = 0;
        var betLine = document.getElementById('bj-bet-line');
        var dealerRow = document.getElementById('bj-dealer-cards');
        var dealerSum = document.getElementById('bj-dealer-summary');
        var playerZones = document.getElementById('bj-player-areas');
        var advAction = document.getElementById('bj-advice-action');
        var advDetail = document.getElementById('bj-advice-detail');
        if (betLine) {
            betLine.textContent = 'Open Stake blackjack - extension will sync automatically.';
        }
        if (dealerRow) {
            dealerRow.innerHTML = '';
        }
        if (dealerSum) {
            dealerSum.textContent = '';
        }
        if (playerZones) {
            playerZones.innerHTML = '';
        }
        if (advAction) {
            advAction.textContent = 'AUTO';
            advAction.className = 'bj-advice-action';
        }
        if (advDetail) {
            advDetail.textContent = 'Waiting for the next hand...';
        }
    };

    function clearMolesBoard() {
        const holes = document.querySelectorAll('#moles-board .moles-hole');
        holes.forEach(function (el) {
            el.classList.remove('is-predicted');
        });
        const action = document.getElementById('moles-advice-action');
        const detail = document.getElementById('moles-advice-detail');
        const probs = document.getElementById('moles-prob-row');
        const betLine = document.getElementById('moles-bet-line');
        if (action) action.textContent = '-';
        if (detail) detail.textContent = '';
        if (probs) probs.innerHTML = '';
        if (betLine) betLine.textContent = 'Waiting for extension...';
    }

    window.clearMolesPredictionUI = function () {
        lastMolesPredictionTs = 0;
        clearMolesBoard();
    };

    window.applyMolesPrediction = function (pred) {
        if (!pred || pred.game_type !== 'moles') {
            return;
        }
        if (!pred.is_active || !pred.bet_id) {
            if (typeof window.clearMolesPredictionUI === 'function') {
                window.clearMolesPredictionUI();
            }
            return;
        }
        const ts = Number(pred.timestamp || 0);
        if (ts > 0 && lastMolesPredictionTs > 0 && ts < lastMolesPredictionTs) {
            return;
        }
        if (ts > 0) {
            lastMolesPredictionTs = ts;
        }
        const predictedHole = Number(pred.predicted_hole);
        const holes = document.querySelectorAll('#moles-board .moles-hole');
        holes.forEach(function (el) {
            const idx = Number(el.getAttribute('data-hole'));
            const active = Number.isInteger(predictedHole) && idx === predictedHole;
            el.classList.toggle('is-predicted', active);
        });

        const action = document.getElementById('moles-advice-action');
        const detail = document.getElementById('moles-advice-detail');
        const probs = document.getElementById('moles-prob-row');
        const betLine = document.getElementById('moles-bet-line');
        const strategyChip = document.getElementById('moles-strategy-chip');

        if (action) {
            action.textContent = Number.isInteger(predictedHole) ? `HOLE ${predictedHole + 1}` : '-';
        }
        if (detail) {
            const conf = Number(pred.confidence || 0);
            const rounds = Number(pred.round_count || 0);
            const lastResultObj = pred.last_result || pred.last_round_result || null;
            let lastResultText = 'Pending';
            if (lastResultObj && typeof lastResultObj === 'object' && typeof lastResultObj.hit === 'boolean') {
                const label = lastResultObj.hit ? 'Win' : 'Lose';
                const pick = Number(lastResultObj.pick);
                const pickText = Number.isInteger(pick) && pick >= 0 && pick <= 6 ? ` (Pick H${pick + 1})` : '';
                lastResultText = `${label}${pickText}`;
            }
            detail.textContent = `Confidence ${conf}% | Source rounds ${rounds} | Last result ${lastResultText}`;
        }
        if (betLine) {
            const amount = pred.bet_amount;
            const c = (pred.currency || '').toUpperCase();
            const round = pred.current_round;
            const betTxt = amount !== null && amount !== undefined ? `${amount} ${c}`.trim() : 'Bet --';
            betLine.textContent = `${betTxt} | Round ${round !== null && round !== undefined ? round : '--'}`;
        }
        if (strategyChip && pred.strategy) {
            strategyChip.textContent = String(pred.strategy);
        }
        if (probs) {
            probs.innerHTML = '';
            const list = Array.isArray(pred.probabilities) ? pred.probabilities.slice(0, 4) : [];
            list.forEach(function (item) {
                const hole = Number(item.hole);
                const p = Number(item.probability || 0);
                const chip = document.createElement('span');
                chip.className = 'moles-prob-chip';
                chip.textContent = `H${hole + 1} ${Math.round(p * 100)}%`;
                probs.appendChild(chip);
            });
        }
    };

    window.applyBlackjackPrediction = function (pred) {
        if (!pred || pred.game_type !== 'blackjack') {
            return;
        }
        const predTs = Number(pred.timestamp || 0);
        // Ignore out-of-order blackjack payloads so old hands cannot overwrite new ones.
        if (predTs > 0 && lastBlackjackPredictionTs > 0 && predTs < lastBlackjackPredictionTs) {
            return;
        }
        if (predTs > 0) {
            lastBlackjackPredictionTs = predTs;
        }
        if (pred.ai_pending) {
            startBlackjackPredictionLoading();
        } else {
            stopBlackjackPredictionLoading();
        }
        const serialized = JSON.stringify(pred);
        if (serialized === lastBlackjackPredictionJson) {
            return;
        }
        lastBlackjackPredictionJson = serialized;

        const betLine = document.getElementById('bj-bet-line');
        const strat = document.getElementById('bj-strategy-chip');
        const dealerRow = document.getElementById('bj-dealer-cards');
        const dealerSum = document.getElementById('bj-dealer-summary');
        const playerZones = document.getElementById('bj-player-areas');
        const advAction = document.getElementById('bj-advice-action');
        const advDetail = document.getElementById('bj-advice-detail');

        if (!betLine || !dealerRow || !playerZones || !advAction) {
            return;
        }

        if (strat && pred.strategy) {
            strat.textContent = pred.strategy;
        }

        const amt = pred.bet_amount != null ? pred.bet_amount : '-';
        const cur = pred.currency ? String(pred.currency).toUpperCase() : '';
        const bid = pred.bet_id ? String(pred.bet_id).slice(0, 8) : '';
        betLine.textContent =
            'Bet ' + amt + (cur ? ' ' + cur : '') + (bid ? ' | id ' + bid : '');

        dealerRow.innerHTML = '';
        dealerRow.className = 'bj-card-row bj-card-row--fan';
        const dCards = pred.dealer_cards || [];
        const upIdx = typeof pred.dealer_up_index === 'number' ? pred.dealer_up_index : 0;
        dCards.forEach(function (c, i) {
            var mark = i === upIdx ? 'bj-card-up' : '';
            dealerRow.appendChild(createPlayingCard(c.rank, c.suit, mark));
        });
        if (dCards.length === 1) {
            const hole = document.createElement('div');
            hole.className = 'bj-card bj-card-back';
            hole.innerHTML = '<span class="bj-back-pattern"></span>';
            dealerRow.appendChild(hole);
        }
        if (dealerSum) {
            if (dCards.length === 0) {
                dealerSum.textContent = '';
            } else if (pred.dealer_up_rank) {
                var line =
                    'Strategy uses dealer up-card ' +
                    bjRankLabel(pred.dealer_up_rank) +
                    (pred.dealer_up_value != null ? ' (value ' + pred.dealer_up_value + ')' : '');
                if (dCards.length > 1) {
                    line += ' - gold ring on felt';
                } else {
                    line += ' | hole hidden';
                }
                dealerSum.textContent = line;
            } else {
                dealerSum.textContent =
                    'Showing ' + bjRankLabel(dCards[0].rank) + ' | hole hidden';
            }
        }

        playerZones.innerHTML = '';
        const hands = pred.player_hands || [];
        let primary = null;
        hands.forEach(function (hand) {
            const zone = document.createElement('div');
            zone.className = 'bj-player-zone';

            const row = document.createElement('div');
            row.className = 'bj-card-row bj-card-row--fan bj-card-row--player';
            (hand.cards || []).forEach(function (c) {
                row.appendChild(createPlayingCard(c.rank, c.suit, ''));
            });
            zone.appendChild(row);

            const meta = document.createElement('div');
            meta.className = 'bj-zone-meta';
            var ctot =
                hand.computed_total != null
                    ? hand.computed_total
                    : hand.recommendation && hand.recommendation.player_total != null
                      ? hand.recommendation.player_total
                      : hand.value != null
                        ? hand.value
                        : '';
            var apiV = hand.value;
            var softHand =
                hand.computed_soft === true ||
                !!(hand.recommendation && hand.recommendation.player_soft);
            var bust = Number(ctot) > 21;
            var totalLine = '';
            if (ctot !== '' && ctot != null) {
                totalLine =
                    '<span class="bj-hand-total' +
                    (bust ? ' bj-hand-total--bust' : '') +
                    (softHand ? ' bj-hand-total--soft' : '') +
                    '"><span class="bj-total-prefix">Total</span><span class="bj-hand-total-num">' +
                    String(ctot) +
                    '</span>';
                if (softHand && !bust) {
                    totalLine += '<span class="bj-hand-soft-tag">soft</span>';
                }
                if (bust) {
                    totalLine += '<span class="bj-hand-bust-tag">BUST</span>';
                }
                totalLine += '</span>';
                if (apiV != null && String(apiV) !== String(ctot)) {
                    totalLine +=
                        '<span class="bj-total-note">Table shows ' +
                        apiV +
                        ' | engine counts cards</span>';
                }
            }
            meta.innerHTML = totalLine;

            if (hand.recommendation) {
                const rec = hand.recommendation;
                const pill = document.createElement('span');
                pill.className = 'bj-rec-pill bj-rec-' + rec.action;
                pill.textContent = actionLabel(rec.action);
                meta.appendChild(pill);
                if (!primary) {
                    primary = rec;
                }
            } else {
                const wait = document.createElement('span');
                wait.className = 'bj-rec-wait';
                wait.textContent = 'No action phase';
                meta.appendChild(wait);
            }
            zone.appendChild(meta);
            playerZones.appendChild(zone);
        });

        if (pred.ai_pending) {
            startBlackjackPredictionLoading();
            if (advDetail) {
                advDetail.textContent = 'Getting prediction from AI using live cards...';
            }
        } else if (primary) {
            advAction.textContent = actionLabel(primary.action);
            advAction.className = 'bj-advice-action bj-rec-' + primary.action;
            if (advDetail) {
                var det =
                    (primary.reason || '') +
                    (primary.ev_hint ? ' ' + primary.ev_hint : '');
                if (primary.dealer_up != null) {
                    det += ' | Dealer up value ' + primary.dealer_up;
                }
                advDetail.textContent = det;
            }
        } else if (!pred.playable) {
            advAction.textContent = 'WAIT';
            advAction.className = 'bj-advice-action';
            if (advDetail) {
                advDetail.textContent =
                    'Place a bet on Stake blackjack with the extension connected; your hand will appear here automatically.';
            }
        } else {
            advAction.textContent = '-';
            advAction.className = 'bj-advice-action';
            if (advDetail) {
                advDetail.textContent = '';
            }
        }

    };
    
    // Poll for predictions from extension backend
    async function pollForExtensionPrediction() {
        const token = stakeTokenInput?.value?.trim();
        if (!token || !isConnected) {
            stopBlackjackPredictionLoading();
            // Clear pending prediction if token is removed
            if (predictionTimer) {
                clearTimeout(predictionTimer);
                predictionTimer = null;
            }
            pendingPrediction = null;
            isDisplayingPrediction = false;
            lastBlackjackPredictionJson = null;
            return;
        }
        
        const onBlackjack = window.currentPredictor === 'blackjack';
        if (onBlackjack) {
            startBlackjackPredictionLoading();
        } else {
            stopBlackjackPredictionLoading();
        }
        if (isDisplayingPrediction && !onBlackjack) {
            return;
        }
        
        try {
            const response = await fetch('https://api.soulpredictor.xyz/get_prediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });
            
            const data = await response.json();
            
            if (data.status === 'success' && data.prediction) {
                if (data.prediction.game_type === 'blackjack') {
                    if (data.prediction.ai_pending) {
                        startBlackjackPredictionLoading();
                    } else {
                        stopBlackjackPredictionLoading();
                    }
                    if (typeof window.selectPredictor === 'function' && window.currentPredictor !== 'blackjack') {
                        window.selectPredictor('blackjack');
                    }
                    if (typeof window.applyBlackjackPrediction === 'function') {
                        window.applyBlackjackPrediction(data.prediction);
                    }
                    if (typeof updateGameStatus === 'function') {
                        updateGameStatus(
                            data.prediction.ai_pending ? 'Blackjack - getting AI prediction...' : 'Blackjack - AI strategy active',
                            data.prediction.ai_pending ? 'connecting' : 'active'
                        );
                    }
                    return;
                }
                if (data.prediction.game_type === 'moles') {
                    if (!data.prediction.is_active || !data.prediction.bet_id) {
                        if (typeof window.clearMolesPredictionUI === 'function') {
                            window.clearMolesPredictionUI();
                        }
                        if (typeof updateGameStatus === 'function') {
                            updateGameStatus('No active moles round', 'connected');
                        }
                        return;
                    }
                    if (typeof window.selectPredictor === 'function' && window.currentPredictor !== 'moles') {
                        window.selectPredictor('moles');
                    }
                    if (typeof window.applyMolesPrediction === 'function') {
                        window.applyMolesPrediction(data.prediction);
                    }
                    if (typeof updateGameStatus === 'function') {
                        updateGameStatus('Moles - prediction active', 'active');
                    }
                    return;
                }
                // Only handle mines predictions
                if (data.prediction.game_type === 'mines' && data.prediction.gems && data.prediction.bombs) {
                    const betId = data.prediction.bet_id;
                    
                    const minesCount = data.prediction.mines_count || 3;
                    const isNewBet = betId ? betId !== lastPredictionBetId : lastPredictionBetId === null;
                    // Only render once per bet_id to prevent duplicates.
                    if (isNewBet) {
                        // Clear any existing timer
                        if (predictionTimer) {
                            clearTimeout(predictionTimer);
                            predictionTimer = null;
                        }
                        
                        // Store bet id immediately to prevent double-trigger while timer runs
                        lastPredictionBetId = betId;
                        
                        console.log('📥 New bet detected, waiting 1.5 seconds before showing prediction:', {
                            gems: data.prediction.gems.length,
                            bombs: data.prediction.bombs.length,
                            mines: minesCount,
                            is_fake_bet: data.prediction.is_fake_bet
                        });
                        
                        // Store prediction but don't display yet
                        pendingPrediction = {
                            gems: data.prediction.gems,
                            bombs: data.prediction.bombs,
                            minesCount: minesCount,
                            is_fake_bet: data.prediction.is_fake_bet,
                            betId: betId
                        };
                        
                        // Update game status to show waiting
                        const betType = data.prediction.is_fake_bet ? 'Fake' : 'Real';
                        updateGameStatus(`Bet detected - Analyzing... (${betType} Bet)`, 'connecting');
                        
                        // Set flag to prevent multiple displays
                        isDisplayingPrediction = true;
                        
                        // Wait 1.5 seconds before displaying prediction to feel natural
                        predictionTimer = setTimeout(() => {
                            if (pendingPrediction) {
                                console.log('✅ Timer complete, displaying prediction');
                                displayExtensionPrediction(
                                    pendingPrediction.gems, 
                                    pendingPrediction.bombs, 
                                    pendingPrediction.minesCount
                                );
                                
                                const betType = pendingPrediction.is_fake_bet ? 'Fake' : 'Real';
                                updateGameStatus(`Prediction ready (${pendingPrediction.gems.length} gems) - ${betType} Bet`, 'active');
                                
                                // Clear pending prediction and reset flag
                                pendingPrediction = null;
                                predictionTimer = null;
                                isDisplayingPrediction = false;
                            }
                        }, 1500); // 1.5 second delay
                    }
                }
            } else if (data.status === 'waiting') {
                stopBlackjackPredictionLoading();
                var hadBlackjackSnapshot = lastBlackjackPredictionJson !== null;
                if (
                    window.currentPredictor === 'blackjack' &&
                    hadBlackjackSnapshot &&
                    typeof window.clearBlackjackPredictionUI === 'function'
                ) {
                    window.clearBlackjackPredictionUI();
                    if (typeof updateGameStatus === 'function') {
                        updateGameStatus('No active blackjack hand', 'connected');
                    }
                }
                if (
                    window.currentPredictor === 'moles' &&
                    typeof window.clearMolesPredictionUI === 'function'
                ) {
                    window.clearMolesPredictionUI();
                    if (typeof updateGameStatus === 'function') {
                        updateGameStatus('No active moles round', 'connected');
                    }
                }
                // No active bet - clear pending prediction if bet ended
                // Only clear if we had a pending prediction and no active bet
                if (pendingPrediction && !lastPredictionBetId) {
                    if (predictionTimer) {
                        clearTimeout(predictionTimer);
                        predictionTimer = null;
                    }
                    pendingPrediction = null;
                    isDisplayingPrediction = false;
                    updateGameStatus('Waiting for bet...', 'connected');
                }
            }
        } catch (error) {
            console.error('Error polling extension prediction:', error);
            if (onBlackjack) {
                const advDetail = document.getElementById('bj-advice-detail');
                if (advDetail) {
                    advDetail.textContent = 'AI request delayed, retrying...';
                }
            }
            // Don't clear pending prediction on error - might be temporary network issue
        }
    }
    
    // Display prediction from extension (only called after timer completes)
    function displayExtensionPrediction(gems, bombs, minesCount) {
        // Prevent multiple calls
        if (isDisplayingPrediction && !pendingPrediction) {
            return;
        }
        
        const oldGrid = document.querySelector('.wrap.svelte-1fb1q7t');
        const newGrid = createNewGrid();
        
        // Update mines select if mines count is provided and different
        if (minesCount && minesSelect && parseInt(minesSelect.value) !== minesCount) {
            minesSelect.value = minesCount.toString();
            console.log(`🔄 Mines count updated to ${minesCount} from fake bet`);
        }
        
        // Increment bets counter
        betsCount++;
        if (betsCounter) {
            betsCounter.textContent = betsCount;
        }
        
        // Track web mines prediction usage for dashboard stats
        try {
            if (window.trackPredictionUsage) {
                window.trackPredictionUsage('mines');
            }
        } catch (e) {}
        
        // Fade out old grid
        if (oldGrid) {
            oldGrid.style.opacity = '0';
            oldGrid.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                if (oldGrid.parentNode) {
                    oldGrid.parentNode.removeChild(oldGrid);
                }
            }, 300);
        }
        
        // Clear game content
        while (gameContent.firstChild) {
            gameContent.removeChild(gameContent.firstChild);
        }
        
        // Add new grid
        gameContent.appendChild(newGrid);
        
        // Fade in new grid
        newGrid.style.opacity = '0';
        requestAnimationFrame(() => {
            newGrid.style.opacity = '1';
            newGrid.style.transition = 'opacity 0.3s ease';
        });
        
        // Reveal patterns immediately (timer already waited)
        const safeTiles = new Set(gems);
        // Show prediction exactly on API gem indices.
        revealGemsStagger(newGrid, safeTiles, 'direct');
    }
    
    // Start polling for extension predictions
    function startExtensionPredictionPolling() {
        if (extensionPredictionInterval) {
            clearInterval(extensionPredictionInterval);
        }
        
        // Poll every 1 second
        extensionPredictionInterval = setInterval(pollForExtensionPrediction, 1000);
        
        // Also poll immediately
        pollForExtensionPrediction();
    }
    
    // Stop polling
    function stopExtensionPredictionPolling() {
        stopBlackjackPredictionLoading();
        if (extensionPredictionInterval) {
            clearInterval(extensionPredictionInterval);
            extensionPredictionInterval = null;
        }
    }
    
    // Monitor token changes to start/stop polling
    if (stakeTokenInput) {
        let lastToken = stakeTokenInput.value;
        
        setInterval(() => {
            const currentToken = stakeTokenInput.value.trim();
            if (currentToken !== lastToken) {
                lastToken = currentToken;
                currentExtensionToken = currentToken;
                
                if (currentToken) {
                    startExtensionPredictionPolling();
                } else {
                    stopExtensionPredictionPolling();
                }
            }
        }, 1000);
        
        // Start polling if token already exists
        if (stakeTokenInput.value.trim()) {
            currentExtensionToken = stakeTokenInput.value.trim();
            startExtensionPredictionPolling();
        }
    }

    // Initialize on page load
    initializeGrid();
    checkInputs(); // Check initial state of inputs
});
