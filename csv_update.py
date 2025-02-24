import csv
import os
from datetime import datetime
import pandas as pd

file_path = 'user_data/user_data.csv'

def update_csv(user_info, measurements):
    headers = [
        "datetime", "name", "age", "gender", "height", "weight", "dob", "activity_factor",
        "bmi", "bmr", "tdee", "lean_body_mass", "fat_percentage",
        "water_percentage", "bone_mass", "muscle_mass", "protein_percentage", "visceral_fat", "ideal_weight", "oneleg_standing"
    ]

    row = [
        datetime.now().strftime("%d/%m/%Y %H:%M"),
        user_info['name'],
        measurements['age'],
        measurements['gender'],
        user_info['height'],
        measurements['weight'],
        user_info['dob'],
        user_info['activity_factor'],
        measurements['bmi'],
        measurements['bmr'],
        measurements['tdee'],
        measurements['lbm'],
        measurements['fp'],
        measurements['wp'],
        measurements['bm'],
        measurements['ms'],
        measurements['pp'],
        measurements['vf'],
        measurements['iw'],
        measurements['ols']
    ]

    file_exists = os.path.isfile(file_path)

    with open(file_path, mode = 'a', newline = '') as file:
        writer = csv.writer(file)

        if not file_exists:
            writer.writerow(headers)

        writer.writerow(row)
    print('Đã cập nhật vào file CSV !')
    return

# user_info = {
#     'name': 'Le Dat',
#     'height': 166,
#     'activity_factor': 1.55,
#     'dob': 230999
# }
#
# measurements = {
#     'gender':'male',
#     'weight': 70.0,
#     'age': 30,
#     'bmi': 22.5,
#     'bmr': 1500,
#     'tdee': 2000,
#     'lbm': 60.0,
#     'fp': 15.0,
#     'wp': 50.0,
#     'bm': 5.0,
#     'ms': 25.0,
#     'pp': 18.0,
#     'vf': 10.0,
#     'iw': 65.0
# }
#
# update_csv(user_info, measurements)
