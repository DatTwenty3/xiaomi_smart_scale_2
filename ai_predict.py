import pandas as pd
from joblib import load


def predict_gender(height_cm, weight_kg):
    """
    Dự đoán giới tính dựa vào chiều cao và cân nặng.
    Args:
        height_cm (float): Chiều cao (cm)
        weight_kg (float): Cân nặng (kg)
    Returns:
        str: 'male' hoặc 'female' nếu thành công, None nếu lỗi
    """
    try:
        model = load('pkl/weight-height.pkl')
        prediction = model.predict([[height_cm, weight_kg]])
        return str(prediction[0])
    except Exception as e:
        print(f"Lỗi dự đoán giới tính: {e}")
        return None


def predict_body_fat(age, gender, height_cm, weight_kg):
    """
    Dự đoán phần trăm mỡ cơ thể dựa vào tuổi, giới tính, chiều cao, cân nặng.
    Args:
        age (int): Tuổi
        gender (str): 'male' hoặc 'female'
        height_cm (float): Chiều cao (cm)
        weight_kg (float): Cân nặng (kg)
    Returns:
        float: Phần trăm mỡ cơ thể (làm tròn 2 số), None nếu lỗi
    """
    try:
        model = load('pkl/body_fat.pkl')
        gender_num = 1 if gender.lower() == 'male' else 0
        features = ["age", "gender", "height_cm", "weight_kg"]
        input_data = pd.DataFrame([[age, gender_num, height_cm, weight_kg]], columns=features)
        prediction = model.predict(input_data)
        return round(prediction[0], 2)
    except Exception as e:
        print(f"Lỗi dự đoán body fat: {e}")
        return None
