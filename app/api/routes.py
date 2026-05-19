from fastapi import APIRouter

from app.services.metrics_service import (
    get_metrics,
    get_logs,
    get_pods
)

from app.services.health_service import (
    calculate_health
)

from app.services.groq_service import (
    ask_groq
)

from app.services.history_service import (
    store_metrics,
    get_metric_history
)

from app.agents.orchestrator import (
    orchestrate
)

from app.utils.blast_radius import (
    calculate_blast_radius
)

from app.utils.cost_estimator import (
    estimate_cost
)
from app.utils.forecast_engine import (
    predict_next
)

router = APIRouter()


# =========================
# HEALTH CHECK
# =========================

@router.get("/health")

def health():

    return {

        "status": "KubeNexus AI Backend Running"
    }


# =========================
# GET ALL PODS
# =========================

@router.get("/pods")

def pods():

    return get_pods()


# =========================
# MAIN AI ANALYSIS
# =========================

@router.get("/analyze/{pod}")

def analyze_pod(pod: str):

    try:

        # Fetch live metrics
        metrics = get_metrics(pod)

        # Fetch logs
        logs = get_logs(pod)

        # Store metrics history
        store_metrics(
            pod,
            metrics
        )

        # Run AI orchestration
        orchestration = orchestrate(
            metrics,
            logs
        )

        # Calculate health score
        health_score = calculate_health(
            metrics
        )

        # Estimated cost
        estimated_cost = estimate_cost(
            metrics
        )

        # Final response
        return {

            "pod": pod,

            "health_score": health_score,

            "severity": orchestration["severity"],

            "root_cause": orchestration["root_cause"],

            "recommendation": orchestration["recommendation"],

            "ai_summary": orchestration["ai_summary"],

            "estimated_cost_usd": estimated_cost,

            "agents": orchestration["agents"]
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# METRIC HISTORY API
# =========================

@router.get("/history/{pod}")

def pod_history(pod: str):

    try:

        history = get_metric_history(
            pod
        )

        return {

            "pod": pod,

            "history": history
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# BLAST RADIUS API
# =========================

@router.get("/blast-radius/{pod}")

def blast_radius(pod: str):

    try:

        affected = calculate_blast_radius(
            pod
        )

        return {

            "failed_pod": pod,

            "affected_services": affected,

            "impact_level": len(affected)
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# COST ESTIMATION API
# =========================

@router.get("/cost/{pod}")

def pod_cost(pod: str):

    try:

        metrics = get_metrics(
            pod
        )

        cost = estimate_cost(
            metrics
        )

        return {

            "pod": pod,

            "estimated_cost_usd": cost
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =========================
# NLP AI QUERY API
# =========================

@router.get("/ask")

def ask_question(query: str):

    try:

        pods = get_pods()

        prompt = f"""
        You are KubeNexus AI,
        an advanced Kubernetes observability assistant.

        Current cluster pods:
        {pods}

        User Question:
        {query}

        Provide:
        1. Root cause
        2. Infrastructure impact
        3. Suggested remediation
        """

        answer = ask_groq(prompt)

        return {

            "query": query,

            "answer": answer
        }

    except Exception as e:

        return {
            "error": str(e)
        }
# =========================
# FORECAST API
# =========================

@router.get("/forecast/{pod}")

def forecast_pod(pod: str):

    try:

        history = get_metric_history(
            pod
        )

        if len(history) < 2:

            return {

                "pod": pod,

                "message": (
                    "Not enough historical data"
                )
            }

        cpu_values = [

            item["cpu"]

            for item in history
        ]

        memory_values = [

            item["memory"]

            for item in history
        ]

        predicted_cpu = predict_next(
            cpu_values
        )

        predicted_memory = predict_next(
            memory_values
        )

        return {

            "pod": pod,

            "predicted_cpu": predicted_cpu,

            "predicted_memory": predicted_memory
        }

    except Exception as e:

        return {
            "error": str(e)
        }