import sys
import os
import json

CODEBASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "VLEARN_QUIZ", "codebase"))
sys.path.insert(0, CODEBASE_DIR)

from quiz_engine.gemini_client import call_gemini, load_env_file

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "VLEARN_QUIZ", ".env"))
load_env_file(env_path)

models_to_test = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
]

print("=== KIỂM TRA MÔ HÌNH GEMINI API THẬT ===")
print("API Key:", os.environ.get("GEMINI_API_KEY", "")[:10] + "...")

for model_name in models_to_test:
    print(f"\n[TESTING] Model: {model_name}")
    try:
        res = call_gemini("Hãy trả về JSON {'status': 'ok'}", model=model_name)
        print(f"✅ THÀNH CÔNG [{model_name}]: {res['text'][:100]}")
    except Exception as e:
        print(f"❌ THẤT BẠI [{model_name}]: {e}")
