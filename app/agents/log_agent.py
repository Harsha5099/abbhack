import re
from datetime import datetime


def analyze_logs(logs):

    # Convert logs to string
    logs_text = str(logs)

    # Known critical Kubernetes/application failures
    error_patterns = {

        "OOMKilled": r"oomkilled",

        "Connection Refused": r"connection refused",

        "Timeout": r"timeout",

        "Segmentation Fault": r"segmentation fault",

        "CrashLoopBackOff": r"crashloopbackoff",

        "Permission Denied": r"permission denied",

        "Disk Pressure": r"disk pressure",

        "Node Not Ready": r"node not ready",

        "Image Pull Error": r"imagepullbackoff",

        "DNS Failure": r"dns",

        "Killed Process": r"killed process"
    }

    detected_issues = []

    # Search log patterns
    for issue_name, pattern in error_patterns.items():

        matches = re.findall(
            pattern,
            logs_text,
            re.IGNORECASE
        )

        if matches:

            detected_issues.append({

                "issue": issue_name,

                "count": len(matches)
            })

    # Count generic errors/warnings
    error_count = len(
        re.findall(
            r"error",
            logs_text,
            re.IGNORECASE
        )
    )

    warning_count = len(
        re.findall(
            r"warn",
            logs_text,
            re.IGNORECASE
        )
    )

    info_count = len(
        re.findall(
            r"info",
            logs_text,
            re.IGNORECASE
        )
    )

    # Determine severity
    if detected_issues:

        severity = "critical"

        root_issue = detected_issues[0]["issue"]

        recommendation = generate_recommendation(root_issue)

    elif error_count > 10:

        severity = "warning"

        root_issue = "High error frequency detected"

        recommendation = (
            "Inspect application exceptions and service dependencies"
        )

    else:

        severity = "healthy"

        root_issue = "Logs operating normally"

        recommendation = "No action needed"

    # Return structured intelligence
    return {

        "status": severity,

        "issue": root_issue,

        "recommendation": recommendation,

        "detected_patterns": detected_issues,

        "log_statistics": {

            "errors": error_count,

            "warnings": warning_count,

            "info": info_count
        },

        "analyzed_at": str(datetime.utcnow())
    }


def generate_recommendation(issue):

    issue = issue.lower()

    if "oom" in issue:

        return (
            "Increase memory limits or investigate memory leak"
        )

    if "connection" in issue:

        return (
            "Check service availability and network communication"
        )

    if "timeout" in issue:

        return (
            "Inspect slow APIs or overloaded services"
        )

    if "segmentation" in issue:

        return (
            "Inspect native dependencies or application crashes"
        )

    if "crashloop" in issue:

        return (
            "Inspect startup configuration and container logs"
        )

    if "permission" in issue:

        return (
            "Verify RBAC permissions and filesystem access"
        )

    if "disk" in issue:

        return (
            "Increase storage or clean unused files"
        )

    if "image" in issue:

        return (
            "Verify image registry and image tag availability"
        )

    if "dns" in issue:

        return (
            "Inspect Kubernetes DNS/CoreDNS configuration"
        )

    return "Investigate logs and Kubernetes events"