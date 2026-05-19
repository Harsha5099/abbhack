from app.utils.anomaly_engine import (
    anomaly_engine
)


def analyze_cpu(metrics):

    pod = metrics.get("pod", "unknown")

    cpu = metrics.get(
        "cpu_usage",
        0
    )

    anomaly_result = (
        anomaly_engine.detect_cpu_anomaly(
            pod,
            cpu
        )
    )

    # =========================
    # ANOMALY DETECTED
    # =========================

    if anomaly_result["anomaly"]:

        return {

            "status": "critical",

            "issue": "CPU anomaly detected",

            "recommendation": (
                "Investigate workload spike"
            ),

            "cpu_value": cpu,

            "z_score": anomaly_result["z_score"]
        }

    # =========================
    # NORMAL THRESHOLDS
    # =========================

    if cpu > 80:

        return {

            "status": "warning",

            "issue": "High CPU usage",

            "recommendation": (
                "Monitor CPU consumption"
            ),

            "cpu_value": cpu
        }

    return {

        "status": "healthy",

        "issue": "CPU operating normally",

        "recommendation": "No action needed",

        "cpu_value": cpu
    }