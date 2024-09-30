from joblib import load
import pandas as pd


def predict_gender(height_cm, weight_kg):
    model_loaded = load('pkl/weight-height.pkl')

    prediction = model_loaded.predict([[height_cm, weight_kg]])

    return str(prediction[0])


def predict_body_fat(age, gender, height_cm, weight_kg):
    model_loaded = load('pkl/body_fat.pkl')

    if gender.lower() == 'male':
        gender = 1
    else:
        gender = 0

    features = ["age", "gender", "height_cm", "weight_kg"]

    input_data = pd.DataFrame([[age, gender, height_cm, weight_kg]], columns=features)
    prediction = model_loaded.predict(input_data)

    return round(prediction[0], 2)
