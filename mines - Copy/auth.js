// Enhanced device fingerprint function
async function getDeviceFingerprint() {
    try {
        // Get detailed browser info
        const screenRes = `${window.screen.width}x${window.screen.height}`;
        const colorDepth = window.screen.colorDepth;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language;
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        const hardwareConcurrency = navigator.hardwareConcurrency;
        const deviceMemory = navigator.deviceMemory;
        const plugins = Array.from(navigator.plugins).map(p => p.name).join(',');
        
        // Get canvas fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        
        // Draw complex pattern for better uniqueness
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = "#069";
        ctx.fillText("Verification", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Pattern", 4, 17);
        
        // Add WebGL fingerprint
        let webglCanvas = document.createElement('canvas');
        let gl = webglCanvas.getContext('webgl');
        let webglInfo = '';
        if (gl) {
            webglInfo = gl.getParameter(gl.VENDOR) + gl.getParameter(gl.RENDERER);
        }
        
        // Add audio fingerprint
        let audioContext = window.AudioContext || window.webkitAudioContext;
        let audio = '';
        if (audioContext) {
            let context = new audioContext();
            audio = context.sampleRate.toString();
        }
        
        // Combine all data with additional browser features
        const rawFingerprint = `${screenRes}-${colorDepth}-${timezone}-${language}-${platform}-${userAgent}-${vendor}-${hardwareConcurrency}-${deviceMemory}-${plugins}-${canvas.toDataURL()}-${webglInfo}-${audio}-${navigator.maxTouchPoints}-${navigator.doNotTrack}`;
        
        // Create strong hash
        const encoder = new TextEncoder();
        const data = encoder.encode(rawFingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return `dev_${hashHex}`;
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        return null;
    }
}

// Function to check if we're on the login page
function isLoginPage() {
    return window.location.pathname.includes('login.html');
}

// Enhanced auth check function
async function checkAuth() {
    // Don't check auth on login page
    if (isLoginPage()) {
        return true;
    }

    try {
        const deviceId = await getDeviceFingerprint();
        if (!deviceId) {
            window.location.href = 'login.html';
            return false;
        }

        const response = await fetch('https://soulogapi.vercel.app/check-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-ID': deviceId
            }
        });

        const data = await response.json();
        
        if (!response.ok || !data.valid) {
            window.location.href = 'login.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        // On network error, don't automatically log out
        return true;
    }
}

// Run auth check when the script loads
if (!isLoginPage()) {
    checkAuth();
    // Check auth every 5 minutes
    setInterval(checkAuth, 5 * 60 * 1000);
} 