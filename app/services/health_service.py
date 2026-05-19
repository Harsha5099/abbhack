def calculate_health(metrics):

    cpu = metrics.get("cpu_usage", 0)
    memory = metrics.get("memory_usage", 0)
    disk = metrics.get("disk_usage", 0)
    restarts = metrics.get("restarts", 0)

    score = 100

    score -= cpu * 0.25
    score -= memory * 0.25
    score -= disk * 0.20
    score -= restarts * 5

    return max(0, round(score))