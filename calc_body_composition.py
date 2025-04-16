import calc_metrics as cm
import oneleg_standing_timer as ast
import ai_predict as ap
import oneleg_timer as ot

def calculate_body_metrics(user_info):
    # Tính BMI
    bmi = cm.get_bmi(user_info['height'], user_info['weight'])
    # Dự đoán giới tính
    predicted_gender = ap.predict_gender(user_info['height'], user_info['weight'])
    # Tính BMR và TDEE
    bmr, tdee = cm.get_bmr_tdee(user_info['weight'], user_info['height'], user_info['age'], predicted_gender,
                                user_info['activity_factor'])
    # Tính LBM (Lean Body Mass)
    lbm = cm.get_lbm(user_info['height'], user_info['weight'], predicted_gender)
    # Tính fat percentage (phần trăm mỡ)
    fp = ap.predict_body_fat(user_info['age'], predicted_gender, user_info['height'], user_info['weight'])
    # Tính water percentage (phần trăm nước)
    wp = cm.get_water_percentage(predicted_gender, user_info['age'], user_info['weight'], user_info['height'])
    # Tính bone mass (khối lượng xương)
    bm = cm.get_bone_mass(user_info['height'], user_info['weight'], predicted_gender)
    # Tính muscle mass (khối lượng cơ)
    ms = cm.get_muscle_mass(predicted_gender, user_info['age'], user_info['weight'], user_info['height'])
    # Tính protein percentage (phần trăm protein)
    pp = cm.get_protein_percentage(predicted_gender, user_info['age'], user_info['weight'], user_info['height'], True)
    # Tính visceral fat (mỡ nội tạng)
    vf = cm.get_visceral_fat(predicted_gender, user_info['height'], user_info['weight'], user_info['age'])
    # Tính ideal weight (cân nặng lý tưởng)
    iw = cm.get_ideal_weight(predicted_gender, user_info['height'], True)
    # Đo thời gian thăng bằng trên 1 chân
    ols = ot.one_leg_balance_detection()
    # Trả về tất cả các kết quả dưới dạng dictionary
    return {
        'gender': predicted_gender,
        'weight': user_info['weight'],
        'age': user_info['age'],
        'bmi': bmi,
        'bmr': bmr,
        'tdee': tdee,
        'lbm': lbm,
        'fp': fp,
        'wp': wp,
        'bm': bm,
        'ms': ms,
        'pp': pp,
        'vf': vf,
        'iw': iw,
        'ols': round(ols['session_duration'], 1)
    }


def weight_dont_duplicate(user_info, weight):
    return weight != user_info['weight']


def is_meaningful_weight(user_info, weight):
    return cm.get_bmi(user_info['height'], weight) > 12 and weight_dont_duplicate(user_info, weight)
