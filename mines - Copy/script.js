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
            const response = await fetch('http://127.0.0.1:5000/stake_game_data', {
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
                // Update active game data (may be null if API reports no active bet)
                activeGameData = data && data.status === 'success' ? data.game_data : null;
                // Update active game data (do not assume active bet yet)
                activeGameData = data.game_data;

                // Check if there's an active bet
                if (activeGameData && activeGameData.user && activeGameData.user.activeCasinoBet) {
                    isGameActive = true;
                    const activeBet = activeGameData.user.activeCasinoBet;

                    // Display the stake's username (name) in the bet input instead of the numeric amount.
                    // Fallback to amount if name isn't provided by the API.
                    if (betAmountInput) {
                        betAmountInput.value = activeBet.user?.name || activeBet.name || activeBet.amount || '';
                    }

                    // Update currency selection
                    if (currencySelect && activeBet.currency) {
                        currencySelect.value = activeBet.currency.toUpperCase();
                    }

                    // Update mines count with the active bet mines count
                    if (activeBet.state && activeBet.state.minesCount && minesSelect) {
                        minesSelect.value = activeBet.state.minesCount;
                    }

                    // Connected and have an active bet
                    updateGameStatus('Prediction ready', 'active');
                    return activeGameData;
                } else {
                    // No active bet found but API responded successfully -> connected
                    isGameActive = false;

                    // Clear bet amount field but keep it disabled
                    if (betAmountInput) {
                        betAmountInput.value = 'NaN';
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
        
        let countdownSeconds = 2; // 2 seconds countdown for auto-prediction
        
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
                if (form && isGameActive && activeGameData && 
                    (!lastPredictedBetId || 
                     (activeGameData.user && 
                      activeGameData.user.activeCasinoBet && 
                      activeGameData.user.activeCasinoBet.id !== lastPredictedBetId))) {
                    
                    // Store the current bet ID to prevent repeated predictions
                    if (activeGameData.user && activeGameData.user.activeCasinoBet) {
                        lastPredictedBetId = activeGameData.user.activeCasinoBet.id;
                    }
                    
                    // Trigger the form submission to start prediction
                    form.dispatchEvent(new Event('submit'));
                    
                    // Set the waiting flag to true after prediction
                    waitingForNewBet = true;
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
                const currentBetId = activeGameData?.user?.activeCasinoBet?.id;

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
            const response = await fetch('http://127.0.0.1:5000/stake_game_data', {
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
            const activeBet = gameData?.user?.activeCasinoBet || null;
            return JSON.stringify({
                isGameActive: !!activeBet,
                betId: activeBet?.id || null,
                betName: activeBet?.user?.name || activeBet?.name || null,
                betAmount: activeBet?.amount || null,
                currency: (activeBet?.currency || '')?.toUpperCase() || null,
                minesCount: activeBet?.state?.minesCount || null
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
            const activeBet = gameData?.user?.activeCasinoBet || null;

            if (activeBet) {
                // Active bet present
                activeGameData = gameData;
                isGameActive = true;

                // Show the stake username (name) in the bet input. Fallback to amount.
                const nameToShow = activeBet.user?.name || activeBet.name || activeBet.amount || '';
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
                if (currencySelect && String(currencySelect.value).toUpperCase() !== String(activeBet.currency).toUpperCase()) {
                    currencySelect.value = activeBet.currency?.toUpperCase() || currencySelect.value;
                }
                if (minesSelect && String(minesSelect.value) !== String(activeBet.state?.minesCount)) {
                    minesSelect.value = activeBet.state?.minesCount || minesSelect.value;
                }

                updateGameStatus('Prediction ready', 'active');
            } else {
                // No active bet but API responded successfully -> connected
                isGameActive = false;
                activeGameData = gameData;

                // Keep UI inputs cleared
                if (betAmountInput) betAmountInput.value = '';

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

    function revealPattern(positions, type, grid) {
        positions.forEach((pos) => {
            const tile = grid.children[pos];
            if (tile) {
                tile.classList.add(type);
                const cover = tile.querySelector('.cover');
                if (cover) {
                    if (type === 'gem') {
                        cover.style.background = '#9bf436';
                        cover.style.boxShadow = '0 0.3em #538337';
                    } else if (type === 'bomb') {
                        cover.style.background = '#ff4444';
                        cover.style.boxShadow = '0 0.3em #cc3333';
                    }
                }
            }
        });
    }

    // Reset grid
    function resetGrid() {
        tiles.forEach(tile => {
            tile.classList.remove('gem');
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
                    const response = await fetch('http://127.0.0.1:5000/stake_predict', {
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
                            revealPattern(data.gems, 'gem', newGrid);
                            revealPattern(data.bombs, 'bomb', newGrid);
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
