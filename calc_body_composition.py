import calc_metrics as cm
import ai_predict as ap


def calculate_body_metrics(user_info, weight, age):
    # Tính BMI
    bmi = cm.get_bmi(user_info['height'], weight)
    # Dự đoán giới tính
    predicted_gender = ap.predict_gender(user_info['height'], weight)
    # Tính BMR và TDEE
    bmr, tdee = cm.get_bmr_tdee(weight, user_info['height'], age, predicted_gender, user_info['activity_factor'])
    # Tính LBM (Lean Body Mass)
    lbm = cm.get_lbm(user_info['height'], weight, predicted_gender)
    # Tính fat percentage (phần trăm mỡ)
    fp = ap.predict_body_fat(age, predicted_gender, user_info['height'], weight)
    # Tính water percentage (phần trăm nước)
    wp = cm.get_water_percentage(predicted_gender, age, weight, user_info['height'])
    # Tính bone mass (khối lượng xương)
    bm = cm.get_bone_mass(user_info['height'], weight, predicted_gender)
    # Tính muscle mass (khối lượng cơ)
    ms = cm.get_muscle_mass(predicted_gender, age, weight, user_info['height'])
    # Tính protein percentage (phần trăm protein)
    pp = cm.get_protein_percentage(predicted_gender, age, weight, user_info['height'], True)
    # Tính visceral fat (mỡ nội tạng)
    vf = cm.get_visceral_fat(predicted_gender, user_info['height'], weight, age)
    # Tính ideal weight (cân nặng lý tưởng)
    iw = cm.get_ideal_weight(predicted_gender, user_info['height'], True)
    # Trả về tất cả các kết quả dưới dạng dictionary
    return {
        'bmi': bmi,
        'gender': predicted_gender,
        'bmr': bmr,
        'tdee': tdee,
        'lbm': lbm,
        'Fat Percentage': fp,
        'Water Percentage': wp,
        'Bone Mass': bm,
        'Muscle Mass': ms,
        'Protein Percentage': pp,
        'Visceral Fat': vf,
        'Ideal Weight': iw
    }
