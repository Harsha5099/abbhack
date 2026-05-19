from app.agents.cpu_agent import analyze_cpu
from app.agents.memory_agent import analyze_memory
from app.agents.log_agent import analyze_logs
from app.agents.storage_agent import analyze_storage
from app.agents.network_agent import analyze_network

from app.services.groq_service import ask_groq


def orchestrate(metrics, logs):

    # Run all agents
    cpu_result = analyze_cpu(metrics)

    memory_result = analyze_memory(metrics)

    log_result = analyze_logs(logs)

    storage_result = analyze_storage(metrics)

    network_result = analyze_network(metrics)

    findings = [

        cpu_result,

        memory_result,

        log_result,

        storage_result,

        network_result
    ]

    # Critical findings
    critical_findings = [

        finding

        for finding in findings

        if finding["status"] == "critical"
    ]

    # Warning findings
    warning_findings = [

        finding

        for finding in findings

        if finding["status"] == "warning"
    ]

    # Root cause logic
    if critical_findings:

        severity = "critical"

        root_cause = critical_findings[0]["issue"]

        recommendation = critical_findings[0]["recommendation"]

    elif warning_findings:

        severity = "warning"

        root_cause = warning_findings[0]["issue"]

        recommendation = warning_findings[0]["recommendation"]

    else:

        severity = "healthy"

        root_cause = "System healthy"

        recommendation = "No action needed"

    # Default AI summary
    ai_summary = "AI summary unavailable"

    # AI Prompt
    prompt = f"""
    Analyze this Kubernetes pod issue.

    CPU Analysis:
    {cpu_result}

    Memory Analysis:
    {memory_result}

    Log Analysis:
    {log_result}

    Storage Analysis:
    {storage_result}

    Network Analysis:
    {network_result}

    Explain:
    1. Root cause
    2. Severity
    3. Business impact
    4. Recommended remediation
    """

    # Groq AI call
    try:

        ai_summary = ask_groq(prompt)

    except Exception as e:

        ai_summary = f"Groq AI error: {str(e)}"

    # Final response
    return {

        "severity": severity,

        "root_cause": root_cause,

        "recommendation": recommendation,

        "ai_summary": ai_summary,

        "agents": {

            "cpu": cpu_result,

            "memory": memory_result,

            "logs": log_result,

            "storage": storage_result,

            "network": network_result
        }
    }