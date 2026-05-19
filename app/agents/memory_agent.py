from app.utils.anomaly_engine import (
    anomaly_engine
)


def analyze_memory(metrics):

    pod = metrics.get("pod", "unknown")

    memory = metrics.get(
        "memory_usage",
        0
    )

    anomaly_result = (
        anomaly_engine.detect_memory_anomaly(
            pod,
            memory
        )
    )

    # =========================
    # ANOMALY DETECTED
    # =========================

    if anomaly_result["anomaly"]:

        return {

            "status": "critical",

            "issue": "Memory anomaly detected",

            "recommendation": (
                "Investigate memory leak"
            ),

            "memory_value": memory,

            "z_score": anomaly_result["z_score"]
        }

    # =========================
    # NORMAL THRESHOLDS
    # =========================

    if memory > 80:

        return {

            "status": "warning",

            "issue": "High memory usage",

            "recommendation": (
                "Monitor memory usage"
            ),

            "memory_value": memory
        }

    return {

        "status": "healthy",

        "issue": "Memory operating normally",

        "recommendation": "No action needed",

        "memory_value": memory
    }