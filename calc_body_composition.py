import calc_metrics as cm
import ai_predict as ap
import oneleg_timer as ot


def calculate_body_metrics(user_info, balance_time=None):
    """
    Tính toán các chỉ số thành phần cơ thể dựa trên thông tin người dùng.
    Args:
        user_info (dict): Thông tin người dùng (gender, weight, height, age, activity_factor)
        balance_time (float, optional): Thời gian thăng bằng đứng 1 chân (giây)
    Returns:
        dict: Kết quả các chỉ số sức khỏe
    """
    try:
        bmi = cm.get_bmi(user_info['height'], user_info['weight'])
        bmr, tdee = cm.get_bmr_tdee(user_info['weight'], user_info['height'], user_info['age'], user_info['gender'], user_info['activity_factor'])
        lbm = cm.get_lbm(user_info['height'], user_info['weight'], user_info['gender'])
        fp = ap.predict_body_fat(user_info['age'], user_info['gender'], user_info['height'], user_info['weight'])
        wp = cm.get_water_percentage(user_info['gender'], user_info['age'], user_info['weight'], user_info['height'])
        bm = cm.get_bone_mass(user_info['height'], user_info['weight'], user_info['gender'])
        ms = cm.get_muscle_mass(user_info['gender'], user_info['age'], user_info['weight'], user_info['height'])
        pp = cm.get_protein_percentage(user_info['gender'], user_info['age'], user_info['weight'], user_info['height'], True)
        vf = cm.get_visceral_fat(user_info['height'], user_info['weight'], user_info['age'])
        iw = cm.get_ideal_weight(user_info['gender'], user_info['height'], True)
        
        # Sử dụng thời gian thăng bằng từ tham số nếu có, nếu không thì để 0
        ols = balance_time if balance_time is not None else 0.0
        
        return {
            'gender': user_info['gender'],
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
            'ols': round(ols, 1)
        }
    except Exception as e:
        print(f"Lỗi tính toán thành phần cơ thể: {e}")
        return None

def weight_dont_duplicate(user_info, weight):
    """
    Kiểm tra cân nặng mới có trùng với cân nặng hiện tại không.
    Args:
        user_info (dict): Thông tin người dùng
        weight (float): Cân nặng mới
    Returns:
        bool
    """
    return weight != user_info['weight']

def is_meaningful_weight(user_info, weight):
    """
    Kiểm tra cân nặng mới có ý nghĩa (BMI > 12 và không trùng cân nặng cũ).
    Args:
        user_info (dict): Thông tin người dùng
        weight (float): Cân nặng mới
    Returns:
        bool
    """
    return cm.get_bmi(user_info['height'], weight) > 12 and weight_dont_duplicate(user_info, weight)
