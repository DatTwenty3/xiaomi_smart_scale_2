import asyncio
import logging
import tkinter as tk
from tkinter import ttk
from tkinter import simpledialog
from datetime import datetime
import predict_gender as ai_predict
import metrics_calculate as mc

from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic

BODY_COMPOSITION_MEASUREMENT_UUID = "00002a9d-0000-1000-8000-00805f9b34fb"  # UUID for the Weight Measurement characteristic

logger = logging.getLogger(__name__)

# Khởi tạo GUI chính
root = tk.Tk()
root.withdraw()  # Ẩn cửa sổ chính lúc đầu


# Hộp thoại nhập thông tin cá nhân
class UserInfoDialog(simpledialog.Dialog):
    def body(self, master):
        self.title("Nhập thông tin cá nhân")

        tk.Label(master, text="Tên:").grid(row=0)
        tk.Label(master, text="Ngày sinh (dd/mm/yyyy):").grid(row=1)
        tk.Label(master, text="Chiều cao (cm):").grid(row=2)
        #tk.Label(master, text="Giới tính:").grid(row=3)
        tk.Label(master, text="Hệ số hoạt động:").grid(row=4)

        self.name_entry = tk.Entry(master)
        self.dob_entry = tk.Entry(master)
        self.height_entry = tk.Entry(master)

        self.name_entry.grid(row=0, column=1)
        self.dob_entry.grid(row=1, column=1)
        self.height_entry.grid(row=2, column=1)

        # Tạo danh sách thả xuống cho giới tính
        #self.gender_var = tk.StringVar()
        #self.gender_var.set("Nam")  # Giá trị mặc định
        #self.gender_menu = ttk.OptionMenu(master, self.gender_var, "Nam", "Nam", "Nữ")
        #self.gender_menu.grid(row=3, column=1)

        # Tạo danh sách thả xuống cho hệ số hoạt động
        self.activity_var = tk.StringVar()
        self.activity_var.set("Ít vận động (1.2)")  # Giá trị mặc định
        self.activity_menu = ttk.OptionMenu(master, self.activity_var,
                                            "Ít vận động",
                                            "Ít vận động",
                                            "Vận động nhẹ",
                                            "Vận động vừa",
                                            "Vận động nhiều",
                                            "Vận động rất nhiều")
        self.activity_menu.grid(row=4, column=1)

        return self.name_entry  # Set focus on tên nhập liệu ban đầu

    def apply(self):
        # Lấy giá trị từ danh sách hệ số hoạt động và chuyển thành số
        activity_factors = {
            "Ít vận động": 1.2,
            "Vận động nhẹ": 1.375,
            "Vận động vừa": 1.55,
            "Vận động nhiều": 1.725,
            "Vận động rất nhiều": 1.9
        }
        self.result = {
            "name": self.name_entry.get(),
            "dob": self.dob_entry.get(),
            "height": float(self.height_entry.get()),
            #"gender": self.gender_var.get().lower(),
            "activity_factor": activity_factors[self.activity_var.get()]
        }


# Hiển thị hộp thoại và lấy thông tin
def input_user_info():
    dialog = UserInfoDialog(root)
    return dialog.result


# Nhập thông tin cá nhân
user_info = input_user_info()


# Tính tuổi dựa trên ngày sinh
def calculate_age(dob_str):
    dob = datetime.strptime(dob_str, "%d/%m/%Y")
    today = datetime.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age


# Tính BMR và TDEE
def calculate_bmr_tdee(weight, height, age, gender, activity_factor):
    if gender == 'male':
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    tdee = bmr * activity_factor
    return bmr, tdee


# Tạo cửa sổ mới để hiển thị kết quả cân nặng
root = tk.Tk()
root.title("Weight and Body Composition")

# Thông tin nhập được
age = calculate_age(user_info['dob'])
name_label = tk.Label(root,
                       text=f"Tên: {user_info['name']}",
                       font=("Helvetica", 12),
                       anchor="w")  # Căn lề trái
name_label.pack(pady=5, padx=10, fill=tk.X)  # Thêm fill=tk.X

dob_label = tk.Label(root,
                     text=f"Ngày sinh: {user_info['dob']}",
                     font=("Helvetica", 12),
                     anchor="w")  # Căn lề trái
dob_label.pack(pady=5, padx=10, fill=tk.X)  # Thêm fill=tk.X

height_label = tk.Label(root,
                         text=f"Chiều cao: {user_info['height']:.0f} cm",
                         font=("Helvetica", 12),
                         anchor="w")  # Căn lề trái
height_label.pack(pady=5, padx=10, fill=tk.X)  # Thêm fill=tk.X

age_label = tk.Label(root,
                     text=f"Tuổi: {age} tuổi",
                     font=("Helvetica", 12),
                     anchor="w")  # Căn lề trái
age_label.pack(pady=5, padx=10, fill=tk.X)  # Thêm fill=tk.X

# Nhãn hiển thị cân nặng
weight_label = tk.Label(root, text="Cân nặng: -- kg", font=("Helvetica", 12),
                        anchor="w")  # Căn lề trái
weight_label.pack(pady=10, padx=10, fill=tk.X)  # Thêm fill=tk.X
# Nhãn hiển thị giới tính
gender_label = tk.Label(root, text="Giới tính (dự đoán): --", font=("Helvetica", 12),
                        anchor="w")  # Căn lề trái
gender_label.pack(pady=10, padx=10, fill=tk.X)  # Thêm fill=tk.X
# Nhãn hiển thị BMI, BMR, TDEE
bmi_label = tk.Label(root, text="BMI: --", font=("Helvetica", 12),
                     anchor="w")  # Căn lề trái
bmi_label.pack(pady=10, padx=10, fill=tk.X)
bmr_label = tk.Label(root, text="BMR: --", font=("Helvetica", 12),
                     anchor="w")  # Căn lề trái
bmr_label.pack(pady=10, padx=10, fill=tk.X)
tdee_label = tk.Label(root, text="TDEE: --", font=("Helvetica", 12),
                      anchor="w")  # Căn lề trái
tdee_label.pack(pady=10, padx=10, fill=tk.X)

async def find_miscale_device():
    return await BleakScanner().find_device_by_name("MI SCALE2")


# Nhãn hiển thị đánh giá
bmi_eval_label = tk.Label(root, text="", font=("Helvetica", 12))
bmi_eval_label.pack(pady=10)
bmr_eval_label = tk.Label(root, text="", font=("Helvetica", 12))
bmr_eval_label.pack(pady=10)
tdee_eval_label = tk.Label(root, text="", font=("Helvetica", 12))
tdee_eval_label.pack(pady=10)

# Hàm đánh giá dựa trên chỉ số BMI
def evaluate_bmi(bmi, height, weight):
    if bmi < 18.5:
        weight_needed = 18.5 * (height / 100) ** 2 - weight
        bmi_eval_label.config(fg="blue", font=("Helvetica", 12, "bold"))  # Thiếu cân
        return f"THIẾU CÂN. Bạn cần tăng khoảng {weight_needed:.2f} kg."
    elif 18.5 <= bmi < 24.9:
        bmi_eval_label.config(fg="green", font=("Helvetica", 12, "bold"))  # Bình thường
        return "BÌNH THƯỜNG. Giữ nguyên cân nặng."
    elif 25 <= bmi < 29.9:
        weight_needed = weight - 24.9 * (height / 100) ** 2
        bmi_eval_label.config(fg="orange", font=("Helvetica", 12, "bold"))  # Thừa cân
        return f"THỪA CÂN. Bạn cần giảm khoảng {weight_needed:.2f} kg."
    else:
        weight_needed = weight - 24.9 * (height / 100) ** 2
        bmi_eval_label.config(fg="red", font=("Helvetica", 12, "bold"))  # Béo phì
        return f"BÉO PHÌ. Bạn cần giảm khoảng {weight_needed:.2f} kg."
# Hàm đánh giá dựa trên chỉ số BMR
def evaluate_bmr(bmr):
    return f"Cơ thể bạn cần {bmr:.0f} kcal/ngày để duy trì năng lượng cơ bản."

# Hàm đánh giá dựa trên chỉ số TDEE
def evaluate_tdee(tdee):
    return f"Bạn cần tiêu thụ khoảng {tdee:.0f} kcal/ngày để duy trì cân nặng với mức độ vận động hiện tại."

# Cập nhật phần đánh giá sau khi tính toán
def update_evaluation(bmi, bmr, tdee, weight):
    bmi_eval_label.config(text=f"Bạn đang {evaluate_bmi(bmi, user_info['height'], weight)}")
    bmr_eval_label.config(text=f"{evaluate_bmr(bmr)}")
    tdee_eval_label.config(text=f"{evaluate_tdee(tdee)}")

def notification_handler(characteristic: BleakGATTCharacteristic, data: bytearray):
    """Parses body composition data and updates the GUI"""
    weight = int.from_bytes(data[1:3], byteorder='little') / 200.0
    if weight >= 10:
        print(f"Weight: {weight} kg")
        weight_label.config(text=f"Cân nặng: {weight:.2f} kg")  # Update the label in the GUI

        # Tính BMI
        #height_in_meters = user_info['height'] / 100.0
        #bmi = weight / (height_in_meters ** 2)
        bmi = mc.get_bmi(user_info['height'], weight)

        # Dự đoán giới tính
        predicted_gender = ai_predict.predict_gender(user_info['height'], weight)

        # Tính BMR và TDEE
        #bmr, tdee = calculate_bmr_tdee(weight, user_info['height'], age, predicted_gender, user_info['activity_factor'])
        bmr, tdee = mc.get_bmr_tdee(weight, user_info['height'], age, predicted_gender, user_info['activity_factor'])

        # Cập nhật các nhãn hiển thị
        if predicted_gender == "male":
            gender_label.config(text=f"Nam")
        else:
            gender_label.config(text=f"Nữ")
        bmi_label.config(text=f"BMI: {bmi:.2f}")
        bmr_label.config(text=f"BMR: {bmr:.0f} kcal/day")
        tdee_label.config(text=f"TDEE: {tdee:.0f} kcal/day")

        # Cập nhật đánh giá
        update_evaluation(bmi, bmr, tdee, weight)


async def connect_and_measure():
    disconnected_event = asyncio.Event()

    def disconnected_callback(_bleak_client: BleakClient):
        logger.info("disconnected callback")
        disconnected_event.set()

    device = await find_miscale_device()
    if device:
        logger.info(f"found device: {device.name}")
    if not device:
        logger.info("no device found")
        return

    client = BleakClient(device, disconnected_callback=disconnected_callback)

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
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    # Run the asyncio code in a separate thread so nó doesn't block the GUI
    import threading

    threading.Thread(target=run_async_main, daemon=True).start()

    # Start the Tkinter main loop
    root.mainloop()
