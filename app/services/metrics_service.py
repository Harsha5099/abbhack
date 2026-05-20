import requests

BASE_URL = "https://payment-surfboard-think.ngrok-free.dev"

HEADERS = {"ngrok-skip-browser-warning": "true"}

TIMEOUT = 8  # seconds


# =====================================
# FETCH ALL PODS
# =====================================

def get_pods():
    try:
        response = requests.get(
            f"{BASE_URL}/pods",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        data = response.json()
        # Normalize — Member 1 may return list or dict
        if isinstance(data, list):
            return data
        return data.get("pods", data.get("items", []))
    except Exception as e:
        print(f"[metrics_service] get_pods failed: {e}")
        return []


# =====================================
# FETCH METRICS FOR A POD
# =====================================

def get_metrics(pod):
    try:
        response = requests.get(
            f"{BASE_URL}/metrics/{pod}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        data = response.json()

        # ── CPU ──────────────────────────────
        cpu_usage = 0
        try:
            cpu_usage = float(data["cpu"][0]["value"][1])
        except Exception:
            cpu_usage = float(data.get("cpu_usage", data.get("cpu", 0)))

        # ── Memory ───────────────────────────
        memory_usage = 0
        try:
            memory_bytes = float(data["ram"][0]["value"][1])
            memory_usage = round(memory_bytes / (1024 * 1024), 2)
        except Exception:
            memory_usage = float(data.get("memory_usage", data.get("memory", 0)))

        # ── Network ──────────────────────────
        network_rx = float(data.get("network_rx", data.get("rx", 0)))
        network_tx = float(data.get("network_tx", data.get("tx", 0)))

        # ── Disk ─────────────────────────────
        disk_usage = float(data.get("disk_usage", data.get("disk", 0)))

        return {
            "pod":          pod,
            "cpu_usage":    cpu_usage,
            "memory_usage": memory_usage,
            "disk_usage":   disk_usage,
            "network_rx":   network_rx,
            "network_tx":   network_tx,
        }

    except Exception as e:
        print(f"[metrics_service] get_metrics({pod}) failed: {e}")
        # Return safe defaults so the rest of the pipeline still runs
        return {
            "pod":          pod,
            "cpu_usage":    0,
            "memory_usage": 0,
            "disk_usage":   0,
            "network_rx":   0,
            "network_tx":   0,
        }


# =====================================
# FETCH LOGS FOR A POD
# =====================================

def get_logs(pod):
    try:
        response = requests.get(
            f"{BASE_URL}/logs/{pod}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[metrics_service] get_logs({pod}) failed: {e}")
        return {"logs": [], "message": "Log stream unavailable"}
