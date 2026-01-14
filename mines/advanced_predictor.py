import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

class AdvancedCrashPredictor:
    def __init__(self):
        self.safe_model = None
        self.medium_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_columns = []
        
    def create_features(self, crash_points):
        """Create advanced features from crash points"""
        if len(crash_points) < 15:  # Need more data for reliable features
            return None, None, None
            
        df = pd.DataFrame({'crash_point': crash_points})
        
        # Basic lag features (simpler approach)
        df['lag_1'] = df['crash_point'].shift(1)
        df['lag_2'] = df['crash_point'].shift(2)
        df['lag_3'] = df['crash_point'].shift(3)
        
        # Rolling statistics with fillna to handle NaN
        df['mean_3'] = df['crash_point'].rolling(window=3, min_periods=1).mean()
        df['mean_5'] = df['crash_point'].rolling(window=5, min_periods=1).mean()
        
        df['std_3'] = df['crash_point'].rolling(window=3, min_periods=1).std().fillna(0)
        df['std_5'] = df['crash_point'].rolling(window=5, min_periods=1).std().fillna(0)
        
        df['min_3'] = df['crash_point'].rolling(window=3, min_periods=1).min()
        df['max_3'] = df['crash_point'].rolling(window=3, min_periods=1).max()
        
        # Simple trend (difference between recent and older values)
        df['trend'] = df['crash_point'] - df['crash_point'].shift(3)
        
        # Volatility (coefficient of variation)
        df['volatility'] = df['std_3'] / df['mean_3'].replace(0, 1)
        
        # Position features
        df['position'] = range(len(df))
        df['position_norm'] = df['position'] / len(df)
        
        # Recent performance
        df['recent_high'] = df['crash_point'].rolling(window=5, min_periods=1).max()
        df['recent_low'] = df['crash_point'].rolling(window=5, min_periods=1).min()
        df['recent_range'] = df['recent_high'] - df['recent_low']
        
        # Fill any remaining NaN values
        df = df.fillna(method='bfill').fillna(method='ffill')
        
        if len(df) < 10:
            return None, None, None
            
        # Prepare features and targets
        feature_columns = [col for col in df.columns if col != 'crash_point']
        X = df[feature_columns].values
        y = df['crash_point'].values
        
        # Ensure all arrays have the same length
        min_length = min(len(X), len(y))
        X = X[:min_length]
        y = y[:min_length]
        
        return X, y, feature_columns
    
    def train_models(self, crash_points):
        """Train XGBoost and CatBoost models"""
        try:
            if len(crash_points) < 15:
                print(f"Not enough data for training: {len(crash_points)} points")
                return False
                
            X, y, feature_columns = self.create_features(crash_points)
            if X is None or y is None or feature_columns is None:
                print("Failed to create features")
                return False
                
            if len(X) < 10:
                print(f"Not enough features after processing: {len(X)} samples")
                return False
                
            self.feature_columns = feature_columns
            print(f"Training with {len(X)} samples and {len(feature_columns)} features")
            
            # Use all data for training (no split for small datasets)
            X_train, y_train = X, y
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            
            # Train Safe Model (1.00-1.60x range)
            safe_targets = np.clip(y_train, 1.00, 1.60)
            self.safe_model = xgb.XGBRegressor(
                n_estimators=50,  # Reduced for faster training
                max_depth=4,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
            self.safe_model.fit(X_train_scaled, safe_targets)
            
            # Train Medium Model (1.60-2.10x range)
            medium_targets = np.clip(y_train, 1.60, 2.10)
            self.medium_model = CatBoostRegressor(
                iterations=50,  # Reduced for faster training
                depth=4,
                learning_rate=0.1,
                random_seed=42,
                verbose=False
            )
            self.medium_model.fit(X_train_scaled, medium_targets)
            
            # Simple evaluation on training data
            safe_pred_train = self.safe_model.predict(X_train_scaled)
            medium_pred_train = self.medium_model.predict(X_train_scaled)
            
            safe_mse = mean_squared_error(safe_targets, safe_pred_train)
            medium_mse = mean_squared_error(medium_targets, medium_pred_train)
            
            print(f"✅ Safe Model MSE: {safe_mse:.4f}")
            print(f"✅ Medium Model MSE: {medium_mse:.4f}")
            print(f"✅ Models trained successfully!")
            
            self.is_trained = True
            return True
            
        except Exception as e:
            print(f"❌ Training error: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def predict_next_crash(self, crash_points, stats_dict):
        """Predict next crash using trained models"""
        try:
            if not self.is_trained or len(crash_points) < 10:
                print(f"Models not trained or insufficient data: trained={self.is_trained}, points={len(crash_points)}")
                return None
                
            X, _, _ = self.create_features(crash_points)
            if X is None or len(X) == 0:
                print("Failed to create features for prediction")
                return None
                
            # Use the most recent data point
            latest_features = X[-1:].reshape(1, -1)
            latest_features_scaled = self.scaler.transform(latest_features)
            
            # Get predictions
            safe_pred = self.safe_model.predict(latest_features_scaled)[0]
            medium_pred = self.medium_model.predict(latest_features_scaled)[0]
            
            # Ensure predictions are within specified ranges
            safe_pred = max(1.00, min(1.60, safe_pred))
            medium_pred = max(1.60, min(2.10, medium_pred))
            
            # Calculate confidence based on recent volatility
            recent_std = np.std(crash_points[:10]) if len(crash_points) >= 10 else 0.1
            confidence = max(0.5, min(0.95, 1.0 - (recent_std / 2.0)))
            
            # Determine trend
            if len(crash_points) >= 5:
                recent_trend = np.mean(crash_points[:3]) - np.mean(crash_points[3:6])
                if recent_trend > 0.1:
                    trend = "📈 Rising trend"
                elif recent_trend < -0.1:
                    trend = "📉 Falling trend"
                else:
                    trend = "➡️ Stable trend"
            else:
                trend = "➡️ Stable trend"
            
            print(f"🎯 Predictions: Safe={safe_pred:.2f}x, Medium={medium_pred:.2f}x")
            
            return {
                'safe_prediction': float(safe_pred),
                'medium_prediction': float(medium_pred),
                'confidence': float(confidence),
                'trend': trend
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            import traceback
            traceback.print_exc()
            return None


