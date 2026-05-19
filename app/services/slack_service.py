import requests

WEBHOOK = "YOUR_WEBHOOK_URL"

def send_alert(message):

    requests.post(
        WEBHOOK,
        json={"text": message}
    )