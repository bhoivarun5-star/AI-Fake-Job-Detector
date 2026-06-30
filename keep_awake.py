import time
import requests
from datetime import datetime

# Render backend connection URL
URL = "https://ai-fake-job-detector-c6by.onrender.com/api/connect/"
INTERVAL = 30 # seconds

print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Keep-awake service initialized.")
print(f"Target URL: {URL}")
print(f"Interval: {INTERVAL} seconds\n")

while True:
    try:
        response = requests.get(URL, timeout=15)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Ping sent. Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Ping failed. Error: {e}")
    
    time.sleep(INTERVAL)
