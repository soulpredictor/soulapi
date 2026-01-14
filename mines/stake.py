import requests
import json
import asyncio
import random
import cloudscraper
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
from PIL import Image, ImageDraw, ImageFont
import io
import time

class StakeMinesBot:
    def __init__(self, bot_token: str = "8492553770:AAE9I4BmQYYWlWX9RXJOjgKj0h7PevTWjww"):
        self.bot_token = bot_token
        self.api_url = "https://stake.bet/_api/casino/active-bet/mines"
        self.user_tokens = {}
        self.app = None
        
        # Initialize cloudscraper with browser settings that mimic Termux
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'android',
                'desktop': False,
                'mobile': True
            },
            delay=5,  # Delay between retries
            interpreter='js2py'  # Use js2py for JavaScript challenge solving
        )
        
        self.cookies = {}  # Store cookies
        
    def initialize_bot(self):
        """Initialize the Telegram bot"""
        self.app = Application.builder().token(self.bot_token).build()
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup bot command handlers"""
        self.app.add_handler(CommandHandler("start", self._start_command))
        self.app.add_handler(CommandHandler("next", self._next_command))
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self._handle_message))
        self.app.add_handler(CallbackQueryHandler(self._button_callback))
    
    async def _start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        welcome_text = """
🤖 **Stake Mines Bot**

Welcome! I can fetch your active Mines game data from Stake.bet and generate grid images.

**How to use:**
1. Send me your Stake.bet API token
2. Use /next to fetch your current game data
3. I'll generate a 5x5 grid image showing the revealed tiles

Your token is stored securely in memory.
        """
        await update.message.reply_text(welcome_text, parse_mode='Markdown')
    
    async def _handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming messages - expect API token"""
        user_id = update.message.from_user.id
        token = update.message.text.strip()
        
        # Basic token validation
        if len(token) < 10:
            await update.message.reply_text("❌ Invalid token format. Please provide a valid Stake.bet API token.")
            return
        
        self.user_tokens[user_id] = token
        await update.message.reply_text(
            "✅ API token saved successfully!\n\nUse /next to fetch your current Mines game data.",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🎮 Get Current Game", callback_data="get_game")]
            ])
        )
    
    async def _button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle button callbacks"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "get_game":
            await self._fetch_and_send_game_data(query.message, query.from_user.id)
    
    async def _next_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /next command"""
        user_id = update.message.from_user.id
        await self._fetch_and_send_game_data(update.message, user_id)
    
    async def _fetch_and_send_game_data(self, message, user_id):
        """Fetch game data and send grid image"""
        if user_id not in self.user_tokens:
            if hasattr(message, 'reply_text'):
                await message.reply_text("❌ Please send your Stake.bet API token first before using /next.")
            else:
                await message.edit_text("❌ Please send your Stake.bet API token first before using /next.")
            return
        
        token = self.user_tokens[user_id]
        
        try:
            # Send typing action
            if hasattr(message, 'reply_text'):
                await message.reply_chat_action(action='typing')
            else:
                await message.edit_reply_markup(reply_markup=None)
                await message.reply_chat_action(action='typing')
            
            # Fetch game data from API
            game_data = await self._fetch_game_data(token)
            
            if not game_data:
                error_msg = "❌ No active Mines game found or API error."
                if hasattr(message, 'reply_text'):
                    await message.reply_text(error_msg)
                else:
                    await message.edit_text(error_msg)
                return

            active_bet = None
            if isinstance(game_data, dict):
                active_bet = game_data.get('user', {}).get('activeCasinoBet') if game_data.get('user') else None

            if not active_bet:
                error_msg = "❌ No active Mines bet detected. Start a game and try again."
                if hasattr(message, 'reply_text'):
                    await message.reply_text(error_msg)
                else:
                    await message.edit_text(error_msg)
                return

            predictions = None
            mines_state = active_bet.get('state', {}) if isinstance(active_bet, dict) else {}
            mines_count = mines_state.get('minesCount')
            if isinstance(mines_count, int) and mines_count > 0:
                predictions = self._generate_predictions(mines_count)
            
            # Generate grid image
            image_buffer = await self._generate_grid_image(game_data, predictions=predictions)
            
            # Prepare response text
            response_text = self._format_game_info(game_data, predictions=predictions)
            
            # Send image and info
            if hasattr(message, 'reply_text'):
                await message.reply_photo(
                    photo=image_buffer,
                    caption=response_text,
                    parse_mode='Markdown',
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔄 Refresh", callback_data="get_game")]
                    ])
                )
            else:
                await message.reply_photo(
                    photo=image_buffer,
                    caption=response_text,
                    parse_mode='Markdown',
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔄 Refresh", callback_data="get_game")]
                    ])
                )
            
        except Exception as e:
            error_msg = f"❌ Error fetching game data: {str(e)}"
            print(f"Detailed error: {repr(e)}")  # Debug print
            if hasattr(message, 'reply_text'):
                await message.reply_text(error_msg)
            else:
                await message.edit_text(error_msg)
    
    async def _fetch_game_data(self, access_token):
        """Fetch game data from Stake.bet API using cloudscraper to bypass Cloudflare protection"""
        # Latest mobile user agents that work well with Cloudflare
        mobile_user_agents = [
            # Latest Chrome on Android
            'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            # Termux specific user agents
            'Mozilla/5.0 (Linux; Android 13; Termux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 12; Termux) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            # The user's specific user agent that worked in Termux
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'
        ]
        
        # Select a random mobile user agent
        user_agent = random.choice(mobile_user_agents)
        
        # Update the scraper's user agent
        self.scraper.headers.update({'User-Agent': user_agent})
        
        print("\nPreparing to fetch data from Stake.bet Mines API...")
        print(f"Using cloudscraper with User-Agent: {user_agent}")
        
        # First, visit the main site to establish cookies and session
        try:
            print("Visiting main site to establish session...")
            main_url = 'https://stake.bet/casino/games/mines'
            
            # Visit the main page with cloudscraper
            main_response = self.scraper.get(
                main_url,
                timeout=20
            )
            
            if main_response.status_code == 200:
                print("✅ Successfully established session with main site")
            else:
                print(f"⚠️ Warning: Main site returned status code {main_response.status_code}")
            
            # Store cookies from the main page visit
            self.cookies = dict(self.scraper.cookies)
            
            # Add a small delay to mimic human behavior
            time.sleep(2 + random.random())
            
        except Exception as e:
            print(f"⚠️ Warning: Could not pre-fetch cookies: {e}")
        
        # API request headers
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json',
            'Origin': 'https://stake.bet',
            'Referer': 'https://stake.bet/casino/games/mines',
            'x-access-token': access_token
        }
        
        # Update scraper headers
        self.scraper.headers.update(headers)
        
        payload = {}
        max_retries = 5  # Increased retries
        retry_delay = 3  # Longer initial delay
        
        for attempt in range(max_retries):
            try:
                print(f"\nSending POST request to stake.bet Mines API... (Attempt {attempt+1}/{max_retries})")
                print(f"URL: {self.api_url}")
                print(f"Access Token: {access_token}")
                print("-" * 50)
                
                # Use cloudscraper to make the request
                response = self.scraper.post(
                    self.api_url, 
                    json=payload,
                    timeout=30  # Increased timeout
                )
                
                print(f"Response Status Code: {response.status_code}")
                
                # Check if request was successful
                response.raise_for_status()
                
                # Parse and return JSON response
                json_response = response.json()
                
                print("✅ Successfully fetched Mines game data")
                return json_response
                
            except (cloudscraper.exceptions.CloudflareChallengeError, requests.exceptions.HTTPError) as e:
                print(f"❌ Cloudflare/HTTP Error: {e}")
                print(f"Response Text: {response.text if 'response' in locals() else 'No response'}")
                
                if attempt < max_retries - 1:
                    # Create a new scraper instance with different settings
                    if attempt % 2 == 1:  # Every other attempt, recreate the scraper
                        print("Recreating cloudscraper instance with new settings...")
                        self.scraper = cloudscraper.create_scraper(
                            browser={
                                'browser': 'chrome',
                                'platform': 'android',
                                'desktop': False,
                                'mobile': True
                            },
                            delay=5 + attempt * 2,  # Increase delay with each attempt
                            interpreter='js2py'
                        )
                    
                    # Change user agent for next attempt
                    user_agent = random.choice(mobile_user_agents)
                    self.scraper.headers.update({'User-Agent': user_agent})
                    print(f"Switched to new User-Agent: {user_agent}")
                    
                    # Add some delay before retrying (with randomization)
                    jitter = random.uniform(0.8, 1.2)  # Add randomness to delay
                    wait_time = retry_delay * jitter
                    print(f"Waiting {wait_time:.2f} seconds before retrying...")
                    time.sleep(wait_time)
                    retry_delay *= 1.5  # Exponential backoff
                    continue
                
                return None
            except requests.exceptions.RequestException as e:
                print(f"❌ Request Error: {e}")
                if attempt < max_retries - 1:
                    print(f"Waiting {retry_delay} seconds before retrying...")
                    time.sleep(retry_delay)
                    retry_delay *= 1.5  # Exponential backoff
                    continue
                return None
            except json.JSONDecodeError as e:
                print(f"❌ JSON Parse Error: {e}")
                print(f"Raw Response: {response.text if 'response' in locals() else 'No response'}")
                if attempt < max_retries - 1:
                    print(f"Waiting {retry_delay} seconds before retrying...")
                    time.sleep(retry_delay)
                    retry_delay *= 1.5  # Exponential backoff
                    continue
                return None
    
    def _generate_predictions(self, mines_count: int):
        """Generate predicted safe and mine tile positions based on mines count."""
        total_tiles = 25

        if not isinstance(mines_count, int) or mines_count < 1:
            mines_count = 1

        range_map = {
            1: (8, 10),   # 8-10 safe picks
            2: (3, 5),
            3: (2, 5),
            4: (2, 3),
            5: (1, 3),
            6: (1, 2),
            7: (1, 1),
            8: (1, 1)
        }

        min_safe, max_safe = range_map.get(mines_count, (1, 1))

        max_safe_cap = max(1, total_tiles - min(mines_count, total_tiles))
        safe_count = random.randint(min_safe, max_safe)
        safe_count = max(1, min(safe_count, max_safe_cap))

        all_positions = list(range(total_tiles))
        safe_positions = sorted(random.sample(all_positions, safe_count))

        remaining_positions = [pos for pos in all_positions if pos not in safe_positions]
        predicted_mines_count = min(mines_count, len(remaining_positions))

        predicted_mines = []
        if predicted_mines_count > 0:
            predicted_mines = sorted(random.sample(remaining_positions, predicted_mines_count))

        return {
            "safe": safe_positions,
            "mines": predicted_mines
        }

    async def _generate_grid_image(self, game_data, predictions=None):
        """Generate 5x5 grid image based on game state and predictions"""
        grid_size = 5
        cell_size = 80
        padding = 20
        image_size = (grid_size * cell_size + 2 * padding, grid_size * cell_size + 2 * padding + 120)

        image = Image.new('RGB', image_size, color='#1a1a1a')
        draw = ImageDraw.Draw(image)

        revealed_color = '#2563eb'        # Blue for revealed safe tiles
        predicted_safe_color = '#22c55e'  # Green for predicted safe tiles
        predicted_mine_color = '#f97316'  # Orange for predicted mines
        mine_color = '#ef4444'            # Red for known mines
        hidden_color = '#6b7280'          # Grey for unknown tiles
        border_color = '#374151'
        text_color = 'white'

        predicted_safe_positions = set()
        predicted_mine_positions = set()
        if predictions:
            predicted_safe_positions = set(predictions.get('safe', []))
            predicted_mine_positions = set(predictions.get('mines', []))

        revealed_positions = []
        mine_positions = []
        mines_count_value = '?'

        if isinstance(game_data, dict):
            bet_data = game_data.get('user', {}).get('activeCasinoBet') if game_data.get('user') else None
            if bet_data and isinstance(bet_data, dict):
                state = bet_data.get('state', {})
                mines_count_value = state.get('minesCount', '?')

                for round_data in state.get('rounds', []):
                    if isinstance(round_data, dict) and 'field' in round_data:
                        revealed_positions.append(round_data['field'])

                if state.get('mines'):
                    mine_positions = state['mines']

        for row in range(grid_size):
            for col in range(grid_size):
                position = row * grid_size + col
                x1 = padding + col * cell_size
                y1 = padding + 50 + row * cell_size
                x2 = x1 + cell_size
                y2 = y1 + cell_size

                if position in predicted_mine_positions:
                    fill_color = predicted_mine_color
                    status_text = "P-MINE"
                elif position in predicted_safe_positions:
                    fill_color = predicted_safe_color
                    status_text = "P-SAFE"
                elif position in mine_positions:
                    fill_color = mine_color
                    status_text = "MINE"
                elif position in revealed_positions:
                    fill_color = revealed_color
                    status_text = "SAFE"
                else:
                    fill_color = hidden_color
                    status_text = "?"

                draw.rectangle([x1, y1, x2, y2], fill=fill_color, outline=border_color, width=2)

                position_font_size = cell_size // 6
                try:
                    position_font = ImageFont.truetype("arial.ttf", position_font_size)
                except Exception:
                    position_font = ImageFont.load_default()

                position_text = str(position)
                bbox = draw.textbbox((0, 0), position_text, font=position_font)
                text_width = bbox[2] - bbox[0]

                pos_text_x = x1 + (cell_size - text_width) // 2
                pos_text_y = y1 + 5

                draw.text((pos_text_x, pos_text_y), position_text, fill=text_color, font=position_font)

                status_font_size = cell_size // 4
                try:
                    status_font = ImageFont.truetype("arial.ttf", status_font_size)
                except Exception:
                    status_font = ImageFont.load_default()

                bbox = draw.textbbox((0, 0), status_text, font=status_font)
                status_width = bbox[2] - bbox[0]
                status_height = bbox[3] - bbox[1]

                status_x = x1 + (cell_size - status_width) // 2
                status_y = y1 + (cell_size - status_height) // 2 + 5

                draw.text((status_x, status_y), status_text, fill=text_color, font=status_font)

        title_text = "Mines Game - 5x5 Grid"
        title_font_size = 20
        try:
            title_font = ImageFont.truetype("arial.ttf", title_font_size)
        except Exception:
            title_font = ImageFont.load_default()

        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (image_size[0] - title_width) // 2
        title_y = 15

        draw.text((title_x, title_y), title_text, fill='white', font=title_font)

        legend_y = image_size[1] - 90
        legend_font_size = 12

        try:
            legend_font = ImageFont.truetype("arial.ttf", legend_font_size)
        except Exception:
            legend_font = ImageFont.load_default()

        square_size = 15
        legend_start_x = padding
        legend_spacing = 120

        legend_items = []
        if predicted_safe_positions:
            legend_items.append((predicted_safe_color, "Predicted Safe"))
        if predicted_mine_positions:
            legend_items.append((predicted_mine_color, "Predicted Mine"))
        if revealed_positions:
            legend_items.append((revealed_color, "Revealed Safe"))
        if mine_positions:
            legend_items.append((mine_color, "Known Mine"))
        legend_items.append((hidden_color, "Unknown"))

        for idx, (color, label) in enumerate(legend_items):
            legend_x = legend_start_x + idx * legend_spacing
            draw.rectangle([legend_x, legend_y, legend_x + square_size, legend_y + square_size],
                           fill=color, outline=border_color)
            draw.text((legend_x + square_size + 5, legend_y), label, fill='white', font=legend_font)

        info_y = legend_y + square_size + 20
        revealed_count = len(revealed_positions)
        predicted_safe_count = len(predicted_safe_positions)
        predicted_mine_count = len(predicted_mine_positions)

        info_parts = []
        info_parts.append(f"Mines: {mines_count_value}")
        info_parts.append(f"Revealed: {revealed_count}/25")
        if predictions:
            info_parts.append(f"Predicted Safe: {predicted_safe_count}")
            info_parts.append(f"Predicted Mines: {predicted_mine_count}")

        info_text = " | ".join(info_parts)
        info_bbox = draw.textbbox((0, 0), info_text, font=legend_font)
        info_width = info_bbox[2] - info_bbox[0]
        info_x = (image_size[0] - info_width) // 2

        draw.text((info_x, info_y), info_text, fill='white', font=legend_font)

        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)

        return buffer
    
    def _format_game_info(self, game_data, predictions=None):
        """Format game information for caption"""
        if 'user' not in game_data or 'activeCasinoBet' not in game_data['user']:
            return "No active game data available"
        
        bet_data = game_data['user']['activeCasinoBet']
        if not bet_data:
            return "No active Mines game found"
        
        user_info = bet_data.get('user', {})
        state = bet_data.get('state', {})
        
        info_lines = [
            f"🎮 *Mines Game Status*",
            f"👤 Player: `{user_info.get('name', 'N/A')}`",
            f"💰 Bet Amount: `{bet_data.get('amount', 0)} {bet_data.get('currency', '').upper()}`",
            f"🎯 Mines Count: `{state.get('minesCount', 'N/A')}`",
            f"📊 Revealed Tiles: `{len(state.get('rounds', []))}`",
            f"⚡ Multiplier: `{bet_data.get('payoutMultiplier', 0)}x`"
        ]
        
        # Add revealed positions
        revealed_positions = []
        for round_data in state.get('rounds', []):
            if 'field' in round_data:
                revealed_positions.append(str(round_data['field']))
        
        if revealed_positions:
            info_lines.append(f"📍 Revealed Positions: `{', '.join(revealed_positions)}`")
        
        if predictions:
            predicted_safe = [str(pos) for pos in predictions.get('safe', [])]
            predicted_mines = [str(pos) for pos in predictions.get('mines', [])]

            if predicted_safe:
                info_lines.append(f"🔮 Predicted Safe Tiles ({len(predicted_safe)}): `{', '.join(predicted_safe)}`")
            if predicted_mines:
                info_lines.append(f"💣 Predicted Mines ({len(predicted_mines)}): `{', '.join(predicted_mines)}`")
            info_lines.append("⚠️ Predictions are experimental and not guaranteed.")

        info_lines.append("\nUse `/next` to refresh or send new API token")
        
        return "\n".join(info_lines)
    
    def run(self):
        """Start the bot"""
        if not self.app:
            self.initialize_bot()
        
        print("🤖 Stake Mines Bot is running...")
        print("Bot Token: 8422828727:AAEXp5wY3CHmqIFsBsipghDm7KBdtlgfIUU")
        print("Press Ctrl+C to stop the bot")
        self.app.run_polling()


# Main execution

if __name__ == "__main__":
    # Create and run the bot with your token
    try:
        bot = StakeMinesBot("8492553770:AAE9I4BmQYYWlWX9RXJOjgKj0h7PevTWjww")
        bot.run()
    except KeyboardInterrupt:
        print("\n👋 Bot stopped by user")
    except Exception as e:
        print(f"❌ Error starting bot: {e}")
