let currentAmount = 0;
let timerInterval;
const API_BASE_URL = 'https://soulpay.pythonanywhere.com';  // Replace with your PythonAnywhere username

document.addEventListener('DOMContentLoaded', () => {
    const paymentButtons = document.querySelectorAll('.payment-btn');
    
    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const amount = button.dataset.amount;
            generateQR(parseInt(amount));
        });
    });

    document.getElementById('confirmYes').addEventListener('click', () => handlePaymentConfirmation(true));
    document.getElementById('confirmNo').addEventListener('click', () => handlePaymentConfirmation(false));

    document.getElementById('downloadQR').addEventListener('click', downloadQRCode);
});

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
    amountDisplay.textContent = `Amount: ₹${amount}`;
    
    // Fetch UPI details from backend
    fetch(`${API_BASE_URL}/api/upi-details`)
        .then(response => response.json())
        .then(data => {
            const upiId = data.upi_id;
            const merchantName = data.merchant_name;
            const upiUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`;
            
            // Generate QR
            const qr = qrcode(0, 'M');
            qr.addData(upiUrl);
            qr.make();
            document.getElementById('qrCode').innerHTML = qr.createImgTag(5);
            
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

            showNotification(`QR Code generated for ₹${amount}`);
        })
        .catch(error => {
            console.error('Error fetching UPI details:', error);
            showNotification('Error generating QR code. Please try again.');
            handlePaymentConfirmation(false);
        });
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const timerElement = document.getElementById('timer');
    timerElement.classList.remove('hidden');
    
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
        document.getElementById('paymentConfirmation').innerHTML = '<div class="loader"></div><p>Processing payment...</p>';
        
        // Verify payment with backend
        fetch(`${API_BASE_URL}/api/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: currentAmount,
                transaction_id: Date.now().toString()
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Payment verified! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'https://t.me/librarian1337';
                }, 2000);
            } else {
                showNotification('Payment verification failed. Please try again.');
                resetPaymentUI();
            }
        })
        .catch(error => {
            console.error('Error verifying payment:', error);
            showNotification('Error verifying payment. Please try again.');
            resetPaymentUI();
        });
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
            link.download = `QR_Payment_${currentAmount}INR.png`;
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

