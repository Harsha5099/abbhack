def generate_remediation(issue):

    issue = issue.lower()

    if "cpu" in issue:

        return "Scale deployment horizontally"

    if "memory" in issue:

        return "Increase memory limits"

    if "storage" in issue:

        return "Expand PVC volume"

    if "network" in issue:

        return "Inspect pod communication"

    if "logs" in issue:

        return "Check failing application services"

    return "Monitor cluster closely"