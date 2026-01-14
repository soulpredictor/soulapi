#!/usr/bin/env python3
"""
Crash Prediction Server Startup Script
Run this script to start the crash prediction server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def start_server():
    """Start the crash prediction server"""
    print("🚀 Starting Crash Prediction Server...")
    try:
        subprocess.run([sys.executable, "crash_server.py"])
    except KeyboardInterrupt:
        print("\n⏹ Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    print("🎯 Soul Crash Predictor Server")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("crash_server.py"):
        print("❌ Please run this script from the mines directory")
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Start server
    start_server()
