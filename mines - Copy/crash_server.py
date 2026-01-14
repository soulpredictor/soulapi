from flask import Flask, request, jsonify
from flask_cors import CORS
from crash_simple import StakeCrashBot
from advanced_predictor import AdvancedCrashPredictor
import json
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global instances
crash_bot = StakeCrashBot()
predictors = {}  # Store predictors per user

@app.route('/crash_predict', methods=['POST', 'OPTIONS'])
def crash_predict():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if not access_token:
            response = jsonify({'status': 'error', 'error': 'Access token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Initialize predictor if not exists
        user_id = hash(access_token)  # Simple user ID from token hash
        if user_id not in predictors:
            predictors[user_id] = AdvancedCrashPredictor()
        
        predictor = predictors[user_id]
        
        # Fetch crash history using the bot's method
        crash_data = crash_bot._fetch_crash_history(access_token, 25)
        
        if not crash_data or 'crashGameList' not in crash_data:
            return jsonify({'status': 'error', 'error': 'Could not fetch crash data'}), 400
        
        # Get crash points and calculate stats
        all_crash_points = [float(game['crashpoint']) for game in crash_data['crashGameList']]
        
        if len(all_crash_points) < 15:
            return jsonify({'status': 'error', 'error': 'Need at least 15 historical games for prediction'}), 400
        
        # Calculate stats for prediction
        stats_dict = {
            'avg': sum(all_crash_points)/len(all_crash_points),
            'highest': max(all_crash_points),
            'lowest': min(all_crash_points),
            'total_games': len(all_crash_points)
        }
        
        # Train models on historical data only if not already trained
        if not predictor.is_trained:
            training_success = predictor.train_models(all_crash_points[::-1])
            if not training_success:
                return jsonify({'status': 'error', 'error': 'Could not train prediction models'}), 400
        else:
            # Models already trained, no need to retrain on every request
            training_success = True
        
        # Generate prediction
        prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
        
        if not prediction_result:
            return jsonify({'status': 'error', 'error': 'Could not generate prediction'}), 400
        
        response = jsonify({
            'status': 'success',
            'predictions': prediction_result,
            'historical_data': {
                'total_games': len(all_crash_points),
                'average': stats_dict['avg'],
                'highest': stats_dict['highest'],
                'lowest': stats_dict['lowest'],
                'crash_points': all_crash_points
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Crash prediction error: {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/crash_history', methods=['POST'])
def crash_history():
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        limit = data.get('limit', 25)
        
        if not access_token:
            return jsonify({'status': 'error', 'error': 'Access token required'}), 400
        
        # Fetch crash history
        crash_data = crash_bot._fetch_crash_history(access_token, limit)
        
        if not crash_data or 'crashGameList' not in crash_data:
            return jsonify({'status': 'error', 'error': 'Could not fetch crash data'}), 400
        
        return jsonify({
            'status': 'success',
            'data': crash_data
        })
        
    except Exception as e:
        print(f"Crash history error: {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/stake_game_data', methods=['POST', 'OPTIONS'])
def stake_game_data():
    """Endpoint for mines predictor to fetch game data"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if not access_token:
            response = jsonify({'status': 'error', 'error': 'Access token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # For now, return a simple response indicating no active bet
        # This endpoint is mainly used by the mines predictor
        response = jsonify({
            'status': 'success',
            'game_data': {
                'user': {
                    'activeCasinoBet': None  # No active bet
                }
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Stake game data error: {e}")
        response = jsonify({'status': 'error', 'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/stake_predict', methods=['POST', 'OPTIONS'])
def stake_predict():
    """Endpoint for mines predictor predictions"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        game_data = data.get('game_data')
        mines = data.get('mines', 3)
        
        if not access_token:
            response = jsonify({'status': 'error', 'error': 'Access token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Generate random gem positions for mines predictor
        import random
        gem_count = max(1, min(10, 25 - mines))  # Ensure at least 1 gem
        gem_positions = random.sample(range(25), gem_count)
        bomb_positions = random.sample([i for i in range(25) if i not in gem_positions], mines)
        
        response = jsonify({
            'status': 'success',
            'gems': gem_positions,
            'bombs': bomb_positions
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Stake predict error: {e}")
        response = jsonify({'status': 'error', 'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Crash prediction server is running'})

if __name__ == '__main__':
    print("🚀 Starting Crash Prediction Server...")
    print("📊 Server will be available at http://127.0.0.1:5000")
    print("🔗 Endpoints:")
    print("   - POST /crash_predict - Generate crash predictions")
    print("   - POST /crash_history - Fetch crash history")
    print("   - POST /stake_game_data - Fetch game data (mines predictor)")
    print("   - POST /stake_predict - Generate mines predictions")
    print("   - GET /health - Health check")
    app.run(host='127.0.0.1', port=5000, debug=True)
