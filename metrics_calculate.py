from math import floor


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

