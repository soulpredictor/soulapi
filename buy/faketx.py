# push_payment.py
# Simple script to POST a payment-like JSON to your WebhookInbox inbox
# so verify.html can find it.
#
# Usage: python push_payment.py
# (Edit TRACK_ID and TX_HASH below if you want different values)

import requests
import json
import sys

# ---------- CHANGE THESE IF NEEDED ----------
INBOX_ID = "NRtWLUgD"   # taken from your verify.html file
INBOX_URL = f"https://api.webhookinbox.com/i/{INBOX_ID}/in/"
TRACK_ID = input("TRACK ID : ")
TX_HASH = input("TX-HASH: ")
AMOUNT = input("AMOUNT : ")
# --------------------------------------------

# Construct a payload that matches what your verify.html expects.
# verify.html does: content.track_id, content.status, content.txs[0].tx_hash, content.txs[0].network, content.amount, content.currency
payload = {
    "track_id": TRACK_ID,
    "status": "Paid",                 # verify.html accepts 'Paid' or 'confirmed'
    "amount": AMOUNT,                    # string or number is ok; verify.html parses amount where needed
    "currency": "USD",
    "txs": [
        {
            "tx_hash": TX_HASH,
            "network": "Usdt",    # put a supported network string (etherscan is in the verify page list)
            "block": None
        }
    ],
    "note": "Posted by push_payment.py for verification testing"
}

headers = {
    "Content-Type": "application/json"
}

def post_item(url, data):
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=15)
        print("POST URL:", url)
        print("Status code:", resp.status_code)
        # WebhookInbox generally returns simple HTML or text "Ok". Print response text for debugging.
        print("Response text:", resp.text[:1000])
        if resp.status_code in (200, 201):
            print("\n[+] Success")
        else:
            print("\n[-] Error Unexpected response. If this fails, try again or check network/inbox TTL.")
    except Exception as e:
        print("[-] Error posting to inbox:", e)

if __name__ == "__main__":
    # Allow simple override via command-line args
    if len(sys.argv) >= 2:
        TRACK_ID = sys.argv[1]
        payload["track_id"] = TRACK_ID
    if len(sys.argv) >= 3:
        TX_HASH = sys.argv[2]
        payload["txs"][0]["tx_hash"] = TX_HASH

    print("Creating data")
    print("Use This Track Id", TRACK_ID)
    print("Use This Tx Hash", TX_HASH)
    print()
    post_item(INBOX_URL, payload)
