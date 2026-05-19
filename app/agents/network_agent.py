def analyze_network(metrics):

    rx = metrics.get("network_rx", 0)

    tx = metrics.get("network_tx", 0)

    total = rx + tx

    if total > 10000:

        return {
            "status": "critical",
            "issue": "Abnormal network traffic detected",
            "recommendation": "Inspect inter-service communication"
        }

    elif total > 5000:

        return {
            "status": "warning",
            "issue": "High network throughput",
            "recommendation": "Monitor traffic patterns"
        }

    return {
        "status": "healthy",
        "issue": "Network traffic normal",
        "recommendation": "No action needed"
    }