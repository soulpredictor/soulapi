// Create snowflakes
document.addEventListener('DOMContentLoaded', function() {
    createAllSnowfalls();
    initScrollEffects();
    initModalHandling();
    initPaymentButtons();
});

// Create all snowfall effects
function createAllSnowfalls() {
    // Main snowfall
    createSnowflakes('.main-snow', 30);
    
    // Section snowfalls
    document.querySelectorAll('.section-snow').forEach(container => {
        createSnowflakes(container, 20);
    });
    
    // Modal snowfall
    createSnowflakes('.modal-snow', 15);
    
    // Footer snowfall
    createSnowflakes('.footer-snow', 20);
}

// Create snowflakes
function createSnowflakes(containerSelector, count) {
    const container = typeof containerSelector === 'string' 
        ? document.querySelector(containerSelector)
        : containerSelector;
        
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        
        // Set styles
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${left}%`;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationDelay = `${delay}s`;
        
        // Append to container
        container.appendChild(snowflake);
    }
    
    // Create keyframes for fall animation
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
        @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Scroll effects
function initScrollEffects() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Modal handling
function initModalHandling() {
    const modal = document.getElementById('qrModal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        resetPaymentUI();
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            resetPaymentUI();
        }
    });
    
    document.getElementById('confirmYes').addEventListener('click', () => handlePaymentConfirmation(true));
    document.getElementById('confirmNo').addEventListener('click', () => handlePaymentConfirmation(false));
    document.getElementById('downloadQR').addEventListener('click', downloadQRCode);
}

// Payment handling
let currentAmount = 0;
let currentPlan = '';
let timerInterval;
const API_BASE_URL = 'https://soulpay.pythonanywhere.com';

// OxaPay payment links
const OXAPAY_LINKS = {
    '7': 'https://pay.oxapay.com/16579184',   // $7 Predictor Basic
    '10': 'https://pay.oxapay.com/15532063',  // $10 Predictor Elite
    '6': 'https://pay.oxapay.com/11522416',   // $6 FBI Monthly
    '12': 'https://pay.oxapay.com/17254239'   // $12 FBI Extended
};

function initPaymentButtons() {
    const paymentButtons = document.querySelectorAll('.payment-btn');
    const isUSDPage = document.title.includes('USD');
    
    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const amount = button.dataset.amount;
            const plan = button.dataset.plan;
            currentPlan = plan;
            
            if (isUSDPage) {
                // For USD payments, redirect to OxaPay
                const oxapayLink = OXAPAY_LINKS[amount];
                if (oxapayLink) {
                    window.location.href = oxapayLink;
                }
            } else {
                // For INR payments, show QR modal
                document.getElementById('qrModal').style.display = 'block';
                generateQR(parseInt(amount));
            }
        });
    });
}

function generateQR(amount) {
    currentAmount = amount;
    
    // Reset previous states
    document.getElementById('qrCode').innerHTML = '';
    document.getElementById('qrCodeContainer').classList.remove('hidden');
    document.getElementById('paymentConfirmation').classList.add('hidden');
    document.getElementById('qrPlaceholder').classList.add('hidden');
    
    // Show loader
    const loader = document.querySelector('.loader');
    loader.style.display = 'block';
    
    // Create amount display
    const qrWrapper = document.querySelector('.qr-wrapper');
    let amountDisplay = qrWrapper.querySelector('.amount-display');
    if (!amountDisplay) {
        amountDisplay = document.createElement('div');
        amountDisplay.className = 'amount-display';
        qrWrapper.insertBefore(amountDisplay, qrWrapper.firstChild);
    }
    amountDisplay.textContent = `Amount: ₹${amount} - ${currentPlan}`;
    
    // Mock API request with setTimeout
    setTimeout(() => {
        const upiId = "7014961692@omni";
        const merchantName = "SoulPayGate";
        const upiUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`;
        
        // Generate QR
        const qrcode = new QRCode(document.getElementById("qrCode"), {
            text: upiUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Show download button
        const downloadBtn = document.getElementById('downloadQR');
        downloadBtn.classList.remove('hidden');
        
        // Hide loader and show QR code with fade-in effect
        loader.style.display = 'none';
        const qrCodeElement = document.getElementById('qrCode');
        qrCodeElement.classList.add('fade-in');
        
        // Start timer
        startTimer(300); // 5 minutes
        
        // Show payment confirmation after a delay
        setTimeout(() => {
            document.getElementById('paymentConfirmation').classList.remove('hidden');
            document.getElementById('paymentConfirmation').classList.add('fade-in');
        }, 3000);

        showNotification(`QR Code generated for ₹${amount} - ${currentPlan}`);
    }, 1500);
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const timerElement = document.getElementById('timer');
    timerElement.classList.remove('hidden');
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timerElement.textContent = `QR Time remaining: ${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            handlePaymentConfirmation(false);
        }
    }, 1000);
}

function handlePaymentConfirmation(confirmed) {
    clearInterval(timerInterval);
    
    if (confirmed) {
        // Simulate processing
        document.getElementById('paymentConfirmation').innerHTML = '<div class="loader" style="display:block;"></div><p>Processing payment...</p>';
        
        // Simulate API verification
        setTimeout(() => {
            showNotification('Payment verified! Redirecting...');
            setTimeout(() => {
                window.location.href = 'https://t.me/librarian1337';
            }, 2000);
        }, 2000);
    } else {
        resetPaymentUI();
        showNotification(`Payment of ₹${currentAmount} was cancelled.`);
    }
}

function resetPaymentUI() {
    document.getElementById('qrCodeContainer').classList.add('hidden');
    document.getElementById('paymentConfirmation').classList.add('hidden');
    document.getElementById('timer').classList.add('hidden');
    document.getElementById('downloadQR').classList.add('hidden');
    document.getElementById('qrPlaceholder').classList.remove('hidden');
    
    // Remove amount display
    const amountDisplay = document.querySelector('.amount-display');
    if (amountDisplay) {
        amountDisplay.remove();
    }
    
    clearInterval(timerInterval);
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notificationContainer');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    notificationContainer.classList.remove('hidden');
    notificationContainer.classList.add('fade-in');
    
    setTimeout(() => {
        notificationContainer.classList.remove('fade-in');
        notificationContainer.classList.add('hidden');
    }, 3000);
}

function downloadQRCode() {
    const qrImage = document.querySelector('#qrCode img');
    if (!qrImage) {
        showNotification('No QR code to download');
        return;
    }

    // Create a temporary image to ensure the image is loaded
    const tempImage = new Image();
    tempImage.crossOrigin = "Anonymous";  // Handle CORS issues
    tempImage.src = qrImage.src;

    tempImage.onload = function() {
        // Create a canvas to handle the download
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size to match QR code size plus padding
        canvas.width = tempImage.width + 40;  // Add 20px padding on each side
        canvas.height = tempImage.height + 40;
        
        // Draw white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code centered on canvas
        context.drawImage(tempImage, 20, 20);
        
        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `QR_Payment_${currentAmount}INR_${currentPlan.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('QR Code downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            showNotification('Failed to download QR code');
        }
    };

    tempImage.onerror = function() {
        showNotification('Failed to load QR code for download');
    };
}
