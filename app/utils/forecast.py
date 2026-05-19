import numpy as np


def predict_next(values):

    if len(values) < 2:

        return values[-1]

    x = np.arange(len(values))

    y = np.array(values)

    slope, intercept = np.polyfit(x, y, 1)

    next_value = slope * (len(values)) + intercept

    return round(next_value, 2)