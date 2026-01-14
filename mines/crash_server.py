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
            response = jsonify({'status': 'error', 'error': 'Could not fetch crash data. Network connection may be unavailable or stake.ac is unreachable.'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Get crash points and calculate stats
        all_crash_points = [float(game['crashpoint']) for game in crash_data['crashGameList']]
        
        if len(all_crash_points) < 15:
            response = jsonify({'status': 'error', 'error': 'Need at least 15 historical games for prediction'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
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
                response = jsonify({'status': 'error', 'error': 'Could not train prediction models'})
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response, 400
        else:
            # Models already trained, no need to retrain on every request
            training_success = True
        
        # Generate prediction
        prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
        
        if not prediction_result:
            response = jsonify({'status': 'error', 'error': 'Could not generate prediction'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
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
        response = jsonify({'status': 'error', 'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/crash_history', methods=['POST'])
def crash_history():
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        limit = data.get('limit', 25)
        
        if not access_token:
            response = jsonify({'status': 'error', 'error': 'Access token required'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Fetch crash history
        crash_data = crash_bot._fetch_crash_history(access_token, limit)
        
        if not crash_data or 'crashGameList' not in crash_data:
            response = jsonify({'status': 'error', 'error': 'Could not fetch crash data. Network connection may be unavailable or stake.ac is unreachable.'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        response = jsonify({
            'status': 'success',
            'data': crash_data
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Crash history error: {e}")
        response = jsonify({'status': 'error', 'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

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

# Extension connection management
connected_extensions = {}  # {token: {connected_at, last_seen, game_data}}
extension_predictions = {}  # {token: {prediction_data, timestamp}}

@app.route('/extension_connect', methods=['POST'])
def extension_connect():
    """Handle extension connection"""
    try:
        data = request.get_json()
        token = data.get('token')
        url = data.get('url', '')
        
        if not token:
            return jsonify({'status': 'error', 'message': 'Token required'}), 400
        
        # Register extension
        connected_extensions[token] = {
            'connected_at': time.time(),
            'last_seen': time.time(),
            'url': url,
            'game_data': None
        }
        
        print(f"✅ Extension connected with token: {token[:10]}...")
        
        response = jsonify({
            'status': 'success',
            'message': 'Connected successfully',
            'token': token
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Extension connect error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/extension_disconnect', methods=['POST'])
def extension_disconnect():
    """Handle extension disconnection"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if token in connected_extensions:
            del connected_extensions[token]
            print(f"❌ Extension disconnected: {token[:10]}...")
        
        if token in extension_predictions:
            del extension_predictions[token]
        
        response = jsonify({'status': 'success', 'message': 'Disconnected'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Extension disconnect error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/extension_game_data', methods=['POST'])
def extension_game_data():
    """Receive game data from extension and generate prediction"""
    try:
        data = request.get_json()
        token = data.get('token')
        game_type = data.get('game_type')
        
        if not token or not game_type:
            return jsonify({'status': 'error', 'message': 'Token and game_type required'}), 400
        
        # Update extension data
        if token in connected_extensions:
            connected_extensions[token]['last_seen'] = time.time()
            connected_extensions[token]['game_data'] = data
        
        prediction_generated = False
        
        # Generate prediction based on game type
        if game_type == 'crash':
            # Generate crash prediction
            crash_data = crash_bot._fetch_crash_history(token, 25)
            
            if crash_data and 'crashGameList' in crash_data:
                all_crash_points = [float(game['crashpoint']) for game in crash_data['crashGameList']]
                
                if len(all_crash_points) >= 15:
                    # Initialize predictor if not exists
                    user_id = hash(token)
                    if user_id not in predictors:
                        predictors[user_id] = AdvancedCrashPredictor()
                    
                    predictor = predictors[user_id]
                    
                    # Train if needed
                    if not predictor.is_trained:
                        predictor.train_models(all_crash_points[::-1])
                    
                    # Generate prediction
                    stats_dict = {
                        'avg': sum(all_crash_points)/len(all_crash_points),
                        'highest': max(all_crash_points),
                        'lowest': min(all_crash_points),
                        'total_games': len(all_crash_points)
                    }
                    
                    prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
                    
                    # Store prediction
                    extension_predictions[token] = {
                        'game_type': 'crash',
                        'predictions': prediction_result,
                        'historical_data': {
                            'crash_points': all_crash_points,
                            'stats': stats_dict
                        },
                        'timestamp': time.time()
                    }
                    prediction_generated = True
                    print(f"🎯 Crash prediction generated for {token[:10]}...")
        
        elif game_type == 'mines':
            # Generate mines prediction
            mines_count = data.get('mines', 3)
            
            # Generate random prediction (you can replace with your actual logic)
            import random
            gem_count = max(1, min(10, 25 - mines_count))
            all_positions = list(range(25))
            random.shuffle(all_positions)
            
            gem_positions = all_positions[:gem_count]
            bomb_positions = random.sample([i for i in range(25) if i not in gem_positions], mines_count)
            
            # Store prediction
            extension_predictions[token] = {
                'game_type': 'mines',
                'gems': gem_positions,
                'bombs': bomb_positions,
                'mines_count': mines_count,
                'timestamp': time.time()
            }
            prediction_generated = True
            print(f"💎 Mines prediction generated for {token[:10]}...")
        
        response = jsonify({
            'status': 'success',
            'has_prediction': prediction_generated,
            'message': 'Game data received'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Extension game data error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/get_prediction', methods=['POST'])
def get_prediction():
    """Frontend endpoint to get prediction generated by extension"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'status': 'error', 'message': 'Token required'}), 400
        
        # Check if extension is connected
        if token not in connected_extensions:
            return jsonify({
                'status': 'error',
                'message': 'Extension not connected',
                'connected': False
            }), 400
        
        # Get prediction if available
        if token in extension_predictions:
            prediction = extension_predictions[token]
            
            response = jsonify({
                'status': 'success',
                'connected': True,
                'prediction': prediction
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({
                'status': 'waiting',
                'connected': True,
                'message': 'Waiting for prediction'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
    except Exception as e:
        print(f"Get prediction error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/check_extension', methods=['POST', 'OPTIONS'])
def check_extension():
    """Check if extension is connected for given token"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            # If no token provided, check if any extension is connected
            if connected_extensions:
                # Return first connected extension token
                first_token = next(iter(connected_extensions.keys()))
                response = jsonify({
                    'status': 'success',
                    'connected': True,
                    'token': first_token
                })
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
            else:
                response = jsonify({
                    'status': 'success',
                    'connected': False,
                    'token': None
                })
                response.headers.add('Access-Control-Allow-Origin', '*')
                return response
        
        is_connected = token in connected_extensions
        
        # Clean up stale connections (older than 30 seconds)
        current_time = time.time()
        stale_tokens = []
        for t, info in connected_extensions.items():
            if current_time - info['last_seen'] > 30:
                stale_tokens.append(t)
        
        for t in stale_tokens:
            del connected_extensions[t]
            if t in extension_predictions:
                del extension_predictions[t]
        
        response = jsonify({
            'status': 'success',
            'connected': is_connected,
            'token': token if is_connected else None
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Check extension error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/get_extension_token', methods=['GET', 'OPTIONS'])
def get_extension_token():
    """Get token from connected extension (for frontend to auto-fill)"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        # Return first connected extension token
        if connected_extensions:
            first_token = next(iter(connected_extensions.keys()))
            response = jsonify({
                'status': 'success',
                'connected': True,
                'token': first_token
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({
                'status': 'success',
                'connected': False,
                'token': None
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        
    except Exception as e:
        print(f"Get extension token error: {e}")
        response = jsonify({'status': 'error', 'message': str(e)})
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
    print("   - POST /extension_connect - Extension connection")
    print("   - POST /extension_disconnect - Extension disconnection")
    print("   - POST /extension_game_data - Receive game data from extension")
    print("   - POST /get_prediction - Get prediction for frontend")
    print("   - POST /check_extension - Check extension status")
    print("   - GET /health - Health check")
    app.run(host='127.0.0.1', port=5000, debug=True)
