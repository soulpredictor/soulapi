document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Check if user is logged in
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Set username in header
    const username = sessionStorage.getItem('username') || 'Admin';
    document.getElementById('username-display').textContent = username;
    
    // API endpoints
    const API_URL = "https://soulogapi.vercel.app/get-keys";
    const INVALIDATE_URL = "https://soulogapi.vercel.app/invalidate-key";
    const CHECK_STATUS_URL = "https://soulogapi.vercel.app/check-key-status";
    const BOOST_VALIDITY_URL = "https://soulogapi.vercel.app/boost-validity";
    const GET_ANALYTICS_URL = "https://soulogapi.vercel.app/get-analytics";
    
    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const refreshKeysBtn = document.getElementById('refresh-keys');
    const keysList = document.getElementById('keys-list');
    const keysLoader = document.getElementById('keys-loader');
    const generateBtn = document.getElementById('generate-btn');
    const invalidateBtn = document.getElementById('invalidate-btn');
    
    // Pattern Generator
    const patternGrid = document.querySelector('.pattern-grid');
    const accuracyLevel = document.getElementById('accuracy-level');
    const minesCount = document.getElementById('mines-count');
    const generatePatternBtn = document.getElementById('generate-pattern-btn');
    const diamondCount = document.getElementById('diamond-count');
    const bombCount = document.getElementById('bomb-count');
    
    // Seed Validator
    const serverSeedInput = document.getElementById('server-seed');
    const originalSeedInput = document.getElementById('original-seed');
    const validateSeedBtn = document.getElementById('validate-seed-btn');
    const validationResult = document.getElementById('seed-validation-result');
    
    // Price Tracker
    const ltcPrice = document.getElementById('ltc-price');
    const ltcChange = document.getElementById('ltc-change');
    const usdInrPrice = document.getElementById('usd-inr-price');
    const usdInrChange = document.getElementById('usd-inr-change');
    const refreshPricesBtn = document.getElementById('refresh-prices');
    const priceChart = document.getElementById('price-chart');
    let priceUpdateInterval;
    
    // Analytics
    const keysChart = document.getElementById('keys-chart');
    const usersChart = document.getElementById('users-chart');
    const sessionChart = document.getElementById('session-chart');
    const usageChart = document.getElementById('usage-chart');
    const devicesChart = document.getElementById('devices-chart');
    
    // Log all key DOM elements to debug
    console.log('DOM elements:');
    console.log('logout-btn:', logoutBtn);
    console.log('check-expiry-btn:', document.getElementById('check-expiry-btn'));
    console.log('check-status-btn:', document.getElementById('check-status-btn'));
    console.log('boost-validity-btn:', document.getElementById('boost-validity-btn'));
    
    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const icon = notification.querySelector('i');
        
        notificationMessage.textContent = message;
        
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#38a169';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#e53e3e';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = '#e9b949';
        } else {
            icon.className = 'fas fa-info-circle';
            icon.style.color = '#38b2ac';
        }
        
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }
    
    // Function to handle offline/online events
    function handleConnectivityChange() {
        if (navigator.onLine) {
            // When coming back online, check for expired keys
            checkExpiredKeys();
        }
    }

    // Add connectivity listeners
    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);

    // Function to save timed key to Supabase with retry
    async function saveTimedKey(key, duration) {
        const now = new Date();
        const expiry = new Date(now.getTime() + duration);
        
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                await db.collection('timedKeys').doc(key).set({
                    expiry: expiry.toISOString(),
                    duration: duration,
                    createdAt: now.toISOString()
                });
                return true;
            } catch (error) {
                console.error(`Error saving timed key (attempt ${retryCount + 1}):`, error);
                retryCount++;
                if (retryCount === maxRetries) {
                    showNotification('Error saving key timing. Please try again.', 'error');
                    return false;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // Function to check and invalidate expired keys
    async function checkExpiredKeys() {
        try {
            const snapshot = await db.collection('timedKeys').get();
            const now = new Date();
            let hasChanges = false;

            // Check each key in the snapshot
            if (snapshot && snapshot.docs) {
                for (const doc of snapshot.docs) {
                    const key = doc.id;
                    const keyInfo = doc.data();
                    const expiryTime = new Date(keyInfo.expiry);

                    if (expiryTime <= now) {
                        try {
                            // Invalidate expired key
                            const response = await fetch(INVALIDATE_URL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ key: key })
                            });

                            if (response.ok) {
                                // Delete from Supabase with retry
                                let deleted = false;
                                for (let i = 0; i < 3; i++) {
                                    try {
                                        await db.collection('timedKeys').doc(key).delete();
                                        deleted = true;
                                        break;
                                    } catch (error) {
                                        console.error(`Error deleting key (attempt ${i + 1}):`, error);
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                    }
                                }
                                if (deleted) {
                                    hasChanges = true;
                                    showNotification(`Key ${key} has expired and been invalidated`, 'warning');
                                }
                            }
                        } catch (error) {
                            console.error('Error invalidating expired key:', error);
                        }
                    }
                }
            } else {
                console.warn('No documents found in timedKeys collection or collection is empty');
            }

            if (hasChanges) {
                fetchKeys(); // Refresh the keys list
            }
        } catch (error) {
            console.error('Error checking expired keys:', error);
            showNotification('Failed to check expired keys. Using cached data.', 'warning');
        }
    }
    
    // Function to get remaining time until expiry
    function getRemainingTime(expiryTime) {
        const remaining = new Date(expiryTime) - new Date();
        
        if (remaining <= 0) {
            return "Expired";
        }
        
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 && parts.length === 0) parts.push(`${seconds}s`);
        
        return parts.join(" ");
    }
    
    // Function to process multiple keys
    function processMultipleKeys(keysText) {
        if (!keysText) {
            showNotification('Please enter at least one key', 'warning');
            return null;
        }
        // Split by newline and/or comma, then clean up each key
        const keys = keysText.split(/[\n,]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
        
        if (keys.length === 0) {
            showNotification('Please enter at least one key', 'warning');
            return null;
        }
        return keys;
    }

    // Modified checkKeyExpiration function to handle multiple keys
    async function checkKeyExpiration() {
        const keysText = document.getElementById('check-expiry-key').value.trim();
        const keys = processMultipleKeys(keysText);
        if (!keys) return;

        const expiryResult = document.getElementById('expiry-result');
        expiryResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking keys...';
        expiryResult.className = 'expiry-result active';

        let html = '<div class="results-container">';
        
        for (const key of keys) {
            try {
                const response = await fetch("https://soulogapi.vercel.app/check-key-status", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key })
                });

                const result = await response.json();
                
                let statusClass = 'warning';
                let statusText = '';
                let icon = '';

                if (result.status === 'success') {
                    switch (result.key_status) {
                        case 'timed':
                            statusClass = 'success';
                            statusText = `Expires: ${new Date(result.expiry).toLocaleString()}`;
                            icon = 'clock';
                            break;
                        case 'expired':
                            statusClass = 'error';
                            statusText = 'Expired';
                            icon = 'times-circle';
                            break;
                        default:
                            statusClass = 'warning';
                            statusText = 'Not a timed key';
                            icon = 'info-circle';
                            break;
                    }
                } else {
                    statusClass = 'error';
                    statusText = result.message;
                    icon = 'exclamation-circle';
                }

                html += `
                    <div class="key-status-item ${statusClass}">
                        <div class="key-id">${key}</div>
                        <div class="key-status">
                            <i class="fas fa-${icon}"></i> ${statusText}
                        </div>
                    </div>
                `;
            } catch (error) {
                html += `
                    <div class="key-status-item error">
                        <div class="key-id">${key}</div>
                        <div class="key-status">
                            <i class="fas fa-exclamation-circle"></i> Error checking key
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        expiryResult.innerHTML = html;
    }

    // Modified invalidateKey function to handle multiple keys
    async function invalidateKeys() {
        const keysText = document.getElementById('invalidate-key').value.trim();
        const keys = processMultipleKeys(keysText);
        if (!keys) return;

        const invalidateResult = document.getElementById('invalidate-result');
        invalidateResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        invalidateResult.className = 'invalidate-result active';

        let html = '<div class="results-container">';
        
        for (const key of keys) {
            try {
                const response = await fetch("https://soulogapi.vercel.app/invalidate-key", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key })
                });

                const result = await response.json();
                const success = result.status === 'success';
                
                html += `
                    <div class="key-status-item ${success ? 'success' : 'error'}">
                        <div class="key-id">${key}</div>
                        <div class="key-status">
                            <i class="fas fa-${success ? 'check-circle' : 'times-circle'}"></i>
                            ${result.message}
                        </div>
                    </div>
                `;
            } catch (error) {
                html += `
                    <div class="key-status-item error">
                        <div class="key-id">${key}</div>
                        <div class="key-status">
                            <i class="fas fa-exclamation-circle"></i>
                            Error invalidating key
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        invalidateResult.innerHTML = html;
    }

    // Modified fetchKeys function to show all keys with status
    async function fetchKeys() {
        const keysList = document.getElementById('keys-list');
        const keysLoader = document.getElementById('keys-loader');
        
        keysLoader.classList.add('active');
        keysList.innerHTML = '';
        
        try {
            const response = await fetch("https://soulogapi.vercel.app/get-all-keys");
            const result = await response.json();
            
            keysLoader.classList.remove('active');
            
            if (result.status !== 'success' || !result.keys || !result.keys.length) {
                keysList.innerHTML = '<div class="key-item">No keys available</div>';
                return;
            }
            
            result.keys.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.className = `key-item key-${key.status}`;
                
                let statusText = '';
                switch (key.status) {
                    case 'bound':
                        statusText = `Bound to: ${key.device_id}`;
                        break;
                    case 'unused':
                        statusText = 'Unused';
                        break;
                    case 'invalidated':
                        statusText = 'Invalidated';
                        break;
                    case 'expired':
                        statusText = 'Expired';
                        break;
                }
                
                let expiryText = '';
                if (key.type === 'timed' && key.expiry) {
                    expiryText = `<div class="key-expiry">Expires: ${new Date(key.expiry).toLocaleString()}</div>`;
                }
                
                keyElement.innerHTML = `
                    <div class="key-content">
                        <div class="key-value">${key.id}</div>
                        <div class="key-status">${statusText}</div>
                        ${expiryText}
                    </div>
                    <div class="key-actions">
                        <button class="btn copy-btn" data-key="${key.id}">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn delete-btn" data-key="${key.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                // Add event listeners for buttons
                const copyBtn = keyElement.querySelector('.copy-btn');
                const deleteBtn = keyElement.querySelector('.delete-btn');
                
                copyBtn.addEventListener('click', function() {
                    const keyId = this.getAttribute('data-key');
                    navigator.clipboard.writeText(keyId);
                    showNotification('Key copied to clipboard', 'success');
                });
                
                deleteBtn.addEventListener('click', function() {
                    const keyId = this.getAttribute('data-key');
                    invalidateKey(keyId);
                });
                
                keysList.appendChild(keyElement);
            });
        } catch (error) {
            keysLoader.classList.remove('active');
            keysList.innerHTML = `<div class="key-item error">Error: ${error.message}</div>`;
            showNotification(`Failed to fetch keys: ${error.message}`, 'error');
        }
    }
    
    // Helper function to invalidate a single key
    async function invalidateKey(keyId) {
        try {
            const response = await fetch("https://soulogapi.vercel.app/invalidate-key", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: keyId })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                showNotification('Key invalidated successfully', 'success');
                fetchKeys(); // Refresh the keys list
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            showNotification(`Error invalidating key: ${error.message}`, 'error');
        }
    }
    
    // Function to refresh keys
    function refreshKeys() {
        fetchKeys();
        showNotification('Keys refreshed', 'info');
    }
    
    // Modified generateTimedKeys function to use our new API endpoint
    async function generateTimedKeys() {
        const durationValue = document.getElementById('duration-value').value;
        const durationUnit = document.getElementById('duration-unit').value;
        const keysCount = document.getElementById('keys-count').value;
        const generatedKeysContainer = document.querySelector('.generated-keys-container');
        
        if (!durationValue || parseInt(durationValue) < 1) {
            showNotification('Please enter a valid duration', 'warning');
            return;
        }
        
        if (!keysCount || parseInt(keysCount) < 1 || parseInt(keysCount) > 10) {
            showNotification('Number of keys must be between 1 and 10', 'warning');
            return;
        }
        
        // Show loading state
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;
        
        try {
            // Use the new API endpoint for generating timed keys
            const response = await fetch("https://soulogapi.vercel.app/generate_timed_keys", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    duration: parseInt(durationValue),
                    unit: durationUnit,
                    count: parseInt(keysCount)
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'success' || !data.keys || !Array.isArray(data.keys) || !data.keys.length) {
                throw new Error(data.message || 'No keys were generated');
            }
            
            // Format keys with numbers
            const formattedKeys = data.keys.map((key, index) => 
                `KEY ${index + 1} - ${key}`
            ).join('\n');
            
            // Create container with copy all button
            const keysDisplay = document.createElement('div');
            keysDisplay.className = 'generated-keys-display';
            
            const keysText = document.createElement('pre');
            keysText.textContent = formattedKeys;
            keysDisplay.appendChild(keysText);
            
            const copyAllBtn = document.createElement('button');
            copyAllBtn.className = 'btn copy-all-btn';
            copyAllBtn.innerHTML = '<i class="fas fa-copy"></i> Copy All Keys';
            copyAllBtn.onclick = () => {
                navigator.clipboard.writeText(formattedKeys);
                showNotification('All keys copied to clipboard', 'success');
            };
            
            // Update the container
            const generatedKeysDiv = document.getElementById('generated-keys');
            generatedKeysDiv.innerHTML = '';
            generatedKeysDiv.appendChild(keysDisplay);
            generatedKeysDiv.appendChild(copyAllBtn);
            
            generatedKeysContainer.style.display = 'block';
            showNotification(`Generated ${data.keys.length} keys that will expire in ${durationValue}${durationUnit}`, 'success');
            refreshKeys();
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            generateBtn.innerHTML = '<i class="fas fa-plus"></i> Generate Keys';
            generateBtn.disabled = false;
        }
    }
    
    // Add event listeners
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Menu item clicked:', this.getAttribute('data-section'));
            menuItems.forEach(i => i.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
                console.log('Activated section:', sectionId);
            } else {
                console.error('Section not found:', sectionId);
            }
        });
    });
    
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('username');
        window.location.href = 'index.html';
    });
    
    refreshKeysBtn.addEventListener('click', refreshKeys);
    generateBtn.addEventListener('click', generateTimedKeys);
    invalidateBtn.addEventListener('click', function() {
        const key = document.getElementById('invalidate-key').value.trim();
        invalidateKeys();
    });
    
    // Start periodic check for expired keys
    setInterval(checkExpiredKeys, 60000); // Check every minute

    // Initial load - direct function calls instead of nested event listener
    fetchKeys();
    checkExpiredKeys();

    document.getElementById('check-expiry-btn').addEventListener('click', checkKeyExpiration);
    document.getElementById('check-expiry-key').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkKeyExpiration();
        }
    });

    // Initialize new features
    initializePatternGrid();
    initializePriceChart();
    initializeAnalytics();

    // Start price updates
    updatePrices();
    priceUpdateInterval = setInterval(updatePrices, 60000); // Update every minute

    // Add event listeners for new features
    generatePatternBtn.addEventListener('click', generatePattern);
    validateSeedBtn.addEventListener('click', validateSeed);
    refreshPricesBtn.addEventListener('click', updatePrices);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active states
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Add new functions for analytics
    async function updateAnalytics() {
        console.log('updateAnalytics called');
        try {
            // Show loading state
            document.getElementById('total-keys').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            document.getElementById('bound-keys').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            document.getElementById('unused-keys').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            document.getElementById('invalidated-keys').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            console.log('Sending request to:', GET_ANALYTICS_URL);
            const response = await fetch(GET_ANALYTICS_URL);
            
            // Check if response is empty or not OK
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }
            
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response from API');
            }
            
            const result = JSON.parse(responseText);
            console.log('Response:', result);

            if (result.status === 'success') {
                document.getElementById('total-keys').textContent = result.data.total_keys;
                document.getElementById('bound-keys').textContent = result.data.bound_keys;
                document.getElementById('unused-keys').textContent = result.data.unused_keys;
                document.getElementById('invalidated-keys').textContent = result.data.invalidated_keys;
            } else {
                throw new Error(result.message || 'Failed to fetch analytics');
            }
        } catch (error) {
            console.error('Error in updateAnalytics:', error);
            
            // Generate mock data for analytics since the API is not working
            const mockData = {
                total_keys: Math.floor(Math.random() * 500) + 500,
                bound_keys: Math.floor(Math.random() * 200) + 200,
                unused_keys: Math.floor(Math.random() * 100) + 100,
                invalidated_keys: Math.floor(Math.random() * 50) + 50
            };
            
            // Update with mock data
            document.getElementById('total-keys').textContent = mockData.total_keys;
            document.getElementById('bound-keys').textContent = mockData.bound_keys;
            document.getElementById('unused-keys').textContent = mockData.unused_keys;
            document.getElementById('invalidated-keys').textContent = mockData.invalidated_keys;
            
            console.log('Using mock data for analytics:', mockData);
            showNotification('Using sample data for analytics. API might be unavailable.', 'warning');
        }
    }

    // Initialize event listeners for new functions
    console.log('Setting up event listeners...');
    
    const checkStatusBtn = document.getElementById('check-status-btn');
    const checkStatusKey = document.getElementById('check-status-key');
    const boostValidityBtn = document.getElementById('boost-validity-btn');
    const boostKey = document.getElementById('boost-key');

    console.log('Event listener elements:');
    console.log('checkStatusBtn:', checkStatusBtn);
    console.log('checkStatusKey:', checkStatusKey);
    console.log('boostValidityBtn:', boostValidityBtn);
    console.log('boostKey:', boostKey);

    if (checkStatusBtn) {
        console.log('Found check status button, adding event listener');
        checkStatusBtn.addEventListener('click', function() {
            console.log('Check status button clicked');
            checkKeyStatus();
        });
    } else {
        console.error('Check status button not found');
    }

    if (checkStatusKey) {
        console.log('Found check status key input');
        checkStatusKey.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkKeyStatus();
            }
        });
    }

    if (boostValidityBtn) {
        console.log('Found boost validity button');
        boostValidityBtn.addEventListener('click', boostValidity);
    } else {
        console.error('Boost validity button not found');
    }

    if (boostKey) {
        console.log('Found boost key input');
        boostKey.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                boostValidity();
            }
        });
    }

    // Initialize analytics
    console.log('Initializing analytics...');
    updateAnalytics();
    setInterval(updateAnalytics, 60000);
    
    // Safety measure: Add direct event listeners to crucial buttons by ID
    console.log('Adding direct event listeners as a safety measure');
    document.getElementById('check-status-btn')?.addEventListener('click', function() {
        console.log('Check status button clicked (direct listener)');
        checkKeyStatus();
    });
    
    document.getElementById('boost-validity-btn')?.addEventListener('click', function() {
        console.log('Boost validity button clicked (direct listener)');
        boostValidity();
    });
    
    // Add direct handler for analytics menu item
    const analyticsMenuItem = document.querySelector('.menu-item[data-section="analytics-section"]');
    if (analyticsMenuItem) {
        console.log('Found analytics menu item, adding click handler');
        analyticsMenuItem.addEventListener('click', function() {
            console.log('Analytics menu item clicked');
            updateAnalytics(); // Refresh analytics data when analytics tab is clicked
        });
    } else {
        console.error('Analytics menu item not found');
    }
});

// Cleanup
window.addEventListener('beforeunload', () => {
    clearInterval(priceUpdateInterval);
});

// Initialize pattern grid
function initializePatternGrid() {
    patternGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'pattern-cell';
        cell.dataset.index = i;
        patternGrid.appendChild(cell);
    }
}

// Generate pattern
async function generatePattern() {
    try {
        const response = await fetch('https://soulogapi.vercel.app/generate_pattern', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accuracy: accuracyLevel.value,
                mines: parseInt(minesCount.value)
            })
        });

        if (!response.ok) throw new Error('Failed to generate pattern');

        const data = await response.json();
        
        // Reset grid
        const cells = document.querySelectorAll('.pattern-cell');
        cells.forEach(cell => {
            cell.className = 'pattern-cell';
            cell.innerHTML = '';
        });

        // Mark diamonds
        data.diamonds.forEach(index => {
            cells[index].className = 'pattern-cell diamond';
            cells[index].innerHTML = '<i class="fas fa-gem"></i>';
        });

        // Mark bombs
        data.bombs.forEach(index => {
            cells[index].className = 'pattern-cell bomb';
            cells[index].innerHTML = '<i class="fas fa-bomb"></i>';
        });

        // Update counts
        diamondCount.textContent = data.diamonds.length;
        bombCount.textContent = data.bombs.length;

        showNotification('Pattern generated successfully', 'success');
    } catch (error) {
        showNotification('Failed to generate pattern: ' + error.message, 'error');
    }
}

// Seed Validator
async function validateSeed() {
    try {
        const response = await fetch('https://soulogapi.vercel.app/validate_seed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                server_seed: serverSeedInput.value,
                original_seed: originalSeedInput.value
            })
        });

        const data = await response.json();
        
        validationResult.className = `validation-result ${data.valid ? 'success' : 'error'}`;
        validationResult.innerHTML = `
            <i class="fas fa-${data.valid ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${data.valid ? 'Seed is valid' : data.error}</span>
        `;

        showNotification(data.valid ? 'Seed validation successful' : 'Seed validation failed', data.valid ? 'success' : 'error');
    } catch (error) {
        showNotification('Failed to validate seed: ' + error.message, 'error');
    }
}

// Price Tracker
async function updatePrices() {
    try {
        // Fetch LTC price
        const ltcResponse = await fetch('https://soulogapi.vercel.app/get_ltc_price');
        const ltcData = await ltcResponse.json();
        
        if (ltcData.success) {
            const previousPrice = parseFloat(ltcPrice.dataset.price || '0');
            const newPrice = ltcData.price;
            const change = ((newPrice - previousPrice) / previousPrice) * 100;
            
            ltcPrice.textContent = `$${newPrice.toFixed(2)}`;
            ltcPrice.dataset.price = newPrice;
            
            ltcChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            ltcChange.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        }

        // Fetch USD/INR price
        const usdInrResponse = await fetch('https://soulogapi.vercel.app/get_usd_inr_price');
        const usdInrData = await usdInrResponse.json();
        
        if (usdInrData.success) {
            const previousPrice = parseFloat(usdInrPrice.dataset.price || '0');
            const newPrice = usdInrData.price;
            const change = ((newPrice - previousPrice) / previousPrice) * 100;
            
            usdInrPrice.textContent = `₹${newPrice.toFixed(2)}`;
            usdInrPrice.dataset.price = newPrice;
            
            usdInrChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            usdInrChange.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        }

        updatePriceChart();
    } catch (error) {
        showNotification('Failed to update prices: ' + error.message, 'error');
    }
}

// Initialize price chart
let priceChartInstance;
function initializePriceChart() {
    const ctx = priceChart.getContext('2d');
    priceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'LTC/USD',
                data: [],
                borderColor: '#8B5CF6',
                tension: 0.4
            }, {
                label: 'USD/INR',
                data: [],
                borderColor: '#38A169',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function updatePriceChart() {
    const now = new Date();
    priceChartInstance.data.labels.push(now.toLocaleTimeString());
    priceChartInstance.data.datasets[0].data.push(parseFloat(ltcPrice.dataset.price));
    priceChartInstance.data.datasets[1].data.push(parseFloat(usdInrPrice.dataset.price));

    // Keep only last 10 data points
    if (priceChartInstance.data.labels.length > 10) {
        priceChartInstance.data.labels.shift();
        priceChartInstance.data.datasets.forEach(dataset => dataset.data.shift());
    }

    priceChartInstance.update();
}

// Analytics
function initializeAnalytics() {
    // Initialize keys chart
    new Chart(keysChart.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['7d', '6d', '5d', '4d', '3d', '2d', '1d'],
            datasets: [{
                label: 'Active Keys',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: '#8B5CF6',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Initialize users chart
    new Chart(usersChart.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['7d', '6d', '5d', '4d', '3d', '2d', '1d'],
            datasets: [{
                label: 'Active Users',
                data: [28, 32, 35, 30, 25, 38, 40],
                borderColor: '#38A169',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Initialize session chart
    new Chart(sessionChart.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['7d', '6d', '5d', '4d', '3d', '2d', '1d'],
            datasets: [{
                label: 'Avg Session (min)',
                data: [45, 38, 42, 50, 35, 40, 48],
                backgroundColor: '#8B5CF6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Initialize usage chart
    new Chart(usageChart.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Usage',
                data: Array.from({length: 24}, () => Math.floor(Math.random() * 100)),
                borderColor: '#8B5CF6',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Initialize devices chart
    new Chart(devicesChart.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            datasets: [{
                data: [65, 30, 5],
                backgroundColor: ['#8B5CF6', '#38A169', '#F472B6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to update key stats
function updateKeyStats() {
    fetch('https://soulogapi.vercel.app/get-all-keys')
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success' && result.keys) {
                const totalKeys = result.keys.length;
                const boundKeys = result.keys.filter(key => key.device_id).length;
                const unusedKeys = result.keys.filter(key => !key.device_id).length;
                const invalidatedKeys = result.keys.filter(key => key.type === 'invalid').length;

                document.getElementById('total-keys').textContent = totalKeys;
                document.getElementById('bound-keys').textContent = boundKeys;
                document.getElementById('unused-keys').textContent = unusedKeys;
                document.getElementById('invalidated-keys').textContent = invalidatedKeys;

                // Add click handlers for stats
                document.getElementById('total-keys-container').onclick = () => showKeyDetails('total');
                document.getElementById('bound-keys-container').onclick = () => showKeyDetails('bound');
                document.getElementById('unused-keys-container').onclick = () => showKeyDetails('unused');
                document.getElementById('invalidated-keys-container').onclick = () => showKeyDetails('invalidated');
            }
        })
        .catch(error => {
            console.error('Error fetching key stats:', error);
        });
}

// Update stats when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateKeyStats();
    // Update stats every 30 seconds
    setInterval(updateKeyStats, 30000);
});

// Function to show key details
async function showKeyDetails(type) {
    const keyDetailsContent = document.getElementById('key-details-content');
    keyDetailsContent.innerHTML = '<p>Loading...</p>';

    try {
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        };

        let keysResponse, invalidKeysResponse;
        
        // Fetch regular keys
        keysResponse = await fetch(`${SUPABASE_URL}/rest/v1/keys?select=*`, { headers });
        if (!keysResponse.ok) throw new Error('Failed to fetch keys');
        const keys = await keysResponse.json();

        // Fetch invalid keys
        invalidKeysResponse = await fetch(`${SUPABASE_URL}/rest/v1/invalid_keys?select=*`, { headers });
        if (!invalidKeysResponse.ok) throw new Error('Failed to fetch invalid keys');
        const invalidKeys = await invalidKeysResponse.json();

        let filteredKeys = [];
        let title = '';

        switch(type) {
            case 'total':
                filteredKeys = [...keys, ...invalidKeys];
                title = 'All Keys';
                break;
            case 'bound':
                filteredKeys = keys.filter(key => key.device_id);
                title = 'Bound Keys';
                break;
            case 'unused':
                filteredKeys = keys.filter(key => !key.device_id);
                title = 'Unused Keys';
                break;
            case 'invalid':
                filteredKeys = invalidKeys;
                title = 'Invalidated Keys';
                break;
        }

        let html = `<h3>${title} (${filteredKeys.length})</h3>`;
        
        if (filteredKeys.length === 0) {
            html += '<p>No keys found.</p>';
        } else {
            filteredKeys.forEach(key => {
                const isInvalid = 'invalidated_at' in key;
                const keyClass = isInvalid ? 'key-invalid' : 
                               key.device_id ? 'key-bound' : 'key-unused';
                
                html += `
                    <div class="key-item ${keyClass}">
                        <strong>ID:</strong> ${key.id}<br>
                        ${key.device_id ? `<strong>Device ID:</strong> ${key.device_id}<br>` : ''}
                        <strong>Created:</strong> ${new Date(key.created_at).toLocaleString()}<br>
                        ${isInvalid ? `<strong>Invalidated:</strong> ${new Date(key.invalidated_at).toLocaleString()}<br>` : ''}
                        ${key.expiry ? `<strong>Expires:</strong> ${new Date(key.expiry).toLocaleString()}<br>` : ''}
                    </div>
                `;
            });
        }

        keyDetailsContent.innerHTML = html;
    } catch (error) {
        console.error('Error fetching key details:', error);
        keyDetailsContent.innerHTML = '<p>Error loading key details. Please try again.</p>';
    }
}

