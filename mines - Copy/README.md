# Soul Predictor - Mines & Crash Prediction

A dual-mode prediction system for Stake.com games with both Mines and Crash prediction capabilities.

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

## Setup Instructions

### 1. Start the Crash Prediction Server

```bash
cd mines
python start_crash_server.py
```

This will:
- Install all required dependencies
- Start the Flask server on `http://127.0.0.1:5000`

### 2. Open the Predictor Interface

Open `mines/index.html` in your browser to access the dual predictor interface.

### 3. Choose Your Predictor

- **Mines Predictor**: Click on "Start Mines Prediction" for traditional mines game prediction
- **Crash Predictor**: Click on "Start Crash Prediction" for ML-powered crash predictions

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

The crash prediction server provides these endpoints:

- `POST /crash_predict` - Generate crash predictions
- `POST /crash_history` - Fetch crash game history
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

## Security Note

Your Stake API token is only stored in memory and never logged or transmitted to external servers. All predictions are generated locally using your token to fetch game data.
