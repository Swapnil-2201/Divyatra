import urllib.request
import json
import time

endpoints = [
    ("Vite Frontend Dev Server", "http://localhost:5173/"),
    ("Backend API Health", "http://localhost:5001/api/health"),
    ("Crowd Intelligence Telemetry", "http://localhost:5001/api/crowd"),
    ("CCTV Telemetry Gateway", "http://localhost:5001/api/crowd/cctv-telemetry"),
    ("Edge Python CV Microservice Health", "http://127.0.0.1:8000/api/cctv/health"),
    ("Edge Python CV Telemetry", "http://127.0.0.1:8000/api/cctv/telemetry")
]

print("==================================================")
print("       DIVYATRA SYSTEM ENDPOINT VERIFICATION")
print("==================================================")

all_passed = True
for name, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            code = response.getcode()
            print(f"[PASS] {name:35s} -> Status: {code} ({url})")
            if "json" in response.headers.get('Content-Type', ''):
                data = json.loads(response.read().decode('utf-8'))
                if "data" in data and isinstance(data["data"], dict):
                    mode = data["data"].get("mode") or data["data"].get("dataSource")
                    print(f"       Mode / Source: {mode}")
                elif "mode" in data:
                    print(f"       Mode: {data['mode']} | Model: {data.get('model')} | Headcount: {data.get('headcount')} | FPS: {data.get('fps')} | Latency: {data.get('latencyMs')}ms")
    except Exception as e:
        print(f"[FAIL] {name:35s} -> Error: {e} ({url})")
        all_passed = False

print("\nSystem Health Verification: " + ("ALL SYSTEMS OPERATIONAL" if all_passed else "SOME SYSTEMS FAILED"))
