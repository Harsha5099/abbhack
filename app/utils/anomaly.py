import numpy as np


class AnomalyDetector:

    def __init__(self):

        self.cpu_history = []

        self.memory_history = []

    def detect_cpu_anomaly(self, cpu):

        self.cpu_history.append(cpu)

        if len(self.cpu_history) < 5:

            return False

        mean = np.mean(self.cpu_history)

        std = np.std(self.cpu_history)

        z_score = (cpu - mean) / (std + 1e-5)

        return abs(z_score) > 2

    def detect_memory_anomaly(self, memory):

        self.memory_history.append(memory)

        if len(self.memory_history) < 5:

            return False

        mean = np.mean(self.memory_history)

        std = np.std(self.memory_history)

        z_score = (memory - mean) / (std + 1e-5)

        return abs(z_score) > 2