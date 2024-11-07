import asyncio
import logging
import threading
import tkinter as tk
import calc_metrics as cm
import csv_update as cu
import pandas as pd
import calc_body_composition as cbc
import info_user as iu
import ai_recommendations as ai_rcm
import data_parser as parser
from ai_voice import read_recommend_vietnamese
from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic
from tkinter import ttk
from tkinter import simpledialog


#DEVICE_NAME = 'MI SCALE2'
#BODY_COMPOSITION_MEASUREMENT_UUID = '00002a9d-0000-1000-8000-00805f9b34fb'  # UUID for the Weight Measurement
# characteristic Mi Scale 2

DEVICE_NAME = 'Crenot Gofit S2'
BODY_COMPOSITION_MEASUREMENT_UUID = '0000FFB2-0000-1000-8000-00805F9B34FB'  # UUID for the Weight Measurement
# characteristic Crenot Gofit S2

logger = logging.getLogger(__name__)

root = tk.Tk()
root.withdraw()

health_data = iu.HealthDataManager()


class UserInfoDialog(simpledialog.Dialog):
    def body(self, master):
        self.title("Nhập thông tin cá nhân")

        tk.Label(master, text = "Tạo mới hoặc chọn tên người dùng:").grid(row = 0, column = 0)

        # Tạo danh sách tên từ file CSV, loại bỏ tên trùng
        self.user_data = pd.read_csv('user_data/user_data.csv')
        self.user_data = self.user_data.drop_duplicates(subset = 'name')  # Loại bỏ tên trùng
        self.names = self.user_data['name'].tolist()

        # Tạo ComboBox để chọn tên người dùng
        self.name_var = tk.StringVar()
        self.name_menu = ttk.Combobox(master, textvariable = self.name_var, values = self.names)
        self.name_menu.grid(row = 0, column = 1)
        self.name_menu.bind("<<ComboboxSelected>>", self.on_name_select)

        # Các trường nhập liệu khác
        tk.Label(master, text = "Ngày sinh (dd/mm/yyyy):").grid(row = 1)
        tk.Label(master, text = "Chiều cao (cm):").grid(row = 2)
        tk.Label(master, text = "Hệ số hoạt động:").grid(row = 3)

        self.dob_entry = tk.Entry(master)
        self.height_entry = tk.Entry(master)

        self.dob_entry.grid(row = 1, column = 1)
        self.height_entry.grid(row = 2, column = 1)

        # Tạo danh sách thả xuống cho hệ số hoạt động
        self.activity_var = tk.StringVar()
        self.activity_var.set("Ít vận động")  # Giá trị mặc định
        self.activity_menu = ttk.OptionMenu(master, self.activity_var,
                                            "Ít vận động",
                                            "Ít vận động",
                                            "Vận động nhẹ",
                                            "Vận động vừa",
                                            "Vận động nhiều",
                                            "Vận động rất nhiều")
        self.activity_menu.grid(row = 3, column = 1)

        return self.name_menu  # Set focus on ComboBox

    def on_name_select(self, event):
        selected_name = self.name_var.get()
        user_info = self.user_data[self.user_data['name'] == selected_name]

        if not user_info.empty:
            self.dob_entry.delete(0, tk.END)
            self.height_entry.delete(0, tk.END)

            # Điền thông tin tương ứng
            self.dob_entry.insert(0, user_info['dob'].values[0])
            self.height_entry.insert(0, int(user_info['height'].values[0]))
            # Cập nhật hệ số hoạt động tương ứng
            activity_mapping = {
                1.2: "Ít vận động",
                1.375: "Vận động nhẹ",
                1.55: "Vận động vừa",
                1.725: "Vận động nhiều",
                1.9: "Vận động rất nhiều"
            }
            activity_factor = user_info['activity_factor'].values[0]
            self.activity_var.set(activity_mapping[activity_factor])

    def apply(self):
        activity_factors = {
            "Ít vận động": 1.2,
            "Vận động nhẹ": 1.375,
            "Vận động vừa": 1.55,
            "Vận động nhiều": 1.725,
            "Vận động rất nhiều": 1.9
        }
        self.result = {
            "name": self.name_var.get(),
            "dob": self.dob_entry.get(),
            "height": int(self.height_entry.get()),
            "weight": 75.70,
            "age": cm.calculate_age(self.dob_entry.get()),
            "activity_factor": activity_factors[self.activity_var.get()]
        }


def input_user_info():
    dialog = UserInfoDialog(root)
    return dialog.result


health_data.set_user_info(input_user_info())
user_info = health_data.get_user_info()


###########################################TEST CALULATOR AREA#######################################################
# body_composition = cbc.calculate_body_metrics(user_info)
# measurements = {
#     'gender': body_composition['gender'],
#     'weight': user_info['weight'],
#     'age': user_info['age'],
#     'bmi': body_composition['bmi'],
#     'bmr': body_composition['bmr'],
#     'tdee': body_composition['tdee'],
#     'lbm': body_composition['lbm'],
#     'fp': body_composition['Fat Percentage'],
#     'wp': body_composition['Water Percentage'],
#     'bm': body_composition['Bone Mass'],
#     'ms': body_composition['Muscle Mass'],
#     'pp': body_composition['Protein Percentage'],
#     'vf': body_composition['Visceral Fat'],
#     'iw': body_composition['Ideal Weight']
# }
# print(ai_rcm.ai_health_recommendations(measurements))
# #cu.update_csv(user_info, measurements)
#
# health_data.set_body_composition(body_composition)
# health_data.set_measurements(measurements)
# print(health_data.get_measurements())
###########################################TEST CALULATOR AREA#######################################################

async def find_scale_device():
    return await BleakScanner().find_device_by_name(DEVICE_NAME)


def notification_handler(characteristic: BleakGATTCharacteristic, data: bytearray):

    weight = parser.data_parser(data, DEVICE_NAME)

    if cbc.is_meaningful_weight(user_info, weight):
        user_info['weight'] = weight
        print(f"Cân nặng: {user_info['weight']} kg")
        ###########################################CALULATOR AREA#######################################################
        body_composition = cbc.calculate_body_metrics(user_info)
        health_data.set_body_composition(body_composition)
        #CSV file update and AI recommendations
        cu.update_csv(user_info, health_data.get_body_composition())
        ai_recommend = ai_rcm.ai_health_recommendations(health_data.get_body_composition())
        print(ai_recommend)
        read_recommend_vietnamese(ai_recommend)
        ###########################################CALULATOR AREA#######################################################

async def connect_and_measure():
    disconnected_event = asyncio.Event()

    def disconnected_callback(_bleak_client: BleakClient):
        logger.info("disconnected callback")
        disconnected_event.set()

    device = await find_scale_device()
    if device:
        logger.info(f"found device: {device.name}")
    if not device:
        logger.info("no device found")
        return

    client = BleakClient(device, disconnected_callback = disconnected_callback)

    async with client:
        await client.start_notify(
            BODY_COMPOSITION_MEASUREMENT_UUID, notification_handler
        )
        await disconnected_event.wait()


async def main():
    logger.info("starting scan")
    while True:
        await connect_and_measure()
        logger.info("restarting scan")


def run_async_main():
    loop = asyncio.new_event_loop()  # Create a new event loop
    asyncio.set_event_loop(loop)  # Set the new loop as the current event loop
    loop.run_until_complete(main())  # Run the program


if __name__ == "__main__":
    logging.basicConfig(
        level = logging.INFO,
        format = "%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    threading.Thread(target = run_async_main, daemon = True).start()

    try:
        root.mainloop()
    except KeyboardInterrupt:
        logger.info("Application terminated by user")
    finally:
        logger.info("Cleaning up resources")
