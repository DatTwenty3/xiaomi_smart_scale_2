import csv
import os
from datetime import datetime

file_path = 'user_data/user_data.csv'

def update_csv(user_info, measurements):
    # Danh sách tiêu đề cột
    headers = [
        "date", "name", "age", "gender", "height", "weight", "activity_factor",
        "bmi", "bmr", "tdee", "lean_body_mass", "fat_percentage",
        "water_percentage", "bone_mass", "muscle_mass", "protein_percentage", "visceral_fat", "ideal_weight"
    ]

    # Tạo một danh sách chứa dữ liệu cần ghi vào CSV
    row = [
        datetime.now().strftime("%d/%m/%Y"),  # Ngày hiện tại
        user_info['name'],
        measurements['age'],
        measurements['gender'],
        user_info['height'],
        measurements['weight'],
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
        measurements['iw']
    ]

    # Kiểm tra xem file có tồn tại không
    file_exists = os.path.isfile(file_path)

    # Mở file CSV và ghi dữ liệu vào
    with open(file_path, mode = 'a', newline = '') as file:
        writer = csv.writer(file)

        # Nếu file không tồn tại, ghi tiêu đề cột
        if not file_exists:
            writer.writerow(headers)

        # Ghi dòng dữ liệu
        writer.writerow(row)


user_info = {
    'name': 'Le Dat',
    'height': 166,
    'activity_factor': 1.55
}

measurements = {
    'gender':'male',
    'weight': 70.0,
    'age': 30,
    'bmi': 22.5,
    'bmr': 1500,
    'tdee': 2000,
    'lbm': 60.0,
    'fp': 15.0,
    'wp': 50.0,
    'bm': 5.0,
    'ms': 25.0,
    'pp': 18.0,
    'vf': 10.0,
    'iw': 65.0
}

update_csv(user_info, measurements)