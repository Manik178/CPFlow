import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
API_KEY = os.getenv("GROQ_API_KEY")

def check_model(model_name):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 10
    }
    resp = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
    print(f"--- {model_name} ---")
    if resp.status_code == 200:
        for k, v in resp.headers.items():
            if "ratelimit" in k.lower():
                print(f"{k}: {v}")
    else:
        print(f"Error {resp.status_code}: {resp.text}")

check_model("openai/gpt-oss-120b")
check_model("qwen/qwen3.6-27b")
check_model("llama-3.1-8b-instant")
