from math import floor
from datetime import datetime

# Tính tuổi dựa trên ngày sinh
def calculate_age(dob_str):
    dob = datetime.strptime(dob_str, "%d/%m/%Y")
    today = datetime.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age

def check_val_overflow(value, minimum, maximum):
    if value < minimum:
        return minimum
    elif value > maximum:
        return maximum
    else:
        return value


def get_bmi(height, weight):
    height_in_meters = height / 100.0
    return weight / (height_in_meters ** 2)


def get_bmr_tdee(weight, height, age, gender, activity_factor):
    if gender == 'male':
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    tdee = bmr * activity_factor
    return bmr, tdee


# Hàm đánh giá dựa trên chỉ số BMI
def evaluate_bmi(bmi, height, weight):
    if bmi < 18.5:
        weight_needed = 18.5 * (height / 100) ** 2 - weight
        # bmi_eval_label.config(fg="blue", font=("Helvetica", 12, "bold"))  # Thiếu cân
        return f"THIẾU CÂN. Bạn cần tăng khoảng {weight_needed:.2f} kg."
    elif 18.5 <= bmi < 24.9:
        # bmi_eval_label.config(fg="green", font=("Helvetica", 12, "bold"))  # Bình thường
        return "BÌNH THƯỜNG. Giữ nguyên cân nặng."
    elif 25 <= bmi < 29.9:
        weight_needed = weight - 24.9 * (height / 100) ** 2
        # bmi_eval_label.config(fg="orange", font=("Helvetica", 12, "bold"))  # Thừa cân
        return f"THỪA CÂN. Bạn cần giảm khoảng {weight_needed:.2f} kg."
    else:
        weight_needed = weight - 24.9 * (height / 100) ** 2
        # bmi_eval_label.config(fg="red", font=("Helvetica", 12, "bold"))  # Béo phì
        return f"BÉO PHÌ. Bạn cần giảm khoảng {weight_needed:.2f} kg."


# Hàm đánh giá dựa trên chỉ số BMR
def evaluate_bmr(bmr):
    return f"Cơ thể bạn cần {bmr:.0f} kcal/ngày để duy trì năng lượng cơ bản."


# Hàm đánh giá dựa trên chỉ số TDEE
def evaluate_tdee(tdee):
    return f"Bạn cần tiêu thụ khoảng {tdee:.0f} kcal/ngày để duy trì cân nặng với mức độ vận động hiện tại."


def get_lbm(height, weight, gender):
    if gender == 'male':
        return (0.32810 * weight) + (0.33929 * height) - 29.5336
    else:
        return (0.29569 * weight) + (0.41813 * height) - 43.2933


def get_fat_percentage(gender, age, weight, height):
    # Set a constant to remove from lbm
    if gender == 'female' and age <= 49:
        const = 9.25
    elif gender == 'female' and age > 49:
        const = 7.25
    else:
        const = 0.8

    # Calculate body fat percentage
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

    # Capping body fat percentage
    if fat_percentage > 63:
        fat_percentage = 75

    return check_val_overflow(fat_percentage, 5, 75)


def get_water_percentage(gender, age, weight, height):
    water_percentage = (100 - get_fat_percentage(gender, age, weight, height)) * 0.7

    if water_percentage <= 50:
        coefficient = 1.02
    else:
        coefficient = 0.98

    # Capping water percentage
    if water_percentage * coefficient >= 65:
        water_percentage = 75

    return check_val_overflow(water_percentage * coefficient, 35, 75)


def get_bone_mass(height, weight, gender):
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

    # Capping bone_mass
    if gender == 'female' and bone_mass > 5.1:
        bone_mass = 8
    elif gender == 'male' and bone_mass > 5.2:
        bone_mass = 8

    return check_val_overflow(bone_mass, 0.5, 8)


def get_muscle_mass(gender, age, weight, height):
    muscle_mass = weight - ((get_fat_percentage(gender, age, weight, height) * 0.01) * weight) - get_bone_mass(height,
                                                                                                               weight,
                                                                                                               gender)

    # Capping muscle mass
    if gender == 'female' and muscle_mass >= 84:
        muscle_mass = 120
    elif gender == 'male' and muscle_mass >= 93.5:
        muscle_mass = 120

    return check_val_overflow(muscle_mass, 10, 120)


def get_protein_percentage(gender, age, weight, height, orig=True):
    # Use original algorithm from mi fit (or legacy guess one)
    if orig:
        protein_percentage = (get_muscle_mass(gender, age, weight, height) / weight) * 100
        protein_percentage -= get_water_percentage(gender, age, weight, height)
    else:
        protein_percentage = 100 - (floor(get_fat_percentage(gender, age, weight, height) * 100) / 100)
        protein_percentage -= floor(get_water_percentage(gender, age, weight, height) * 100) / 100
        protein_percentage -= floor((get_bone_mass(height, weight, gender) / weight * 100) * 100) / 100

    return check_val_overflow(protein_percentage, 5, 32)


def get_visceral_fat(gender, height, weight, age):
    if gender == 'female':
        if weight > (13 - (height * 0.5)) * -1:
            subsubcalc = ((height * 1.45) + (height * 0.1158) * height) - 120
            sub_calc = weight * 500 / subsubcalc
            visceral_fat = (sub_calc - 6) + (age * 0.07)
        else:
            sub_calc = 0.691 + (height * -0.0024) + (height * -0.0024)
            visceral_fat = (((height * 0.027) - (sub_calc * weight)) * -1) + (age * 0.07) - age
    else:
        if height < weight * 1.6:
            sub_calc = ((height * 0.4) - (height * (height * 0.0826))) * -1
            visceral_fat = ((weight * 305) / (sub_calc + 48)) - 2.9 + (age * 0.15)
        else:
            sub_calc = 0.765 + height * -0.0015
            visceral_fat = (((height * 0.143) - (weight * sub_calc)) * -1) + (age * 0.15) - 5.0

    return check_val_overflow(visceral_fat, 1, 50)


def get_ideal_weight(gender, height, orig=True):
    # Uses mi fit algorithm (or holtek's one)
    if orig and gender == 'female':
        return (height - 70) * 0.6
    elif orig and gender == 'male':
        return (height - 80) * 0.7
    else:
        return check_val_overflow((22 * height) * height / 10000, 5.5, 198)

gender = 'male'
age = 25
weight = 77.7
height = 166
activity_factor = 1.55


def print_with_function_name(func, *args):
    result = func(*args)
    print(f"Calling {func.__name__} with result: {result}")


# print_with_function_name(get_bmi, height, weight)
# print_with_function_name(get_bmr_tdee, weight, height, age, gender, activity_factor)
# print_with_function_name(get_lbm, height, weight, gender)
# print_with_function_name(get_fat_percentage, gender, age, weight, height)
# print_with_function_name(get_water_percentage, gender, age, weight, height)
# print_with_function_name(get_bone_mass, height, weight, gender)
# print_with_function_name(get_muscle_mass, gender, age, weight, height)
# print_with_function_name(get_protein_percentage, gender, age, weight, height, True)
# print_with_function_name(get_visceral_fat, gender, height, weight, age)
print_with_function_name(get_ideal_weight, gender, height, True)
