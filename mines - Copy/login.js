document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const errorSpan = document.querySelector('.error');

    // Import device fingerprint function from auth.js
    async function getDeviceFingerprint() {
        try {
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
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 200;
            
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125,1,62,20);
            ctx.fillStyle = "#069";
            ctx.fillText("Verification", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Pattern", 4, 17);
            
            let webglCanvas = document.createElement('canvas');
            let gl = webglCanvas.getContext('webgl');
            let webglInfo = '';
            if (gl) {
                webglInfo = gl.getParameter(gl.VENDOR) + gl.getParameter(gl.RENDERER);
            }
            
            let audioContext = window.AudioContext || window.webkitAudioContext;
            let audio = '';
            if (audioContext) {
                let context = new audioContext();
                audio = context.sampleRate.toString();
            }
            
            const rawFingerprint = `${screenRes}-${colorDepth}-${timezone}-${language}-${platform}-${userAgent}-${vendor}-${hardwareConcurrency}-${deviceMemory}-${plugins}-${canvas.toDataURL()}-${webglInfo}-${audio}-${navigator.maxTouchPoints}-${navigator.doNotTrack}`;
            
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

    function startLoading() {
        loginButton.classList.add('loading');
        const content = loginButton.querySelector('.content');
        const loader = loginButton.querySelector('.loader');
        if (content) content.style.visibility = 'hidden';
        if (loader) loader.style.display = 'flex';
        loginButton.disabled = true;
    }

    function stopLoading() {
        loginButton.classList.remove('loading');
        const content = loginButton.querySelector('.content');
        const loader = loginButton.querySelector('.loader');
        if (content) content.style.visibility = 'visible';
        if (loader) loader.style.display = 'none';
        loginButton.disabled = false;
    }

    function showError(message) {
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const activationKey = document.getElementById('activation-key').value;
        const deviceId = await getDeviceFingerprint();
        
        if (!deviceId) {
            showError('Failed to generate device identifier. Please enable JavaScript and try again.');
            return;
        }
        
        startLoading();
        try {
            const response = await fetch('https://soulogapi.vercel.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-ID': deviceId
                },
                body: JSON.stringify({ activation_key: activationKey })
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                // Redirect to main page on successful login
                window.location.href = 'index.html';
            } else {
                showError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred. Please try again.');
        } finally {
            stopLoading();
        }
    });
});
