# Soul Predictor - Mines & Crash Prediction

A dual-mode prediction system for Stake.ac games with both Mines and Crash prediction capabilities.

## ⚡ NEW: Smart Extension Architecture

**Recommended Method** - Uses Tampermonkey extension to bypass Cloudflare blocks!

👉 **[Quick Start Guide](QUICK_START.md)** - Get started in 3 steps  
📖 **[Detailed Setup](EXTENSION_SETUP.md)** - Complete installation guide

### Why Use Extension?

✅ **No Cloudflare Blocks** - Runs directly on Stake.ac  
✅ **Auto Predictions** - Backend handles everything  
✅ **More Reliable** - Real-time game data extraction  
✅ **Better Security** - Token stays in extension

## Features

### 🎯 Dual Predictor Interface
- **Mines Predictor**: Traditional mines game prediction with safe tile detection
- **Crash Predictor**: ML-powered crash multiplier prediction with animated graph

### 🚀 Crash Predictor Features
- **Animated Linear Graph**: Visual representation of prediction values
- **Three-Tier Predictions**: Safe, Medium, and High risk predictions
- **Auto-Fetch Mode**: Automatic prediction updates every 2 seconds
- **ML-Powered**: Uses TensorFlow and scikit-learn for accurate predictions
- **Real-time Updates**: Live prediction updates based on historical data

### 🔌 Extension Features (NEW)
- **Smart Middleware**: Tampermonkey script acts as bridge
- **Game Detection**: Auto-detects Mines or Crash game
- **Data Extraction**: Pulls bet data directly from Stake.ac page
- **Cloudflare Bypass**: No blocks since requests come from your session
- **Auto Connection**: Saves token and reconnects automatically

## Setup Instructions

### 🌟 Method 1: Extension (Recommended)

**See [QUICK_START.md](QUICK_START.md) for step-by-step guide**

Quick overview:
1. Install Tampermonkey + Extension script (`soul_predictor_extension.user.js`)
2. Start backend: `python crash_server.py`
3. Go to Stake.ac, connect extension with API token
4. Open `index.html` - predictions appear automatically!

### 📋 Method 2: Direct Connection (Legacy)

If you prefer not to use the extension:

#### 1. Start the Prediction Server

```bash
cd mines
python crash_server.py
# OR use the starter script:
python start_crash_server.py
```

This will:
- Install all required dependencies
- Start the Flask server on `http://127.0.0.1:5000`

#### 2. Open the Predictor Interface

Open `mines/index.html` in your browser to access the dual predictor interface.

#### 3. Choose Your Predictor

- **Mines Predictor**: Click on "Start Mines Prediction" for traditional mines game prediction
- **Crash Predictor**: Click on "Start Crash Prediction" for ML-powered crash predictions

**Note:** Direct connection may encounter Cloudflare blocks. Extension method is more reliable.

## Usage

### Mines Predictor
1. Enter your Stake API token
2. The system will automatically detect active bets
3. Click "Predict Now" to get safe tile predictions
4. The grid will show predicted safe tiles (green) and bombs (red)

### Crash Predictor
1. Enter your Stake API token
2. Choose between:
   - **Manual Prediction**: Click "Predict Now" for single predictions
   - **Auto-Fetch Mode**: Click "Auto Fetch" for continuous predictions every 2 seconds
3. Watch the animated graph show prediction values
4. View three-tier predictions: Safe, Medium, and High risk levels

## API Endpoints

### Extension Endpoints (New)
- `POST /extension_connect` - Register extension connection
- `POST /extension_disconnect` - Unregister extension
- `POST /extension_game_data` - Receive game data from extension
- `GET /get_extension_token` - Get connected extension token
- `POST /check_extension` - Check extension connection status
- `POST /get_prediction` - Get latest prediction for frontend

### Legacy Endpoints
- `POST /crash_predict` - Generate crash predictions (direct)
- `POST /crash_history` - Fetch crash game history (direct)
- `POST /stake_predict` - Generate mines predictions (direct)
- `POST /stake_game_data` - Fetch game data (direct)
- `GET /health` - Health check

## Technical Details

### Crash Prediction Algorithm
- Uses Random Forest and LSTM neural networks
- Analyzes last 25 crash games for pattern recognition
- Generates three-tier risk assessment
- Confidence scoring based on historical volatility
- Optimized for 1.00x - 2.10x prediction range

### Graph Animation
- Linear graph that grows based on prediction value
- Smooth 2-second animation transitions
- Visual feedback with pulsing effects
- Color-coded prediction tiers

## Requirements

- Python 3.8+
- Flask 2.3.3
- TensorFlow 2.13.0
- scikit-learn 1.3.0
- numpy, pandas, requests, cloudscraper

## Troubleshooting

1. **Server won't start**: Make sure all dependencies are installed
2. **No predictions**: Verify your Stake API token is valid
3. **Graph not animating**: Check browser console for JavaScript errors
4. **Auto-fetch not working**: Ensure the server is running on port 5000

## Architecture

### Extension-Based Flow (Recommended)

```
┌─────────────────────┐
│   Stake.ac Page     │
│  (User's Browser)   │
└──────────┬──────────┘
           │
           │ Tampermonkey Extension
           │ - Extracts game data
           │ - No Cloudflare blocks
           │
           ▼
┌─────────────────────┐
│  Backend Server     │
│  (localhost:5000)   │
│  - Generates        │
│    predictions      │
│  - ML processing    │
└──────────┬──────────┘
           │
           │ Polling
           │
           ▼
┌─────────────────────┐
│  Frontend UI        │
│  (index.html)       │
│  - Displays         │
│    predictions      │
└─────────────────────┘
```

### Benefits

| Feature | Extension Method | Direct Method |
|---------|-----------------|---------------|
| Cloudflare Blocks | ❌ None | ✅ Common |
| Token Security | 🔒 In Extension | ⚠️ In Frontend |
| Auto-Prediction | ✅ Yes | ❌ Manual |
| Game Detection | ✅ Automatic | ❌ Manual |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Security Note

### Extension Method
- API token stored in Tampermonkey's encrypted storage
- Token never appears in frontend code
- Requests come from your actual Stake.ac session
- All predictions generated server-side

### Direct Method  
Your Stake API token is only stored in memory and never logged or transmitted to external servers. All predictions are generated locally using your token to fetch game data.
