def estimate_cost(metrics):

    cpu = metrics.get("cpu_usage", 0)

    memory = metrics.get("memory_usage", 0)

    estimated_cost = (
        cpu * 0.05
        +
        memory * 0.03
    )

    return round(estimated_cost, 2)