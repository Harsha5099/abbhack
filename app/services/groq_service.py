from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

client = None
if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
    try:
        client = Groq(api_key=GROQ_API_KEY)
        print("[groq_service] ✓ Groq client initialized — LLM ready")
    except Exception as e:
        print(f"[groq_service] Groq init failed: {e}")
else:
    print("[groq_service] WARNING: GROQ_API_KEY not set")


def ask_groq(prompt: str) -> str:
    if client is None:
        return "AI summary unavailable — GROQ_API_KEY not configured."
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Groq API error: {str(e)}"
