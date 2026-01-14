// Anti-debugging: triggers debugger if DevTools are open
(function() {
  let threshold = 160;
  setInterval(function() {
    if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
      debugger;
    }
  }, 1000);
})();

// API Configuration
const API_BASE_URL = 'https://soulapicrash.pythonanywhere.com';  // Replace with your PythonAnywhere URL

// Function to get random profile picture
function getRandomProfilePicture() {
  // Get a random image from the images folder
  const randomNum = Math.floor(Math.random() * 100) + 1; // Generate random number for more randomness
  return `../images/${getRandomImage()}`;
}

// Function to get a random image from the images folder
function getRandomImage() {
  const images = [
    '4k-ai-mountain.jpg', 'abandoned.jpg', 'abstract.jpg', 'acrylic.jpg', 'alien_planet.jpeg',
    'android-sakura.jpg', 'anime-chick.jpg', 'anime-eye-nord.png', 'anime-nord.png',
    'anime-pond.png', 'anime-water.png', 'anime_cafe_tokyonight.png', 'anime_skyline.png',
    'Antman.jpg', 'apple_gruvbox.jpg', 'arch-chan_to.png', 'arch-eagle.png',
    'arch-nord-dark.png', 'arch-peace.png', 'arch_purple.png', 'art-lake.png',
    'astronaut-balloons.jpg', 'astronaut-mobile.png', 'astronaut-nord.png',
    'astronaut-planet.jpg', 'astronaut.jpg', 'australia.jpg', 'autumn_leaves.jpg',
    'beach_landscape.png', 'beautiful.jpg', 'beige_tree.png', 'berserkdrac.png',
    'bici.jpg', 'Black-panther.jpg', 'black-white-girl.png', 'black.jpg',
    'black_car_girl.jpg', 'blue-black-girl.png', 'blue-waves.png', 'blue_demon.png',
    'bmw.jpg', 'bunny.png', 'california.jpg', 'camp_day.png', 'cat.jpg',
    'catpuccin_landscape.png', 'catpuccin_samurai.png', 'cat_anime-girl.png',
    'chinese.png', 'circuits.png', 'cliff-edge.jpg', 'coffee.jpg', 'color-waves.png',
    'colors.jpg', 'dark_forest.png', 'dark_samurai_mobile.jpg', 'deer-forest.jpg',
    'deer-red-moon.png', 'demon.jpg', 'earth.png', 'egypt.png', 'fantasy-woods.jpg'
  ];
  
  return images[Math.floor(Math.random() * images.length)];
}

// Function to extract username and platform from social media URL
function extractSocialInfo(url) {
  try {
    const urlObj = new URL(url);
    let platform = '';
    let username = '';
    let fullUrl = url;

    // If it's just a username without @ or URL
    if (!url.includes('.') && !url.includes('/')) {
      return {
        platform: 'social',
        username: url.startsWith('@') ? url : `@${url}`,
        fullUrl: `#${url}` // Just a placeholder link
      };
    }

    // Clean the URL if needed
    if (url.startsWith('@')) {
      return {
        platform: 'telegram',
        username: url,
        fullUrl: `https://t.me/${url.substring(1)}`
      };
    }

    if (url.includes('instagram.com')) {
      platform = 'instagram';
      username = url.split('/').pop().replace('@', '');
      if (!url.startsWith('http')) {
        fullUrl = `https://instagram.com/${username}`;
      }
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      platform = 'twitter';
      username = url.split('/').pop().replace('@', '');
      if (!url.startsWith('http')) {
        fullUrl = `https://twitter.com/${username}`;
      }
    } else if (url.includes('t.me') || url.includes('telegram')) {
      platform = 'telegram';
      username = url.split('/').pop().replace('@', '');
      if (!url.startsWith('http')) {
        fullUrl = `https://t.me/${username}`;
      }
    } else {
      // Default case - treat as direct username
      platform = 'social';
      username = url.replace('@', '');
      fullUrl = url.startsWith('http') ? url : `https://${url}`;
    }

    return {
      platform,
      username: username.startsWith('@') ? username : `@${username}`,
      fullUrl
    };
  } catch (error) {
    console.error('Error parsing social URL:', error);
    return {
      platform: 'social',
      username: url.startsWith('@') ? url : `@${url}`,
      fullUrl: url.startsWith('http') ? url : `#${url}`
    };
  }
}

// Function to create star rating HTML
function createStarRating(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fas fa-star${i <= rating ? '' : ' far'}"></i>`;
  }
  return stars;
}

// Function to create a review card
function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'review-card';
  
  const profilePic = getRandomProfilePicture();
  const socialInfo = extractSocialInfo(review.telegram);
  const stars = createStarRating(review.rating);
  const date = new Date(review.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar">
        <img src="${profilePic}" alt="${review.name}'s avatar" class="profile-pic" onerror="this.src='../images/cat.jpg'">
      </div>
      <div class="review-info">
        <h4>${review.name}</h4>
        <div class="telegram-handle">
          <a href="${socialInfo.fullUrl}" target="_blank" rel="noopener noreferrer">${socialInfo.username}</a>
        </div>
      </div>
    </div>
    <div class="review-content">${review.content}</div>
    <div class="review-footer">
      <div class="review-stars">
        <div class="stars-container">${stars}</div>
        <div class="verified-client">
          <i class="fas fa-check-circle"></i>
          <span>Verified Client</span>
        </div>
      </div>
      <div class="review-date">${date}</div>
    </div>
    <div class="review-feedback">
      <button class="feedback-btn" onclick="handleFeedback(this, '${review.id}', 'helpful')">
        <i class="fas fa-thumbs-up"></i>
        <span>Helpful</span>
      </button>
      <button class="feedback-btn" onclick="handleFeedback(this, '${review.id}', 'not_helpful')">
        <i class="fas fa-thumbs-down"></i>
        <span>Not Helpful</span>
      </button>
    </div>
  `;

  return card;
}

// Function to animate the review count
function animateReviewCount(element, to) {
  let start = 0;
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * to);
    element.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = to;
    }
  }
  requestAnimationFrame(update);
}

// Function to load reviews
async function loadReviews() {
  debugger;
  const reviewsGrid = document.getElementById('reviewsGrid');
  const totalReviewsDiv = document.getElementById('totalReviews');
  reviewsGrid.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/fetch-reviews`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    const approvedReviews = data.reviews.filter(review => review.approved);
    // Sort reviews by date (newest first)
    approvedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Show animated total review count
    if (totalReviewsDiv) {
      totalReviewsDiv.innerHTML = `<span class=\"total-reviews-label\">Total verified reviews</span> <span class=\"total-reviews-sep\">|</span> <span class=\"review-count\">0</span>`;
      const countEl = totalReviewsDiv.querySelector('.review-count');
      animateReviewCount(countEl, approvedReviews.length);
    }

    if (approvedReviews.length === 0) {
      const noReviews = document.createElement('div');
      noReviews.className = 'no-reviews';
      noReviews.textContent = 'No reviews yet. Be the first to review!';
      reviewsGrid.appendChild(noReviews);
      return;
    }

    // Display approved reviews
    approvedReviews.forEach(review => {
      reviewsGrid.appendChild(createReviewCard(review));
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    const errorMessage = document.createElement('div');
    errorMessage.className = 'no-reviews error';
    errorMessage.textContent = 'Failed to load reviews. Please try again later.';
    reviewsGrid.appendChild(errorMessage);
  }
}

// Function to submit a review
async function submitReview(reviewData) {
  debugger;
  try {
    const response = await fetch(`${API_BASE_URL}/api/submit-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

// Event listener for review form submission
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  debugger;
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('.submit-btn');
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // Get platform and username, build handle
  const platform = document.getElementById('reviewPlatform').value;
  const username = document.getElementById('reviewUsername').value.trim();
  let handle = '';
  if (platform === 'telegram') {
    handle = `https://t.me/${username.replace(/^@/, '')}`;
  } else if (platform === 'instagram') {
    handle = `https://instagram.com/${username.replace(/^@/, '')}`;
  } else if (platform === 'twitter') {
    handle = `https://twitter.com/${username.replace(/^@/, '')}`;
  } else if (platform === 'discord') {
    handle = `https://discord.com/users/${username}`;
  } else {
    handle = username;
  }

  const reviewData = {
    id: Date.now().toString(),
    name: document.getElementById('reviewName').value,
    telegram: handle,
    content: document.getElementById('reviewComment').value,
    rating: parseInt(document.getElementById('reviewRating').value) || 5,
    date: new Date().toISOString(),
    approved: false
  };
  
  try {
    await submitReview(reviewData);
    closeModal();
    showNotification('Review submitted successfully! Waiting for approval.', 'success');
    loadReviews();
    
    // Reset form
    document.getElementById('reviewForm').reset();
    document.querySelectorAll('.star-rating i').forEach(star => {
      star.className = 'far fa-star';
    });
    document.getElementById('reviewRating').value = '';
  } catch (error) {
    showNotification('Failed to submit review. Please try again.', 'error');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

// Star rating handling in the form
document.querySelector('.star-rating').addEventListener('click', (e) => {
  if (e.target.tagName === 'I') {
    const rating = parseInt(e.target.dataset.rating);
    document.getElementById('reviewRating').value = rating;
    
    // Update star display with animation
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= rating) {
        star.className = 'fas fa-star';
        // Add animation with delay based on star position
        star.style.animationDelay = `${index * 0.1}s`;
        star.classList.add('animate');
        // Remove animation class after it completes
        setTimeout(() => star.classList.remove('animate'), 300 + (index * 100));
      } else {
        star.className = 'far fa-star';
      }
    });
  }
});

// Function to show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Create icon element
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  
  // Create message element
  const messageText = document.createElement('span');
  messageText.textContent = message;
  
  // Add elements to notification
  notification.appendChild(icon);
  notification.appendChild(messageText);
  
  // Add notification to body
  document.body.appendChild(notification);
  
  // Remove after animation
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Function to close modal
function closeModal() {
  const modal = document.getElementById('reviewModal');
  modal.style.display = 'none';
}

// Modal handling
const modal = document.getElementById('reviewModal');
const addReviewBtn = document.getElementById('addReviewBtn');
const closeBtn = document.getElementsByClassName('close')[0];

addReviewBtn.onclick = () => {
  modal.style.display = 'block';
};

closeBtn.onclick = closeModal;

window.onclick = (event) => {
  if (event.target === modal) {
    closeModal();
  }
};

// Load reviews when the page loads
document.addEventListener('DOMContentLoaded', loadReviews);

// Function to handle feedback
window.handleFeedback = function(btn, reviewId, type) {
  // Remove active class from all buttons in this review's feedback section
  const feedbackSection = btn.closest('.review-feedback');
  feedbackSection.querySelectorAll('.feedback-btn').forEach(button => {
    button.classList.remove('active');
  });
  
  // Toggle active class on clicked button
  btn.classList.add('active');
  
  // Save feedback to localStorage
  const feedbacks = JSON.parse(localStorage.getItem('reviewFeedbacks') || '{}');
  feedbacks[reviewId] = type;
  localStorage.setItem('reviewFeedbacks', JSON.stringify(feedbacks));
  
  // Optional: Send feedback to server
  fetch(`${API_BASE_URL}/api/submit-feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reviewId,
      type
    })
  }).catch(console.error); // Silently handle error to not disrupt user experience
};

// Function to restore feedback states from localStorage
function restoreFeedbackStates() {
  const feedbacks = JSON.parse(localStorage.getItem('reviewFeedbacks') || '{}');
  Object.entries(feedbacks).forEach(([reviewId, type]) => {
    const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`);
    if (reviewCard) {
      const btn = reviewCard.querySelector(`.feedback-btn[data-type="${type}"]`);
      if (btn) btn.classList.add('active');
    }
  });
}

// Add to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  loadReviews();
  // After reviews are loaded, restore feedback states
  setTimeout(restoreFeedbackStates, 1000);
}); 