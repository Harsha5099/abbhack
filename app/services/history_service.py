from app.database import get_connection


def store_metrics(
    pod,
    metrics
):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        INSERT INTO metrics_history (

            pod,
            cpu,
            memory,
            disk,
            network_rx,
            network_tx

        )

        VALUES (?, ?, ?, ?, ?, ?)

    """, (

        pod,

        metrics.get("cpu_usage", 0),

        metrics.get("memory_usage", 0),

        metrics.get("disk_usage", 0),

        metrics.get("network_rx", 0),

        metrics.get("network_tx", 0)
    ))

    conn.commit()

    conn.close()


def get_metric_history(pod):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        SELECT *

        FROM metrics_history

        WHERE pod = ?

        ORDER BY timestamp DESC

        LIMIT 50

    """, (pod,))

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]