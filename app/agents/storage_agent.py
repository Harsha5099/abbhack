def analyze_storage(metrics):

    disk = metrics.get("disk_usage", 0)

    if disk > 80:

        return {
            "status": "critical",
            "issue": "PVC storage nearing exhaustion",
            "recommendation": "Increase persistent volume size"
        }

    elif disk > 60:

        return {
            "status": "warning",
            "issue": "Disk usage increasing",
            "recommendation": "Monitor storage growth"
        }

    return {
        "status": "healthy",
        "issue": "Storage stable",
        "recommendation": "No action needed"
    }