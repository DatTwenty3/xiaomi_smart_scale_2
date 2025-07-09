from math import floor
from datetime import datetime


def calculate_age(dob_str):
    """
    Tính tuổi dựa trên ngày sinh (định dạng dd/mm/yyyy).
    Args:
        dob_str (str): Ngày sinh dạng dd/mm/yyyy
    Returns:
        int: Tuổi
    """
    dob = datetime.strptime(dob_str, "%d/%m/%Y")
    today = datetime.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age

def check_val_overflow(value, minimum, maximum):
    """
    Giới hạn giá trị value trong khoảng [minimum, maximum].
    """
    if value < minimum:
        return minimum
    elif value > maximum:
        return maximum
    else:
        return value

def get_bmi(height, weight):
    """
    Tính chỉ số BMI.
    Args:
        height (float): Chiều cao (cm)
        weight (float): Cân nặng (kg)
    Returns:
        float: BMI
    """
    height_in_meters = height / 100
    return round(weight / (height_in_meters ** 2), 2)

def get_bmr_tdee(weight, height, age, gender, activity_factor):
    """
    Tính BMR và TDEE dựa trên thông tin cơ bản.
    Returns:
        tuple: (BMR, TDEE)
    """
    if gender == 'male':
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    tdee = bmr * activity_factor
    return round(bmr, 2), round(tdee, 2)

def evaluate_bmi(bmi, height, weight):
    """
    Đánh giá BMI và đưa ra khuyến nghị tăng/giảm cân.
    """
    if bmi < 18.5:
        weight_needed = 18.5 * (height / 100) ** 2 - weight
        return f"THIẾU CÂN. Bạn cần tăng khoảng {weight_needed:.2f} kg."
    elif 18.5 <= bmi < 24.9:
        return "BÌNH THƯỜNG. Giữ nguyên cân nặng."
    elif 25 <= bmi < 29.9:
        weight_needed = weight - 24.9 * (height / 100) ** 2
        return f"THỪA CÂN. Bạn cần giảm khoảng {weight_needed:.2f} kg."
    else:
        weight_needed = weight - 24.9 * (height / 100) ** 2
        return f"BÉO PHÌ. Bạn cần giảm khoảng {weight_needed:.2f} kg."

def evaluate_bmr(bmr):
    """
    Đánh giá BMR.
    """
    return f"Cơ thể bạn cần {bmr:.0f} kcal/ngày để duy trì năng lượng cơ bản."

def evaluate_tdee(tdee):
    """
    Đánh giá TDEE.
    """
    return f"Bạn cần tiêu thụ khoảng {tdee:.0f} kcal/ngày để duy trì cân nặng với mức độ vận động hiện tại."

def get_lbm(height, weight, gender):
    """
    Tính khối lượng cơ thể nạc (LBM).
    """
    if gender == 'male':
        lbm = (0.32810 * weight) + (0.33929 * height) - 29.5336
        return round(lbm, 2)
    else:
        lbm = (0.29569 * weight) + (0.41813 * height) - 43.2933
        return round(lbm, 2)

def get_fat_percentage(gender, age, weight, height):
    """
    Tính phần trăm mỡ cơ thể.
    """
    if gender == 'female' and age <= 49:
        const = 9.25
    elif gender == 'female' and age > 49:
        const = 7.25
    else:
        const = 0.8
    lbm = get_lbm(height, weight, gender)
    if gender == 'male' and weight < 61:
        coefficient = 0.98
    elif gender == 'female' and weight > 60:
        coefficient = 0.96
        if height > 160:
            coefficient *= 1.03
    elif gender == 'female' and weight < 50:
        coefficient = 1.02
        if height > 160:
            coefficient *= 1.03
    else:
        coefficient = 1.0
    fat_percentage = (1.0 - (((lbm - const) * coefficient) / weight)) * 100
    if fat_percentage > 63:
        fat_percentage = 75
    fat_percentage = round(fat_percentage, 2)
    return check_val_overflow(fat_percentage, 5, 75)

def get_water_percentage(gender, age, weight, height):
    """
    Tính phần trăm nước trong cơ thể.
    """
    water_percentage = (100 - get_fat_percentage(gender, age, weight, height)) * 0.7
    if water_percentage <= 50:
        coefficient = 1.02
    else:
        coefficient = 0.98
    if water_percentage * coefficient >= 65:
        water_percentage = 75
    water_percentage = water_percentage * coefficient
    water_percentage = round(water_percentage, 2)
    return check_val_overflow(water_percentage, 35, 75)

def get_bone_mass(height, weight, gender):
    """
    Tính khối lượng xương.
    """
    if gender == 'female':
        base = 0.245691014
    else:
        base = 0.18016894
    lbm = get_lbm(height, weight, gender)
    bone_mass = (base - (lbm * 0.05158)) * -1
    if bone_mass > 2.2:
        bone_mass += 0.1
    else:
        bone_mass -= 0.1
    if gender == 'female' and bone_mass > 5.1:
        bone_mass = 8
    elif gender == 'male' and bone_mass > 5.2:
        bone_mass = 8
    bone_mass = round(bone_mass, 2)
    return check_val_overflow(bone_mass, 0.5, 8)

def get_muscle_mass(gender, age, weight, height):
    """
    Tính khối lượng cơ.
    """
    muscle_mass = weight - ((get_fat_percentage(gender, age, weight, height) * 0.01) * weight) - get_bone_mass(height, weight, gender)
    if gender == 'female' and muscle_mass >= 84:
        muscle_mass = 120
    elif gender == 'male' and muscle_mass >= 93.5:
        muscle_mass = 120
    muscle_mass = round(muscle_mass, 2)
    return check_val_overflow(muscle_mass, 10, 120)

def get_protein_percentage(gender, age, weight, height, orig=True):
    """
    Tính phần trăm protein trong cơ thể.
    """
    if orig:
        protein_percentage = (get_muscle_mass(gender, age, weight, height) / weight) * 100
        protein_percentage -= get_water_percentage(gender, age, weight, height)
    else:
        protein_percentage = 100 - (floor(get_fat_percentage(gender, age, weight, height) * 100) / 100)
        protein_percentage -= floor(get_water_percentage(gender, age, weight, height) * 100) / 100
        protein_percentage -= floor((get_bone_mass(height, weight, gender) / weight * 100) * 100) / 100
    protein_percentage = round(protein_percentage, 2)
    return check_val_overflow(protein_percentage, 5, 32)

def get_visceral_fat(height, weight, age):
    """
    Tính mỡ nội tạng.
    """
    if height < weight * 1.6:
        sub_calc = ((height * 0.4) - (height * (height * 0.0826))) * -1
        visceral_fat = ((weight * 305) / (sub_calc + 48)) - 2.9 + (age * 0.15)
    else:
        sub_calc = 0.765 + height * -0.0015
        visceral_fat = (((height * 0.143) - (weight * sub_calc)) * -1) + (age * 0.15) - 5.0
    visceral_fat = round(visceral_fat, 2)
    return check_val_overflow(visceral_fat, 1, 50)

def get_ideal_weight(gender, height, orig=True):
    """
    Tính cân nặng lý tưởng.
    """
    if orig and gender == 'female':
        ideal_weight = (height - 70) * 0.6
        return round(ideal_weight, 2)
    elif orig and gender == 'male':
        ideal_weight = (height - 80) * 0.7
        return round(ideal_weight, 2)
    else:
        ideal_weight = (22 * height) * height / 10000
        ideal_weight = round(ideal_weight, 2)
        return check_val_overflow(ideal_weight, 5.5, 198)
