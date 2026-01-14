import requests
import random
import time
from datetime import datetime, timedelta

API_URL = 'https://soulogapi.vercel.app/api/submit-review'

# Read names from names.txt (either 'Name,Handle' or just 'Name')
names = []
with open('names.txt', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        if ',' in line:
            parts = line.split(',')
            if len(parts) >= 2:
                names.append((parts[0].strip(), parts[1].strip()))
        else:
            handle = '@' + line.replace(' ', '').lower()
            names.append((line, handle))

# Read review texts from texts.txt (one per line)
reviews = []
with open('texts.txt', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line:
            reviews.append(line)

if not names:
    raise Exception('No names found in names.txt')
if not reviews:
    raise Exception('No review texts found in texts.txt')

for i in range(100):
    name, handle = random.choice(names)
    review = random.choice(reviews)
    rating = random.randint(3, 5)
    review_data = {
        "id": str(int(time.time() * 1000)) + str(i),
        "name": name,
        "telegram": handle,
        "content": review,
        "rating": rating,
        "date": (datetime.now() - timedelta(days=random.randint(0, 60))).isoformat(),
        "approved": True
    }
    try:
        resp = requests.post(API_URL, json=review_data, timeout=10)
        print(f"[{i+1}/100] {name} ({handle}): {resp.status_code} - {review[:40]}...")
        # Approve the review right after submission
        approve_data = {"reviewId": review_data["id"], "approve": True, "rejected": False}
        approve_url = API_URL.replace("submit-review", "update-review-status")
        approve_resp = requests.post(approve_url, json=approve_data, timeout=10)
        print(f"    Approved: {approve_resp.status_code}")
    except Exception as e:
        print(f"[{i+1}/100] ERROR: {e}")
    time.sleep(0.2)  # To avoid spamming too fast 