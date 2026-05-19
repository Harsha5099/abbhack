import numpy as np


class AnomalyEngine:

    def __init__(self):

        self.cpu_history = {}

        self.memory_history = {}

    # =========================
    # CPU ANOMALY
    # =========================

    def detect_cpu_anomaly(
        self,
        pod,
        cpu
    ):

        if pod not in self.cpu_history:

            self.cpu_history[pod] = []

        self.cpu_history[pod].append(cpu)

        history = self.cpu_history[pod]

        if len(history) < 5:

            return {

                "anomaly": False,

                "z_score": 0
            }

        mean = np.mean(history)

        std = np.std(history)

        z_score = (
            (cpu - mean)
            /
            (std + 1e-5)
        )

        return {

            "anomaly": abs(z_score) > 2,

            "z_score": round(z_score, 2)
        }

    # =========================
    # MEMORY ANOMALY
    # =========================

    def detect_memory_anomaly(
        self,
        pod,
        memory
    ):

        if pod not in self.memory_history:

            self.memory_history[pod] = []

        self.memory_history[pod].append(memory)

        history = self.memory_history[pod]

        if len(history) < 5:

            return {

                "anomaly": False,

                "z_score": 0
            }

        mean = np.mean(history)

        std = np.std(history)

        z_score = (
            (memory - mean)
            /
            (std + 1e-5)
        )

        return {

            "anomaly": abs(z_score) > 2,

            "z_score": round(z_score, 2)
        }


# GLOBAL ENGINE
anomaly_engine = AnomalyEngine()