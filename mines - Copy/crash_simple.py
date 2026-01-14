import requests
import json
import asyncio
import random
import cloudscraper
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler
import time
from datetime import datetime
import threading
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import warnings
warnings.filterwarnings('ignore')

class CrashPredictor:
    """Simplified ML-based crash predictor using Random Forest only"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.rf_model = RandomForestRegressor(n_estimators=50, random_state=42, max_depth=8, min_samples_split=3)
        self.is_trained = False
        self.training_data = []
        
    def _create_features(self, crash_points, stats_dict):
        """Create features optimized for 1.00-2.10 range prediction"""
        # Limit to last 25 games for faster processing
        crash_points = crash_points[:25] if len(crash_points) > 25 else crash_points
        
        features = []
        
        # Focus on 1-2.1 range statistics
        low_range = [x for x in crash_points if 1.0 <= x <= 2.1]
        low_range_ratio = len(low_range) / len(crash_points) if crash_points else 0
        
        # Basic statistics (last 25) - focused on target range
        features.extend([
            stats_dict['avg'],
            min(stats_dict['avg'], 2.5),  # Cap average to avoid outliers
            stats_dict['lowest'],
            len([x for x in crash_points if x <= 1.5]) / len(crash_points) if crash_points else 0,  # Sub-1.5 ratio
            low_range_ratio  # Target range ratio
        ])
        
        # Recent trend features (last 10 games) - focused on 1-2.1
        recent_10 = crash_points[:10] if len(crash_points) >= 10 else crash_points
        recent_low = [x for x in recent_10 if 1.0 <= x <= 2.1]
        
        features.extend([
            np.mean(recent_10) if len(recent_10) > 0 else 1.5,
            np.std(recent_10) if len(recent_10) > 0 else 0,
            len(recent_low) / len(recent_10) if recent_10 else 0,  # Recent target range ratio
            recent_10[0] if recent_10 else 1.5,  # Latest crash
            recent_10[-1] if recent_10 else 1.5  # Oldest in recent 10
        ])
        
        # Pattern recognition features (last 10) - focused on 1-2.1 patterns
        if len(crash_points) >= 5:
            recent_5 = crash_points[:5]
            low_in_5 = [x for x in recent_5 if 1.0 <= x <= 2.1]
            
            features.extend([
                crash_points[0] - crash_points[1] if len(crash_points) >= 2 else 0,  # Latest change
                crash_points[0] - 1.5,  # Deviation from target center (1.5)
                len(low_in_5) / len(recent_5) if recent_5 else 0,  # Recent target range ratio
                len([x for x in recent_10 if x <= 1.3]) / len(recent_10) if recent_10 else 0   # Very low crash ratio
            ])
        else:
            features.extend([0, 0, 0, 0])
        
        # Moving averages (last 20) - focused on stability
        if len(crash_points) >= 20:
            recent_20 = crash_points[:20]
            ma_3 = np.mean(crash_points[:3])
            ma_5 = np.mean(crash_points[:5])
            ma_10 = np.mean(recent_10)
            
            # Focus on stability indicators
            features.extend([
                ma_3,
                ma_5,
                ma_10,
                np.std([ma_3, ma_5, ma_10]),  # MA stability
                len([x for x in recent_20 if 1.1 <= x <= 1.9]) / len(recent_20)  # Sweet spot ratio
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        # Volatility and momentum (last 20) - focused on 1-2.1 range
        if len(crash_points) >= 2:
            recent_20 = crash_points[:20] if len(crash_points) >= 20 else crash_points
            returns = np.diff(recent_20)
            
            # Focus on low-range volatility
            low_volatility = np.std([x for x in recent_20 if 1.0 <= x <= 2.1]) if any(1.0 <= x <= 2.1 for x in recent_20) else 0
            
            features.extend([
                low_volatility,  # Target range volatility
                np.mean(returns) if len(returns) > 0 else 0,  # Average momentum
                len([r for r in returns if r > 0]) / len(returns) if returns.size > 0 else 0,  # Positive change ratio
                np.percentile(recent_20, 25) if len(recent_20) > 0 else 1.0  # 25th percentile
            ])
        else:
            features.extend([0, 0, 0, 0])
        
        return np.array(features).reshape(1, -1)
    
    def train_models(self, crash_history):
        """Train Random Forest model optimized for 1.00-2.10 range prediction"""
        try:
            # Use only last 25 games for faster training
            crash_history = crash_history[-25:] if len(crash_history) > 25 else crash_history
            
            if len(crash_history) < 15:  # Reduced minimum requirement
                return False
            
            # Filter training data to focus on 1-2.1 range
            filtered_history = [x for x in crash_history if 1.0 <= x <= 5.0]  # Keep reasonable range
            if len(filtered_history) < 10:
                filtered_history = crash_history  # Fallback to original if too few filtered
            
            # Prepare training data - optimized for target range
            X_train = []
            y_train = []
            
            # Create sequences focusing on target range behavior
            for i in range(len(filtered_history) - 5):  # Use 5-game sequences
                sequence = filtered_history[i:i + 5]
                target = filtered_history[i + 5]
                
                # Skip sequences with too many extreme outliers
                target_range_ratio = len([x for x in sequence if 1.0 <= x <= 2.1]) / len(sequence)
                if target_range_ratio < 0.2 and len([x for x in crash_history if 1.0 <= x <= 2.1]) > 5:
                    continue  # Skip sequences with very few target range hits
                
                # Calculate stats for this sequence
                stats = {
                    'avg': np.mean(sequence),
                    'highest': np.max(sequence),
                    'lowest': np.min(sequence),
                    'total_games': len(sequence)
                }
                
                features = self._create_features(sequence, stats)
                X_train.append(features.flatten())
                y_train.append(target)
            
            if len(X_train) < 5:  # Reduced minimum requirement
                return False
            
            X_train = np.array(X_train)
            y_train = np.array(y_train)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X_train)
            
            # Train Random Forest - optimized for target range
            self.rf_model.fit(X_scaled, y_train)
            
            self.is_trained = True
            return True
            
        except Exception as e:
            print(f"Training error: {e}")
            return False
    
    def predict_next_crash(self, recent_crash_points, stats_dict):
        """Generate three-tier predictions based on actual data patterns"""
        try:
            if not self.is_trained or len(recent_crash_points) < 10:
                return None
            
            # Limit to last 25 games for faster processing
            recent_crash_points = recent_crash_points[:25] if len(recent_crash_points) > 25 else recent_crash_points
            
            # Random Forest prediction - primary model
            features = self._create_features(recent_crash_points, stats_dict)
            features_scaled = self.scaler.transform(features)
            rf_pred = self.rf_model.predict(features_scaled)[0]
            
            # Analyze recent patterns to generate realistic predictions
            safe_pred, medium_pred, high_pred = self._generate_three_tier_predictions(
                recent_crash_points, rf_pred, stats_dict
            )
            
            # Enhanced confidence calculation
            confidence = self._calculate_confidence_1_2_1(recent_crash_points, rf_pred)
            
            return {
                'safe_prediction': float(safe_pred),
                'medium_prediction': float(medium_pred), 
                'high_prediction': float(high_pred),
                'ensemble_prediction': float(rf_pred),
                'confidence': float(confidence),
                'trend': self._get_trend_analysis_1_2_1(recent_crash_points)
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return None
    
    def _generate_three_tier_predictions(self, recent_crash_points, ensemble_pred, stats_dict):
        """Generate safe, medium, and high predictions using mathematical analysis of 25 values"""
        try:
            # Use all 25 values for comprehensive analysis
            all_25 = recent_crash_points[:25]
            recent_10 = recent_crash_points[:10]
            recent_5 = recent_crash_points[:5]
            
            # Calculate comprehensive statistics
            avg_25 = np.mean(all_25)
            avg_10 = np.mean(recent_10)
            avg_5 = np.mean(recent_5)
            std_25 = np.std(all_25)
            median_25 = np.median(all_25)
            
            # Calculate percentiles for accurate prediction ranges
            percentile_25 = np.percentile(all_25, 25)
            percentile_50 = np.percentile(all_25, 50)
            percentile_75 = np.percentile(all_25, 75)
            percentile_90 = np.percentile(all_25, 90)
            
            # Analyze crash frequency in different ranges
            ultra_low = len([x for x in all_25 if x <= 1.2])  # Very conservative
            low_range = len([x for x in all_25 if 1.0 <= x <= 1.5])
            med_range = len([x for x in all_25 if 1.5 <= x <= 2.0])
            high_range = len([x for x in all_25 if x >= 2.0])
            
            # Calculate volatility and trend indicators
            volatility = std_25 / avg_25 if avg_25 > 0 else 0.3
            trend_slope = self._calculate_trend_slope(recent_10)
            
            # Dynamic prediction calculation based on actual data
            if ultra_low >= 8:  # Many ultra-low crashes (conservative market)
                safe_base = percentile_25 * 0.9
                medium_base = percentile_50 * 0.95
                high_base = percentile_75 * 0.98
            elif low_range >= 12:  # Predominantly low crashes
                safe_base = percentile_25 * 0.95
                medium_base = percentile_50 * 1.0
                high_base = percentile_75 * 1.05
            elif med_range >= 10:  # Many medium crashes
                safe_base = percentile_25 * 1.0
                medium_base = percentile_50 * 1.1
                high_base = percentile_75 * 1.15
            elif high_range >= 6:  # Significant high crashes
                safe_base = percentile_25 * 1.1
                medium_base = percentile_50 * 1.2
                high_base = percentile_75 * 1.25
            else:  # Mixed pattern - use ensemble prediction with percentile adjustments
                # Adjust ensemble prediction based on volatility
                if volatility < 0.25:  # Low volatility
                    adjustment = 0.9
                elif volatility < 0.45:  # Medium volatility
                    adjustment = 1.0
                else:  # High volatility
                    adjustment = 1.1
                
                safe_base = min(percentile_50, ensemble_pred * 0.8) * adjustment
                medium_base = percentile_50 * adjustment
                high_base = max(percentile_75, ensemble_pred * 1.2) * adjustment
            
            # Apply trend adjustments
            if trend_slope > 0.1:  # Upward trend
                trend_factor = 1.05
            elif trend_slope < -0.1:  # Downward trend
                trend_factor = 0.95
            else:  # Stable trend
                trend_factor = 1.0
            
            # Calculate final predictions with mathematical precision
            safe_pred = safe_base * trend_factor
            medium_pred = medium_base * trend_factor
            high_pred = high_base * trend_factor
            
            # Apply additional mathematical constraints
            # Ensure logical progression: safe < medium < high
            if safe_pred >= medium_pred:
                medium_pred = safe_pred * 1.2
            if medium_pred >= high_pred:
                high_pred = medium_pred * 1.15
            
            # Apply recent performance weighting (last 5 games influence)
            recent_weight = 0.2
            recent_avg_factor = avg_5 / avg_25 if avg_25 > 0 else 1.0
            
            safe_pred = safe_pred * (1 - recent_weight) + (safe_pred * recent_avg_factor) * recent_weight
            medium_pred = medium_pred * (1 - recent_weight) + (medium_pred * recent_avg_factor) * recent_weight
            high_pred = high_pred * (1 - recent_weight) + (high_pred * recent_avg_factor) * recent_weight
            
            # Final mathematical bounds checking
            safe_pred = max(1.05, min(1.65, safe_pred))      # Conservative range
            medium_pred = max(1.35, min(2.00, medium_pred))  # Balanced range  
            high_pred = max(1.55, min(2.10, high_pred))      # Aggressive range
            
            # Ensure minimum separation between predictions
            min_separation = 0.15
            if medium_pred - safe_pred < min_separation:
                medium_pred = safe_pred + min_separation
            if high_pred - medium_pred < min_separation:
                high_pred = medium_pred + min_separation
            
            return safe_pred, medium_pred, high_pred
            
        except Exception as e:
            print(f"Three-tier prediction error: {e}")
            # Enhanced fallback with actual data analysis
            try:
                if len(recent_crash_points) >= 10:
                    fallback_avg = np.mean(recent_crash_points[:10])
                    return (
                        max(1.05, min(1.65, fallback_avg * 0.8)),
                        max(1.35, min(2.00, fallback_avg * 1.0)),
                        max(1.55, min(2.10, fallback_avg * 1.2))
                    )
            except:
                pass
            return 1.25, 1.65, 1.95
    
    def _calculate_trend_slope(self, recent_points):
        """Calculate trend slope using linear regression"""
        try:
            if len(recent_points) < 3:
                return 0.0
            
            x = np.arange(len(recent_points))
            y = np.array(recent_points)
            
            # Calculate slope using numpy polyfit
            coefficients = np.polyfit(x, y, 1)
            slope = coefficients[0]
            
            # Normalize slope to reasonable range
            return max(-1.0, min(1.0, slope))
        except:
            return 0.0
    
    def _calculate_confidence_1_2_1(self, recent_crash_points, prediction):
        """Enhanced confidence calculation for 1.00-2.10 range"""
        if len(recent_crash_points) < 5:
            return 0.5
        
        # Focus on target range (1.00-2.10)
        target_range_points = [x for x in recent_crash_points[:15] if 1.0 <= x <= 2.1]
        target_ratio = len(target_range_points) / len(recent_crash_points[:15])
        
        # Calculate stability within target range
        if len(target_range_points) >= 3:
            target_volatility = np.std(target_range_points)
            target_stability = 1.0 / (1.0 + target_volatility)  # Higher stability = higher confidence
        else:
            target_stability = 0.5
        
        # Check if prediction is in sweet spot (1.1-1.9)
        sweet_spot_bonus = 0.1 if 1.1 <= prediction <= 1.9 else 0
        
        # Calculate final confidence
        base_confidence = target_ratio * target_stability + sweet_spot_bonus
        confidence = max(0.4, min(0.95, base_confidence))
        
        return confidence
    
    def _get_trend_analysis_1_2_1(self, recent_crash_points):
        """Enhanced trend analysis for 1.00-2.10 range"""
        if len(recent_crash_points) < 5:
            return "Insufficient data"
        
        # Focus on target range behavior
        recent_10 = recent_crash_points[:10]
        recent_5 = recent_crash_points[:5]
        
        # Count crashes in target range
        recent_target = [x for x in recent_5 if 1.0 <= x <= 2.1]
        previous_target = [x for x in recent_10[5:] if 1.0 <= x <= 2.1]
        
        target_ratio_recent = len(recent_target) / len(recent_5) if recent_5 else 0
        target_ratio_previous = len(previous_target) / len(recent_10[5:]) if len(recent_10) > 5 else target_ratio_recent
        
        # Analyze trend within target range
        if target_ratio_recent > target_ratio_previous * 1.2:
            return "Increasing target range hits 📈"
        elif target_ratio_recent < target_ratio_previous * 0.8:
            return "Decreasing target range hits 📉"
        elif target_ratio_recent > 0.7:
            return "High target range activity 🎯"
        elif target_ratio_recent < 0.3:
            return "Low target range activity ⚠️"
        else:
            return "Stable target range activity ➡️"

class StakeCrashBot:
    def __init__(self, bot_token: str = "7551174627:AAEx9MYD9owANRjKN3UiSlS1520mfEPSihc"):
        self.bot_token = bot_token
        self.api_url = "https://stake.ac/_api/graphql"
        self.user_tokens = {}
        self.user_preferences = {}  # Store user preferences like auto-fetch
        self.app = None
        self.auto_fetch_threads = {}  # Store auto-fetch threads per user
        self.predictors = {}  # Store predictors per user
        self.prediction_modes = {}  # Store prediction mode per user
        
        # Initialize cloudscraper with browser settings
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True,
                'mobile': False
            },
            delay=3,  # Delay between retries
            interpreter='js2py'
        )
        
        self.cookies = {}  # Store cookies
        
    def initialize_bot(self):
        """Initialize the Telegram bot"""
        self.app = Application.builder().token(self.bot_token).build()
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup bot command handlers"""
        self.app.add_handler(CommandHandler("start", self._start_command))
        self.app.add_handler(CommandHandler("history", self._history_command))
        self.app.add_handler(CommandHandler("stop", self._stop_command))
        self.app.add_handler(CommandHandler("auto", self._auto_command))
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self._handle_message))
        self.app.add_handler(CallbackQueryHandler(self._button_callback))

    async def _start_auto_fetch_mode(self, callback_query, user_id, prediction_mode):
        """Start auto-fetch with selected mode"""
        # Stop existing auto-fetch if running
        if user_id in self.auto_fetch_threads and self.auto_fetch_threads[user_id].is_alive():
            self.user_preferences[user_id]['auto_fetch'] = False
            self.auto_fetch_threads[user_id].join(timeout=2)
        
        # Set prediction mode
        self.prediction_modes[user_id] = prediction_mode
        
        # Initialize predictor if in prediction mode
        if prediction_mode:
            if user_id not in self.predictors:
                self.predictors[user_id] = CrashPredictor()
            mode_text = "🤖 Auto Fetch + Predictions"
            mode_desc = "with ML predictions"
        else:
            mode_text = "🔄 Auto Fetch Only"
            mode_desc = "without predictions"
        
        # Start auto-fetch thread
        self.user_preferences[user_id] = {'auto_fetch': True}
        thread = threading.Thread(target=self._auto_fetch_worker, args=(user_id, callback_query.message.chat.id))
        self.auto_fetch_threads[user_id] = thread
        thread.start()
        
        await callback_query.message.edit_text(
            f"✅ {mode_text} enabled!\n\n"
            f"I will check for new crash games every 0.5 seconds {mode_desc}.\n"
            f"{'ML models will be trained on historical data for predictions.' if prediction_mode else ''}\n"
            f"Use /stop to disable auto-fetch.",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("⏹ Stop Auto-Fetch", callback_data="disable_auto")]
            ])
        )
    
    async def _start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        welcome_text = """
🚀 **Stake Crash History Bot**

Welcome! I can fetch crash game history from stake.ac using GraphQL API.

**How to use:**
1. Send me your stake.ac API token (x-access-token)
2. Use /history [count] to fetch crash history (default: 20 games)
3. Use /auto to enable automatic fetching of latest crash values
4. Use /stop to disable auto-fetching

Your token is stored securely in memory.
        """
        await update.message.reply_text(welcome_text, parse_mode='Markdown')
    
    async def _handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming messages - expect API token"""
        user_id = update.message.from_user.id
        token = update.message.text.strip()
        
        # Basic token validation
        if len(token) < 10:
            await update.message.reply_text("❌ Invalid token format. Please provide a valid stake.ac API token.")
            return
        
        self.user_tokens[user_id] = token
        await update.message.reply_text(
            "✅ API token saved successfully!\n\n"
            "Use /history [count] to fetch crash history\n"
            "Use /auto to enable automatic fetching\n"
            "Use /stop to disable auto-fetching",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("📊 Get History", callback_data="get_history_20")],
                [InlineKeyboardButton("🔄 Enable Auto-Fetch", callback_data="enable_auto")]
            ])
        )
    
    async def _button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle button callbacks"""
        query = update.callback_query
        await query.answer()
        
        if query.data.startswith("get_history_"):
            count = int(query.data.split("_")[2])
            await self._fetch_and_send_crash_history(query.message, query.from_user.id, count)
        elif query.data == "enable_auto":
            await self._enable_auto_fetch(query.message, query.from_user.id)
        elif query.data == "disable_auto":
            await self._disable_auto_fetch(query.message, query.from_user.id)
        elif query.data == "refresh_history":
            await self._fetch_and_send_crash_history(query.message, query.from_user.id, 20)
        elif query.data == "auto_fetch_only":
            await self._start_auto_fetch_mode(query, query.from_user.id, False)
        elif query.data == "auto_fetch_predict":
            await self._start_auto_fetch_mode(query, query.from_user.id, True)
        elif query.data == "cancel_auto":
            await query.message.edit_text(
                "❌ Auto-fetch setup cancelled.",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Enable Auto-Fetch", callback_data="enable_auto")]
                ])
            )
    
    async def _history_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /history command"""
        user_id = update.message.from_user.id
        
        # Parse count from command arguments
        count = 20  # Default count
        if context.args:
            try:
                count = int(context.args[0])
                if count < 1 or count > 100:
                    await update.message.reply_text("❌ Count must be between 1 and 100. Using default 20.")
                    count = 20
            except ValueError:
                await update.message.reply_text("❌ Invalid count. Using default 20.")
        
        await self._fetch_and_send_crash_history(update.message, user_id, count)
    
    async def _auto_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /auto command to enable auto-fetching"""
        user_id = update.message.from_user.id
        await self._enable_auto_fetch(update.message, user_id)
    
    async def _stop_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stop command to disable auto-fetching"""
        user_id = update.message.from_user.id
        await self._disable_auto_fetch(update.message, user_id)

    async def _get_prediction(self, message, user_id):
        """Generate ML prediction for next crash - optimized for 25 games"""
        try:
            # Fetch recent crash data for prediction - only 25 games for speed
            crash_data = self._fetch_crash_history(self.user_tokens[user_id], 25)
            
            if not crash_data or 'crashGameList' not in crash_data or not crash_data['crashGameList']:
                await message.reply_text("❌ Could not fetch crash data for prediction")
                return
            
            # Get crash points and calculate stats
            all_crash_points = [float(game['crashpoint']) for game in crash_data['crashGameList']]
            
            if len(all_crash_points) < 15:  # Reduced minimum requirement
                await message.reply_text("❌ Need at least 15 historical games for prediction")
                return
            
            # Initialize predictor if needed
            if user_id not in self.predictors:
                self.predictors[user_id] = CrashPredictor()
            
            predictor = self.predictors[user_id]
            
            # Train models on historical data - faster training
            training_success = predictor.train_models(all_crash_points[::-1])
            
            if not training_success:
                await message.reply_text("❌ Could not train prediction models")
                return
            
            # Calculate stats for prediction
            stats_dict = {
                'avg': sum(all_crash_points)/len(all_crash_points),
                'highest': max(all_crash_points),
                'lowest': min(all_crash_points),
                'total_games': len(all_crash_points)
            }
            
            # Generate prediction
            prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
            
            if not prediction_result:
                await message.reply_text("❌ Could not generate prediction")
                return
            
            # Format prediction message
            safe_pred = prediction_result['safe_prediction']
            medium_pred = prediction_result['medium_prediction']
            high_pred = prediction_result['high_prediction']
            confidence = prediction_result['confidence'] * 100
            trend = prediction_result['trend']
            
            # Recent stats for context
            recent_5 = all_crash_points[:5]
            recent_avg = sum(recent_5) / len(recent_5)
            
            message_text = f"""
🤖 **THREE-TIER CRASH PREDICTIONS**

🟢 **Safe Play:** {safe_pred:.2f}x
🟡 **Medium Play:** {medium_pred:.2f}x
🔴 **High Play:** {high_pred:.2f}x

🎯 **Confidence Level:** {confidence:.1f}%
📈 **Current Trend:** {trend}

📈 **Historical Context (Last 25):**
• Recent 5 Average: {recent_avg:.2f}x
• Overall Average: {stats_dict['avg']:.2f}x
• Highest Recent: {max(recent_5):.2f}x
• Lowest Recent: {min(recent_5):.2f}x

🔍 **Model Intelligence:**
• Based on last 25 crash values
• Pattern recognition: {trend}
• Multi-tier risk assessment
• Real-time data analysis

⚡ **Technical Analysis:**
• Models Trained: {len(all_crash_points)} games
• Prediction Range: 1.00x - 2.10x
• Algorithms: Random Forest
• Framework: scikit-learn
"""
            
            await message.reply_text(message_text, parse_mode='Markdown')
            
        except Exception as e:
            print(f"Prediction error: {e}")
            await message.reply_text(f"❌ Prediction error: {str(e)}")
    
    async def _enable_auto_fetch(self, message, user_id):
        """Enable automatic fetching of latest crash values with prediction options"""
        if user_id not in self.user_tokens:
            await message.reply_text("❌ Please send your API token first.")
            return
        
        # Create prediction mode selection keyboard
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🔄 Auto Fetch Only", callback_data="auto_fetch_only"),
                InlineKeyboardButton("🤖 Auto Fetch + Predictions", callback_data="auto_fetch_predict")
            ],
            [InlineKeyboardButton("❌ Cancel", callback_data="cancel_auto")]
        ])
        
        await message.reply_text(
            "🤖 **Choose Auto-Fetch Mode:**\n\n"
            "🔄 **Auto Fetch Only**: Get new crash values every 0.5s\n"
            "🤖 **Auto Fetch + Predictions**: Get values + ML predictions\n\n"
            "The predictor uses Random Forest with 25 historical values",
            reply_markup=keyboard,
            parse_mode='Markdown'
        )
    
    async def _disable_auto_fetch(self, message, user_id):
        """Disable automatic fetching"""
        if user_id in self.auto_fetch_threads:
            self.user_preferences[user_id] = {'auto_fetch': False}
            # Thread will stop on next iteration check
            await message.reply_text(
                "⏹ Auto-fetching disabled!\n\n"
                "Use /auto to enable it again.",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔄 Enable Auto-Fetch", callback_data="enable_auto")]
                ])
            )
        else:
            await message.reply_text("ℹ Auto-fetching is not currently enabled.")
    
    def _auto_fetch_worker(self, user_id, chat_id):
        """Worker thread for auto-fetching latest crash values with ML predictions"""
        last_game_id = None
        prediction_mode = self.prediction_modes.get(user_id, False)
        
        # Initialize predictor if in prediction mode and not already exists
        if prediction_mode and user_id not in self.predictors:
            self.predictors[user_id] = CrashPredictor()
        
        predictor = self.predictors.get(user_id) if prediction_mode else None
        
        while True:
            try:
                # Check if auto-fetch is still enabled
                if user_id not in self.user_preferences or not self.user_preferences[user_id].get('auto_fetch', False):
                    break
                
                # Fetch latest crash data - get 25 values for faster prediction
                crash_data = self._fetch_crash_history(self.user_tokens[user_id], 25)
                
                if crash_data and 'crashGameList' in crash_data and crash_data['crashGameList']:
                    latest_game = crash_data['crashGameList'][0]
                    current_game_id = latest_game['id']
                    crashpoint = float(latest_game['crashpoint'])
                    start_time = latest_game['startTime']
                    
                    # Get all crash points for history and analysis
                    all_crash_points = [float(game['crashpoint']) for game in crash_data['crashGameList']]
                    
                    # Calculate stats for ML features
                    stats_dict = {
                        'avg': sum(all_crash_points)/len(all_crash_points),
                        'highest': max(all_crash_points),
                        'lowest': min(all_crash_points),
                        'total_games': len(all_crash_points)
                    }
                    
                    # Train models if in prediction mode and we have enough data
                    if prediction_mode and predictor and len(all_crash_points) >= 15:
                        # Train on all available historical data
                        predictor.train_models(all_crash_points[::-1])  # Reverse for chronological order
                    
                    # Only send message if this is a new game
                    if last_game_id is not None and current_game_id != last_game_id:
                        # Format the message for new game detection with history
                        try:
                            # Try to parse different date formats
                            if 'T' in start_time and 'Z' in start_time:
                                # ISO format with Z
                                formatted_time = datetime.fromisoformat(start_time.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S UTC')
                            elif 'GMT' in start_time:
                                # RFC format with GMT
                                formatted_time = datetime.strptime(start_time, '%a, %d %b %Y %H:%M:%S %Z').strftime('%Y-%m-%d %H:%M:%S UTC')
                            else:
                                # Try to parse as is
                                formatted_time = start_time
                        except:
                            # Fallback to original string
                            formatted_time = start_time
                        
                        # Generate prediction if in prediction mode
                        prediction_text = ""
                        if prediction_mode and predictor and predictor.is_trained:
                            prediction_result = predictor.predict_next_crash(all_crash_points, stats_dict)
                            if prediction_result:
                                safe_pred = prediction_result['safe_prediction']
                                medium_pred = prediction_result['medium_prediction']
                                high_pred = prediction_result['high_prediction']
                                confidence = prediction_result['confidence'] * 100
                                trend = prediction_result['trend']
                                
                                prediction_text = f"""
🤖 **THREE-TIER PREDICTIONS**

🟢 **Safe Play:** {safe_pred:.2f}x
🟡 **Medium Play:** {medium_pred:.2f}x  
🔴 **High Play:** {high_pred:.2f}x

🎯 **Confidence:** {confidence:.1f}%
📈 **Trend:** {trend}

🔍 **Model Analysis:**
• Based on last 25 crash values
• Pattern recognition: {trend}
• Risk assessment: Multi-tier approach
"""
                        
                        # Format the enhanced message
                        message = f"""
🚀 **NEW CRASH GAME DETECTED!**

📈 **Latest Crash:** {crashpoint:.2f}x
🆔 **Game ID:** {current_game_id}
⏰ **Start Time:** {formatted_time}

📊 **Last 25 Values (including new):**
`{' '.join([f'{cp:.2f}' for cp in all_crash_points])}`

📈 **Quick Stats:**
• Average: {stats_dict['avg']:.2f}x
• Highest: {stats_dict['highest']:.2f}x
• Lowest: {stats_dict['lowest']:.2f}x
• Total Games: {stats_dict['total_games']}
{prediction_text}
"""
                        
                        # Send message to user
                        asyncio.run_coroutine_threadsafe(
                            self.app.bot.send_message(chat_id=chat_id, text=message, parse_mode='Markdown'),
                            self.app.update_queue._loop
                        )
                    
                    # Update last game ID
                    last_game_id = current_game_id
                
                # Ultra-fast check - 0.5 seconds
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Auto-fetch error for user {user_id}: {e}")
                time.sleep(0.5)  # Wait and try again
    
    async def _fetch_and_send_crash_history(self, message, user_id, count=20):
        """Fetch crash history and send to user"""
        if user_id not in self.user_tokens:
            if hasattr(message, 'reply_text'):
                await message.reply_text("❌ Please send your stake.ac API token first.")
            else:
                await message.edit_text("❌ Please send your stake.ac API token first.")
            return
        
        token = self.user_tokens[user_id]
        
        try:
            # Send typing action
            if hasattr(message, 'reply_text'):
                await message.reply_chat_action(action='typing')
            else:
                await message.edit_reply_markup(reply_markup=None)
                await message.reply_chat_action(action='typing')
            
            # Fetch crash history from API
            crash_data = self._fetch_crash_history(token, count)
            
            if not crash_data or 'crashGameList' not in crash_data:
                error_msg = "❌ No crash game history found or API error."
                if hasattr(message, 'reply_text'):
                    await message.reply_text(error_msg)
                else:
                    await message.edit_text(error_msg)
                return
            
            # Format the response
            response_text = self._format_crash_history(crash_data, count)
            
            # Send formatted response
            if hasattr(message, 'reply_text'):
                await message.reply_text(
                    response_text,
                    parse_mode='Markdown',
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔄 Refresh", callback_data="refresh_history")],
                        [InlineKeyboardButton("🚀 Enable Auto-Fetch", callback_data="enable_auto")]
                    ])
                )
            else:
                await message.edit_text(
                    response_text,
                    parse_mode='Markdown',
                    reply_markup=InlineKeyboardMarkup([
                        [InlineKeyboardButton("🔄 Refresh", callback_data="refresh_history")],
                        [InlineKeyboardButton("🚀 Enable Auto-Fetch", callback_data="enable_auto")]
                    ])
                )
            
        except Exception as e:
            error_msg = f"❌ Error fetching crash history: {str(e)}"
            print(f"Detailed error: {repr(e)}")  # Debug print
            if hasattr(message, 'reply_text'):
                await message.reply_text(error_msg)
            else:
                await message.edit_text(error_msg)
    
    def _fetch_crash_history(self, access_token, limit=20):
        """Fetch crash game history from stake.ac GraphQL API"""
        # Desktop user agents for better compatibility
        desktop_user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
        ]
        
        # Select a random desktop user agent
        user_agent = random.choice(desktop_user_agents)
        
        # GraphQL query for crash game history
        graphql_query = {
            "query": """
                query CrashGameListHistory($limit: Int, $offset: Int) {
                    crashGameList(limit: $limit, offset: $offset) {
                        id
                        startTime
                        crashpoint
                        hash {
                            id
                            hash
                            __typename
                        }
                        __typename
                    }
                }
            """,
            "operationName": "CrashGameListHistory",
            "variables": {
                "limit": limit,
                "offset": 0
            }
        }
        
        # API request headers
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json',
            'Origin': 'https://stake.ac',
            'Referer': 'https://stake.ac/casino/games/crash',
            'x-access-token': access_token,
            'x-language': 'en',
            'User-Agent': user_agent
        }
        
        max_retries = 5
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                print(f"\nSending GraphQL request to stake.ac Crash API... (Attempt {attempt+1}/{max_retries})")
                print(f"Using User-Agent: {user_agent}")
                print(f"Requesting {limit} crash games")
                print("-" * 50)
                
                # Use cloudscraper to make the request
                response = self.scraper.post(
                    self.api_url,
                    json=graphql_query,
                    headers=headers,
                    timeout=30
                )
                
                print(f"Response Status Code: {response.status_code}")
                
                # Check if request was successful
                response.raise_for_status()
                
                # Parse and return JSON response
                json_response = response.json()
                
                if 'data' in json_response and 'crashGameList' in json_response['data']:
                    print(f"✅ Successfully fetched {len(json_response['data']['crashGameList'])} crash games")
                    return json_response['data']
                else:
                    print(f"⚠️ Unexpected response format: {json_response}")
                    return None
                
            except Exception as e:
                print(f"❌ Error: {e}")
                if hasattr(response, 'text'):
                    print(f"Response Text: {response.text[:500]}")
                
                if attempt < max_retries - 1:
                    # Switch user agent for next attempt
                    user_agent = random.choice(desktop_user_agents)
                    print(f"Switching to new User-Agent: {user_agent}")
                    
                    # Add some delay before retrying
                    wait_time = retry_delay * (2 ** attempt) + random.uniform(0.5, 1.5)
                    print(f"Waiting {wait_time:.2f} seconds before retrying...")
                    time.sleep(wait_time)
                    continue
                
                return None
    
    def _format_crash_history(self, crash_data, count):
        """Format crash game history for display"""
        if 'crashGameList' not in crash_data:
            return "❌ No crash game data available"
        
        crash_games = crash_data['crashGameList']
        
        if not crash_games:
            return "❌ No crash games found in history"
        
        # Format the response
        response = f"🚀 **Stake Crash Game History**\n\n"
        response += f"📊 **Showing {len(crash_games)} latest games:**\n\n"
        
        # Create a summary of crash points
        crash_points = [float(game['crashpoint']) for game in crash_games]
        
        # Add detailed game information
        for i, game in enumerate(crash_games[:10]):  # Show first 10 games in detail
            crashpoint = float(game['crashpoint'])
            game_id = game['id']
            start_time = game['startTime']
            
            # Format timestamp
            try:
                if 'T' in start_time and 'Z' in start_time:
                    # ISO format with Z
                    timestamp = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    time_str = timestamp.strftime('%H:%M:%S')
                elif 'GMT' in start_time:
                    # RFC format with GMT
                    timestamp = datetime.strptime(start_time, '%a, %d %b %Y %H:%M:%S %Z')
                    time_str = timestamp.strftime('%H:%M:%S')
                else:
                    # Try to parse as is
                    time_str = start_time
            except:
                time_str = start_time
            
            # Add emoji based on crash point
            if crashpoint >= 10.0:
                emoji = "🟢"  # High multiplier
            elif crashpoint >= 2.0:
                emoji = "🟡"  # Medium multiplier
            else:
                emoji = "🔴"  # Low multiplier
            
            response += f"{emoji} **{crashpoint:.2f}x** - ID: {game_id[-8:]} - {time_str} UTC\n"
        
        # Add summary statistics
        if len(crash_points) > 0:
            avg_crash = sum(crash_points) / len(crash_points)
            max_crash = max(crash_points)
            min_crash = min(crash_points)
            
            response += f"\n📈 **Statistics:**\n"
            response += f"Average: {avg_crash:.2f}x\n"
            response += f"Maximum: {max_crash:.2f}x\n"
            response += f"Minimum: {min_crash:.2f}x\n"
        
        # Add all crash points as a single line for easy copying
        crash_points_str = " ".join([f"{cp:.2f}" for cp in crash_points])
        response += f"\n📋 **All Values:**\n`{crash_points_str}`"
        
        return response
    
    def run(self):
        """Run the bot"""
        self.initialize_bot()
        print("🚀 Stake Crash History Bot is starting...")
        self.app.run_polling()

# Main execution
if __name__ == "__main__":
    bot = StakeCrashBot()
    bot.run()
