import sqlite3

DATABASE_NAME = "kubenexus.db"


def get_connection():

    conn = sqlite3.connect(DATABASE_NAME)

    conn.row_factory = sqlite3.Row

    return conn


def initialize_database():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS metrics_history (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            pod TEXT,

            cpu REAL,

            memory REAL,

            disk REAL,

            network_rx REAL,

            network_tx REAL,

            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )

    """)

    conn.commit()

    conn.close()