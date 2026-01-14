document.addEventListener('DOMContentLoaded', async function() {
    // First check authentication
    if (!await checkAuth()) {
        return; // Stop initialization if auth fails
    }

    // Check if we're in mines predictor mode
    const minesContent = document.getElementById('mines-content');
    if (!minesContent || minesContent.style.display === 'none') {
        return; // Only initialize for mines predictor
    }

    // Get all required elements
    const predictButton = document.querySelector('button.svelte-h4ldgr');
    const buttonContent = predictButton ? predictButton.querySelector('.content') : null;
    const stakeTokenInput = document.querySelector('input[id="stake_token"]');
    const betAmountInput = document.querySelector('input[id="bet"]');
    
    // Helper function to mask username (first 4 chars + xxx)
    function maskUsername(username) {
        if (!username || typeof username !== 'string') return username;
        if (username.length <= 4) return username;
        return username.substring(0, 4) + 'xxx';
    }
    const minesSelect = document.querySelector('select[id="mines"]');
    const currencySelect = document.getElementById('currency');
    const tiles = document.querySelectorAll('.tile');
    const gameContent = document.querySelector('.game-content');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const loadingMessage = document.querySelector('.loading-message');
    const gameStatusText = document.getElementById('game-status-text');
    const statusLight = document.getElementById('status-light');
    
    // Function to show loading state
    function showLoading(message = 'Analyzing game patterns...') {
        loadingOverlay.classList.add('active');
        loadingMessage.textContent = message;
        predictButton.disabled = true;
        buttonContent.textContent = 'Predicting Now';
    }

    // Function to hide loading state
    function hideLoading() {
        loadingOverlay.classList.remove('active');
        predictButton.disabled = false;
        buttonContent.textContent = 'Connecting';
    }
    
    // Disable all interactive elements by default until connection is established
    if (betAmountInput) {
        betAmountInput.disabled = true;
        betAmountInput.placeholder = 'NaN';
        betAmountInput.value = 'NaN';
    }
    if (minesSelect) {
        minesSelect.disabled = true;
    }
    if (currencySelect) {
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
    
    let stakeSession = null;
    let activeGameData = null;
    let isGameActive = false;
    let lastPredictedBetId = null; // Track the last bet ID that was predicted
    let isPredicting = false; // Flag to track if prediction is in progress
    let autoPredictCountdown = null; // Countdown timer for auto-prediction
    let waitingForNewBet = false; // Flag to track if we're waiting for a new bet after prediction

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
        let timeLeft = 8000; // 8 seconds in milliseconds
        isCountdownActive = true;
        predictButton.disabled = true;
        predictButton.style.opacity = '0.5';
        predictButton.style.cursor = 'not-allowed';
        buttonContent.textContent = (timeLeft / 1000).toFixed(2);

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        const startTime = Date.now();
        countdownInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            timeLeft = 8000 - elapsedTime; // 8 seconds countdown

            if (timeLeft > 0) {
                buttonContent.textContent = (timeLeft / 1000).toFixed(2);
            } else {
                clearInterval(countdownInterval);
                countdownInterval = null;
                isCountdownActive = false;
                buttonContent.textContent = 'Connecting';
                checkInputs(); // Re-enable button if inputs are valid
            }
        }, 10); // Update every 10ms for smooth countdown
    }

    function startLoading() {
        if (predictButton) {
            predictButton.disabled = true;
            predictButton.style.opacity = '0.5';
            predictButton.style.cursor = 'not-allowed';
        }

        // Show loading overlay
        loadingOverlay.classList.add('active');
        
        // Start cycling through messages
        currentMessageIndex = 0;
        loadingMessage.textContent = loadingMessages[0];
        
        loadingMessageInterval = setInterval(() => {
            currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
            loadingMessage.textContent = loadingMessages[currentMessageIndex];
        }, 2000);
    }

    function stopLoading() {
        // Clear message interval and hide overlay
        clearInterval(loadingMessageInterval);
        loadingOverlay.classList.remove('active');
        
        // Start the button cooldown
        startButtonCooldown();
    }

    // Function to validate the Stake API token
async function validateStakeToken(token) {
    if (!token || token.trim() === '') {
        showError('Stake API token is required');
        updateGameStatus('Not connected', 'inactive');
        return false;
    }
    
    // Update status to connecting and show loading spinner
    updateGameStatus('Connecting to Stake...', 'connecting');
    showLoadingSpinner(true);
    
    try {
        // For this implementation, we'll directly use the token to fetch game data
        // since we don't have a separate validate_stake_token endpoint
        // This will validate the token and get game data in one step
        const gameData = await fetchStakeGameData(token);
        
        // Hide loading spinner after fetching data
        showLoadingSpinner(false);
        
        if (gameData) {
            clearError();
            // Status will be updated by fetchStakeGameData
            return true;
        } else {
            // If fetchStakeGameData returns null but didn't throw an error,
            // it means the token was valid but no active bet was found
            return true;
        }
    } catch (error) {
        console.error('Stake API connection error:', error);
        showError('Failed to connect to Stake');
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
                // Update active game data (new structure from extension/backend)
                activeGameData = data && data.status === 'success' ? data.game_data : null;

                // Check if there's an active bet (new structure: game_data.is_active and game_data.id)
                if (activeGameData && activeGameData.is_active && activeGameData.id) {
                    isGameActive = true;

                    // Display the stake's username (name) in the bet input (masked)
                    if (betAmountInput && activeGameData.user && activeGameData.user.name) {
                        betAmountInput.value = maskUsername(activeGameData.user.name);
                    } else if (betAmountInput && activeGameData.betAmount) {
                        betAmountInput.value = activeGameData.betAmount;
                    }

                    // Update currency selection
                    if (currencySelect && activeGameData.currency) {
                        currencySelect.value = activeGameData.currency.toUpperCase();
                    }

                    // Update mines count
                    if (activeGameData.mines && minesSelect) {
                        minesSelect.value = activeGameData.mines;
                    }

                    // Connected and have an active bet
                    updateGameStatus('Prediction ready', 'active');
                    return activeGameData;
                } else {
                    // No active bet found but API responded successfully -> connected
                    isGameActive = false;

                    // Set username if available even if no active bet (masked)
                    if (betAmountInput && activeGameData && activeGameData.user && activeGameData.user.name) {
                        betAmountInput.value = maskUsername(activeGameData.user.name);
                    } else if (betAmountInput) {
                        betAmountInput.value = '';
                    }

                    // Reflect connection (no active bet)
                    updateGameStatus('Connected', 'connected');
                }

                return activeGameData;
            } else {
                // Non-2xx response: treat as disconnected
                showError(data?.error || 'Failed to fetch game data');
                updateGameStatus('Not connected', 'inactive');
                return null;
            }
        } catch (error) {
            console.error('Game data fetch error:', error);
            showError('Failed to fetch game data from Stake.ac');
            updateGameStatus('Not connected', 'inactive');
            return null;
        }
    }
    
    // Function to update game status indicator
    // Function to start auto-prediction countdown
    function startAutoPredictionCountdown() {
        if (autoPredictCountdown) {
            clearInterval(autoPredictCountdown);
        }
        
        let countdownSeconds = 3; // 3 seconds countdown for auto-prediction
        
        // Update button text immediately
        if (buttonContent) {
            buttonContent.textContent = `Bet Detected - Predicting In ${countdownSeconds}`;
        }
        
        // Always disable the button during auto-prediction
        if (predictButton) {
            predictButton.disabled = true;
            predictButton.style.opacity = '0.5';
            predictButton.style.cursor = 'not-allowed';
        }
        
        autoPredictCountdown = setInterval(() => {
            countdownSeconds--;
            
            if (countdownSeconds > 0) {
                // Update countdown text
                if (buttonContent) {
                    buttonContent.textContent = `Bet Detected - Predicting In ${countdownSeconds}`;
                }
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
                        
                        // Trigger the form submission to start prediction
                        form.dispatchEvent(new Event('submit'));
                        
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
            // Do not override UI while a prediction run is in progress
            if (isPredicting) return;

            if (status === 'inactive') {
                buttonContent.textContent = 'Not Connected';
                predictButton.disabled = true;
                predictButton.style.opacity = '0.5';
                predictButton.style.cursor = 'not-allowed';
                waitingForNewBet = false;
            } else if (status === 'connecting') {
                buttonContent.textContent = 'Connecting...';
                predictButton.disabled = true;
                predictButton.style.opacity = '0.5';
                predictButton.style.cursor = 'not-allowed';
            } else if (status === 'connected') {
                // Connected but no active bet
                buttonContent.textContent = 'Waiting For Bet';
                predictButton.disabled = true;
                predictButton.style.opacity = '0.5';
                predictButton.style.cursor = 'not-allowed';
                waitingForNewBet = false;
            } else if (status === 'active') {
                // Connected and an active bet exists
                // ONLY trigger countdown for mines predictor, NOT crash
                const crashContent = document.getElementById('crash-content');
                const isCrashMode = crashContent && crashContent.style.display !== 'none';
                
                if (isCrashMode) {
                    // For crash predictor, don't show countdown - it uses auto-fetch
                    buttonContent.textContent = 'Connected';
                    predictButton.disabled = false;
                    predictButton.style.opacity = '1';
                    predictButton.style.cursor = 'pointer';
                    return; // Don't proceed with mines logic
                }
                
                // Use new structure: activeGameData.id or fallback to old structure
                const currentBetId = activeGameData?.id || activeGameData?.user?.activeCasinoBet?.id;

                if (currentBetId && currentBetId !== lastPredictedBetId && !waitingForNewBet) {
                    startAutoPredictionCountdown();
                } else if (waitingForNewBet) {
                    buttonContent.textContent = 'Waiting For New Bet';
                    predictButton.disabled = true;
                    predictButton.style.opacity = '0.5';
                    predictButton.style.cursor = 'not-allowed';
                } else {
                    buttonContent.textContent = 'Bet Detected - Predict Now';
                    predictButton.disabled = true;
                    predictButton.style.opacity = '0.5';
                    predictButton.style.cursor = 'not-allowed';
                }
            }
        }
    }

    // Function to check if inputs are valid and fetch game data if needed
    async function checkInputs() {
        const stakeToken = stakeTokenInput?.value?.trim() || '';
        
        // Always ensure bet amount input is disabled
        if (betAmountInput) {
            betAmountInput.disabled = true;
        }
        
        // Only validate the Stake token - everything else is handled by fetchStakeGameData
        if (stakeToken !== '' && !isCountdownActive) {
            // Show connecting status while we validate and fetch data
            updateGameStatus('Connecting to Stake', 'connecting');
            
            // Validate token and fetch game data
            await validateStakeToken(stakeToken);
            
            // Button state and UI will be updated by updateGameStatus based on connection status
        } else if (stakeToken === '') {
            // No token provided
            updateGameStatus('Not connected', 'inactive');
            
            // Clear input fields but keep them disabled
            if (betAmountInput) {
                betAmountInput.value = '';
            }
        }
        // No need to check other inputs as they're handled by fetchStakeGameData
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
            if (currencySelect && currencySelect.parentNode) {
                currencySelect.parentNode.classList.add('loading');
            }
        } else {
            // Remove loading spinner
            if (betAmountInput && betAmountInput.parentNode) {
                betAmountInput.parentNode.classList.remove('loading');
            }
            if (minesSelect && minesSelect.parentNode) {
                minesSelect.parentNode.classList.remove('loading');
            }
            if (currencySelect && currencySelect.parentNode) {
                currencySelect.parentNode.classList.remove('loading');
            }
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

                // Show the stake username (name) in the bet input. Fallback to amount. (masked)
                const nameToShow = gameData.user?.name ? maskUsername(gameData.user.name) : (gameData.betAmount || '');
                if (betAmountInput && String(betAmountInput.value) !== String(nameToShow)) {
                    betAmountInput.value = nameToShow;
                    
                    // Adjust font size based on name length
                    betAmountInput.classList.remove('long-text', 'very-long-text');
                    if (nameToShow.length > 12) {
                        betAmountInput.classList.add('very-long-text');
                    } else if (nameToShow.length > 8) {
                        betAmountInput.classList.add('long-text');
                    }
                }
                if (currencySelect && gameData.currency && String(currencySelect.value).toUpperCase() !== String(gameData.currency).toUpperCase()) {
                    currencySelect.value = gameData.currency.toUpperCase();
                }
                if (minesSelect && gameData.mines && String(minesSelect.value) !== String(gameData.mines)) {
                    minesSelect.value = gameData.mines;
                }

                updateGameStatus('Prediction ready', 'active');
            } else {
                // No active bet but API responded successfully -> connected
                isGameActive = false;
                activeGameData = gameData;

                // Set username if available even if no active bet (masked)
                if (betAmountInput && gameData && gameData.user && gameData.user.name) {
                    betAmountInput.value = maskUsername(gameData.user.name);
                } else if (betAmountInput) {
                    betAmountInput.value = '';
                }

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

        // Fetch raw data silently
        const result = await fetchStakeGameDataRaw(token); // {ok, game_data}

        // Build snapshot (null means fetch error)
        const newSnapshot = makeSnapshot(result);

        // If snapshot is null -> fetch error; treat as not connected
        if (newSnapshot === null) {
            // Only update UI if we previously had a successful snapshot
            if (lastSnapshot !== null) {
                lastSnapshot = null;
                window.requestAnimationFrame(() => updateGameStatus('Not connected', 'inactive'));
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
                cover.style.background = '#2f4553';
                cover.style.boxShadow = '0 0.3em #213743';
            }
        });
    }

    // Show error message
    function showError(message) {
        const errorSpan = serverSeedInput?.closest('.container')?.querySelector('.error');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    // Clear error message
    function clearError() {
        const errorSpan = serverSeedInput?.closest('.container')?.querySelector('.error');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }

    
    function generateGemPositions(minesCount) {
        let gemCount;
        switch(minesCount) {
            case 1: gemCount = Math.floor(Math.random() * 4) + 8; // 8-10 gems
            break;
            case 2: gemCount = Math.floor(Math.random() * 3) + 3; // 3-5 gems
            break;
            case 3: gemCount = Math.floor(Math.random() * 4) + 2; // 2-5 gems
            break;
            case 4: gemCount = Math.floor(Math.random() * 2) + 2; // 2-3 gems
            break;
            case 5: gemCount = Math.floor(Math.random() * 4) + 1; // 1-3 gems
            break;
            case 6: gemCount = Math.floor(Math.random() * 3) + 1; // 1-2 gems
            break;
            case 7:
            case 8: gemCount = 1; // 1 gem
            break;
            default: gemCount = 1;
        }

        const positions = new Set();
        while (positions.size < gemCount) {
            positions.add(Math.floor(Math.random() * 25));
        }
        return Array.from(positions);
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

    // Gem SVG from testmines.js (for safe tiles) - exact same as aimSVG
    const gemSVG = `
      <svg viewBox="0 0 76.61 70" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
          <defs>
              <style>
                  .cls-1{fill:#051d27;}
                  .cls-2{fill:#06e403;}
                  .cls-3{fill:#05a902;}
                  .cls-4{fill:#01e501;}
                  .cls-5{fill:#00d503;}
                  .cls-6{fill:#09fd02;}
                  .cls-7{fill:#019902;}
                  .cls-8{fill:#01e300;}
                  .cls-9{fill:#57fd7f;}
                  .cls-10{fill:#03be02;}
              </style>
          </defs>
          <title>Safe Gem</title>
          <g id="Layer_1" data-name="Layer 1">
              <path class="cls-1" d="M38,70h0a2.75,2.75,0,0,1-2-.92L.7,29.62a2.76,2.76,0,0,1-.31-3.25L11,8.55a2.76,2.76,0,0,1,1.27-1.12L23.12,2.71a2.77,2.77,0,0,1,.62-.19L37.74,0a3.09,3.09,0,0,1,1,0L52.62,2.52a3.38,3.38,0,0,1,.62.18L64.42,7.58l.13,0h0a2.69,2.69,0,0,1,.65.45h0a3,3,0,0,1,.4.47h0l.09.14L76.23,26.6a2.73,2.73,0,0,1-.34,3.25L40.06,69.1A2.76,2.76,0,0,1,38,70Z"/>
              <path class="cls-2" d="M22.13,18.75c-2.64,7-1.74,13.65,2.09,20,6.74-3.1,11.83-8.4,14.44-17C33,18.93,27.49,17.74,22.13,18.75Z"/>
              <path class="cls-3" d="M73.86,28,63.33,10.1c-6.26,1.19-8.79,4.41-9,8.91C58.67,25.3,65.39,28,73.86,28Z"/>
              <path class="cls-4" d="M38.49,21.94c.15,7.77,4.2,13.31,12.19,16.57l.07,0c4.5-5.59,5.9-12,3.62-19.47C48.26,16.08,42.9,16.72,38.49,21.94Z"/>
              <path class="cls-5" d="M24.22,38.76q13.19,6.43,26.46-.25L38.49,21.94Z"/>
              <path class="cls-6" d="M24.22,38.76c1,9.17,6.29,18.72,13.81,28.49,7.4-9,12.5-18.4,12.72-28.77Z"/>
              <path class="cls-7" d="M50.75,38.48,38,67.25,73.86,28C64.47,28.32,56.19,30.75,50.75,38.48Z"/>
              <path class="cls-8" d="M2.75,27.79,38,67.25,24.22,38.76C20.11,31,11.89,28.8,2.75,27.79Z"/>
              <path class="cls-9" d="M13.39,10,2.75,27.79c9.33,1.22,16.19-1.21,19.54-8.88C24.57,13.79,21.22,11,13.39,10Z"/>
              <polygon class="cls-6" points="2.75 27.79 24.22 38.76 22.29 18.91 2.75 27.79"/>
              <polygon class="cls-6" points="52.14 5.23 38.22 2.75 24.22 5.23 13.39 9.96 22.29 18.91 38.49 21.94 54.37 19.01 63.33 10.1 52.14 5.23"/>
              <polygon class="cls-10" points="50.74 38.48 73.86 27.99 54.37 19.01 50.74 38.48"/>
              <polygon class="cls-9" points="13.89 10.83 24.37 5.43 38.22 2.75 24.22 5.23 13.39 9.96 13.89 10.83"/>
              <polygon class="cls-9" points="22.29 18.91 24.22 38.76 21.1 19.05 22.29 18.91"/>
              <polygon class="cls-9" points="22.29 18.91 38.49 21.94 38.03 22.48 22.29 18.91"/>
              <polygon class="cls-9" points="63.33 10.1 53 19.28 54.37 19.01 63.33 10.1"/>
          </g>
      </svg>`;

    // Bomb SVG from testmines.js
    const bombSVG = `
      <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
          <path d="M35,70a35.47,35.47,0,0,1-8.45-1A35,35,0,1,1,49.83,3.3c3.53-2.25,8.75-.54,12.39,4.16.15.19.3.39.44.59a11.89,11.89,0,0,1,3.61,2.31,10.6,10.6,0,0,1,3.27,7.91A9,9,0,0,1,68,23.44a32.32,32.32,0,0,1,1.14,4h0A35,35,0,0,1,35,70ZM35,6.47A28.57,28.57,0,1,0,62.85,28.84h0A27.53,27.53,0,0,0,61.34,24a3.17,3.17,0,0,1-.16-2,3.2,3.2,0,0,1-1.49-1.33c-.29-.5-.6-1-.92-1.48a3.23,3.23,0,0,1-.11-3.39.92.92,0,0,0,.06-.29,3.33,3.33,0,0,1,.77-1.79,3.16,3.16,0,0,1-1.73-1.4,11.43,11.43,0,0,0-.65-.95c-1.59-2-3.35-2.68-3.87-2.62A1.81,1.81,0,0,1,53,9l-1.37.79a3.22,3.22,0,0,1-3.14.06A28.47,28.47,0,0,0,35,6.47Z" style="fill:#051d27"/>
          <path d="M66.76,35A31.62,31.62,0,0,0,66,28.14c-2.45-.61-13.43-3.53-16.07-3.53-17.55,0-28.75,14.48-28.75,32,0,2.35,5.65,7,6.14,9.19A31.8,31.8,0,0,0,66.76,35Z" style="fill:#d8003e"/>
          <path d="M58.34,27.2a31.72,31.72,0,0,1,7.67.94A31.76,31.76,0,1,0,27.33,65.83a31.77,31.77,0,0,1,31-38.63Z" style="fill:#fd013e"/>
          <path d="M51.33,6.19,45.71,9.44c-2.24,1.74-1.7,6.17,1.19,9.9S54,24.69,56.19,23l4.55-4.64Z" style="fill:#d8003e"/>
          <ellipse cx="56.03" cy="12.26" rx="4.6" ry="7.67" transform="translate(4.24 36.9) rotate(-37.78)" style="fill:#fd013e"/>
          <path d="M41.45,38.53a1.55,1.55,0,0,1-.37,0,1.84,1.84,0,0,1-1.44-2.17c2-9.64,10.07-12,16-13.71,4.86-1.41,7-2.24,7-4.34a3.76,3.76,0,0,0-1.11-2.89c-1.91-1.81-5.63-1.67-5.67-1.66a1.84,1.84,0,1,1-.2-3.68c.22,0,5.33-.25,8.41,2.67a7.43,7.43,0,0,1,2.26,5.56c0,5.08-4.9,6.5-9.65,7.88-5.85,1.69-11.9,3.45-13.41,10.9A1.85,1.85,0,0,1,41.45,38.53Z" style="fill:#2a2f3c"/>
          <polygon points="32.81 53.29 33.53 54.59 30.13 56.91 30.49 53.72 32.81 53.29" style="fill:#fff"/>
          <polygon points="20.47 56.89 20.73 57.24 19.67 57.76 19.72 56.95 20.47 56.89" style="fill:#fff"/>
          <polygon points="32.15 47.91 32.26 48.82 33.05 48.66 32.87 47.59 32.15 47.91" style="fill:#fff"/>
          <polygon points="35.28 46.02 34.89 47.73 36.14 47.94 36.82 46.87 36.39 45.91 35.28 46.02" style="fill:#fff"/>
          <polygon points="38.02 48.47 37.97 49.28 39.03 48.76 38.77 48.41 38.02 48.47" style="fill:#fff"/>
          <polygon points="41.13 49.33 42.21 48.85 42.71 50.93 41.48 51.1 41.13 49.33" style="fill:#fff"/>
          <polygon points="32.64 39.9 33.07 40.85 32.39 41.92 31.14 41.71 31.54 40 32.64 39.9" style="fill:#fff"/>
          <polygon points="44.43 45.41 44.62 46.48 43.83 46.65 43.71 45.74 44.43 45.41" style="fill:#fff"/>
          <polygon points="47.56 43.79 46.62 45.17 49.51 46.55 49.95 45.02 47.56 43.79" style="fill:#fff"/>
          <polygon points="52.47 47.67 52.42 48.48 53.48 47.96 53.22 47.61 52.47 47.67" style="fill:#fff"/>
          <polygon points="51.74 51.27 51.31 52.23 52.6 53.19 54.63 51.91 51.74 51.27" style="fill:#fff"/>
          <polygon points="51.63 58.46 50.91 58.78 51.02 59.69 51.82 59.53 51.63 58.46" style="fill:#fff"/>
          <polygon points="46.62 39.13 46.86 36.72 48.76 36.45 49.38 37.45 46.62 39.13" style="fill:#fff"/>
          <polygon points="61.89 33.9 61.84 34.71 62.9 34.19 62.64 33.84 61.89 33.9" style="fill:#fff"/>
          <polygon points="47.15 33.15 47.73 33.71 47.01 34.52 46.57 33.86 47.15 33.15" style="fill:#fff"/>
          <polygon points="36.75 33.83 35.69 34.34 35.73 33.53 36.48 33.47 36.75 33.83" style="fill:#fff"/>
          <polygon points="35.78 37.44 35.05 37.77 35.17 38.67 35.96 38.51 35.78 37.44" style="fill:#fff"/>
          <polygon points="33.78 34.62 33 35.77 31.73 35.41 31.25 33.9 32.46 32.87 33.78 34.62" style="fill:#fff"/>
          <polygon points="28.58 24.4 28.76 25.46 27.97 25.63 27.85 24.72 28.58 24.4" style="fill:#fff"/>
          <polygon points="47 26.82 43.8 40.43 34.23 26.82 41.68 41.48 31.04 38.34 37.42 42.53 19.33 47.76 39.55 44.62 36.36 55.09 42.74 47.76 47 51.95 47 46.72 61.89 49.86 48.06 43.57 55.51 38.34 47 41.48 47 26.82" style="fill:#fdcb02"/>
          <polygon points="56.57 43.61 63.67 41.84 63.67 43.61 56.57 43.61" style="fill:#fdcb02"/>
          <polygon points="32.63 33.01 26.43 22.4 25.54 25.05 32.63 33.01" style="fill:#fdcb02"/>
          <polygon points="34.41 52.44 28.2 63.04 27.31 60.39 34.41 52.44" style="fill:#fdcb02"/>
          <polygon points="46.93 44.58 52.19 51.23 44.6 47 42.26 52.44 41.09 48.21 33.1 50.41 38.17 44.58 32.92 42.16 38.17 40.35 36.42 37.94 41.09 38.54 39.92 29.47 43.43 38.54 44.6 37.94 44.6 39.75 49.85 37.33 46.93 42.16 53.36 42.77 46.93 44.58" style="fill:#fff"/>
      </svg>`;

    function revealPattern(positions, type, grid) {
        positions.forEach((pos) => {
            const tile = grid.children[pos];
            if (tile) {
                // Remove any existing indicators
                const existingBomb = tile.querySelector('.bomb-indicator');
                const existingGem = tile.querySelector('.gem-indicator');
                if (existingBomb) {
                    existingBomb.remove();
                }
                if (existingGem) {
                    existingGem.remove();
                }
                
                if (type === 'gem') {
                    // Add gem SVG indicator for safe tiles
                    tile.classList.add(type);
                    const originalPosition = window.getComputedStyle(tile).position;
                    if (originalPosition === "static") {
                        tile.style.position = "relative";
                    }
                    
                    // Remove any existing gem indicator
                    const existingGem = tile.querySelector('.gem-indicator');
                    if (existingGem) {
                        existingGem.remove();
                    }
                    
                    const gem = document.createElement("div");
                    gem.classList.add("gem-indicator");
                    gem.innerHTML = gemSVG;
                    tile.appendChild(gem);
                } else if (type === 'bomb') {
                    // Add bomb SVG indicator instead of background color
                    tile.classList.add(type);
                    const originalPosition = window.getComputedStyle(tile).position;
                    if (originalPosition === "static") {
                        tile.style.position = "relative";
                    }
                    
                    const bomb = document.createElement("div");
                    bomb.classList.add("bomb-indicator");
                    bomb.innerHTML = bombSVG;
                    tile.appendChild(bomb);
                }
            }
        });
    }

    // Reset grid
    function resetGrid() {
        tiles.forEach(tile => {
            tile.classList.remove('gem', 'bomb');
            // Remove bomb and gem indicators
            const bombIndicator = tile.querySelector('.bomb-indicator');
            const gemIndicator = tile.querySelector('.gem-indicator');
            if (bombIndicator) {
                bombIndicator.remove();
            }
            if (gemIndicator) {
                gemIndicator.remove();
            }
            const cover = tile.querySelector('.cover');
            if (cover) {
                cover.style.animation = '';
                cover.style.background = '#2f4553';
                cover.style.boxShadow = '0 0.3em #213743';
            }
        });
    }

    // Handle form submission
    const form = document.querySelector('form[action="?/predict"]');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
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

                    // Add artificial delay for loading animation
                    await new Promise(resolve => setTimeout(resolve, 8000));
                    
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
                            // Mark safe tiles (no green styling, no gem class)
                            const safeTiles = new Set(data.gems);
                            
                            // Add bomb SVGs to ALL tiles except safe ones
                            for (let i = 0; i < 25; i++) {
                                const tile = newGrid.children[i];
                                if (tile) {
                                    // Remove any existing classes and indicators
                                    tile.classList.remove('gem', 'bomb');
                                    const existingBomb = tile.querySelector('.bomb-indicator');
                                    if (existingBomb) {
                                        existingBomb.remove();
                                    }
                                    
                                    // Ensure tile has relative positioning for bomb indicator
                                    const originalPosition = window.getComputedStyle(tile).position;
                                    if (originalPosition === "static") {
                                        tile.style.position = "relative";
                                    }
                                    
                                    if (safeTiles.has(i)) {
                                        // This tile is safe, add gem SVG
                                        const gem = document.createElement("div");
                                        gem.classList.add("gem-indicator");
                                        gem.innerHTML = gemSVG;
                                        tile.appendChild(gem);
                                        tile.classList.add('gem');
                                    } else {
                                        // This tile is not safe, add bomb SVG
                                        const bomb = document.createElement("div");
                                        bomb.classList.add("bomb-indicator");
                                        bomb.innerHTML = bombSVG;
                                        tile.appendChild(bomb);
                                        tile.classList.add('bomb');
                                    }
                                }
                            }
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

    // Initialize on page load
    initializeGrid();
    checkInputs(); // Check initial state of inputs
});
