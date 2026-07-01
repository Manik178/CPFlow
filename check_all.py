import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
API_KEY = os.getenv("GROQ_API_KEY")

models = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "llama-3.1-8b-instant",
    "whisper-large-v3-turbo",
    "meta-llama/llama-4-scout-17b-16e-instruct"
]

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
        print(f"TPM Limit: {resp.headers.get('x-ratelimit-limit-tokens')}")
    else:
        print(f"Error {resp.status_code}: {resp.text}")

for m in models:
    check_model(m)
