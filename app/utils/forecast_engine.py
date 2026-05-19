import numpy as np
from sklearn.linear_model import (
    LinearRegression
)


def predict_next(values):

    if len(values) < 2:

        return values[-1]

    x = np.array(
        range(len(values))
    ).reshape(-1, 1)

    y = np.array(values)

    model = LinearRegression()

    model.fit(x, y)

    next_index = np.array(
        [[len(values)]]
    )

    prediction = model.predict(
        next_index
    )[0]

    return round(float(prediction), 2)