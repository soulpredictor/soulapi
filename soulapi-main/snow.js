function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    
    // Random size between 3 and 8 pixels
    const size = Math.random() * 5 + 3;
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    
    // Random horizontal position
    snowflake.style.left = `${Math.random() * 100}vw`;
    
    // Random animation duration between 10 and 20 seconds
    const duration = Math.random() * 10 + 10;
    snowflake.style.animation = `snowfall ${duration}s linear infinite`;
    
    document.body.appendChild(snowflake);
    
    // Remove the snowflake after animation ends
    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000);
}

// Create initial snowflakes
for(let i = 0; i < 50; i++) {
    setTimeout(createSnowflake, Math.random() * 5000);
}

// Create new snowflakes periodically
setInterval(createSnowflake, 200); 