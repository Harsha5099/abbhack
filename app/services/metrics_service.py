import requests


BASE_URL = (
    "https://payment-surfboard-think.ngrok-free.dev"
)


# =====================================
# FETCH ALL PODS
# =====================================

def get_pods():

    response = requests.get(
        f"{BASE_URL}/pods"
    )

    return response.json()


# =====================================
# FETCH METRICS
# =====================================

def get_metrics(pod):

    response = requests.get(
        f"{BASE_URL}/metrics/{pod}"
    )

    data = response.json()

    # =========================
    # CPU PARSING
    # =========================

    cpu_usage = 0

    try:

        cpu_usage = float(

            data["cpu"][0]["value"][1]

        )

    except Exception:

        cpu_usage = 0

    # =========================
    # MEMORY PARSING
    # =========================

    memory_usage = 0

    try:

        memory_bytes = float(

            data["ram"][0]["value"][1]

        )

        # Convert bytes → MB
        memory_usage = round(
            memory_bytes / (1024 * 1024),
            2
        )

    except Exception:

        memory_usage = 0

    # =========================
    # RETURN CLEAN METRICS
    # =========================

    return {

        "pod": pod,

        "cpu_usage": cpu_usage,

        "memory_usage": memory_usage,

        "disk_usage": 0,

        "network_rx": 0,

        "network_tx": 0
    }


# =====================================
# FETCH LOGS
# =====================================

def get_logs(pod):

    response = requests.get(
        f"{BASE_URL}/logs/{pod}"
    )

    return response.json()