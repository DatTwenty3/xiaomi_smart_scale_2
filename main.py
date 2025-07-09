import asyncio
import logging
import threading
import sys
import tkinter as tk
from tkinter import ttk, simpledialog, messagebox
import random

import calc_metrics as cm
import csv_update as cu
import pandas as pd
import calc_body_composition as cbc
import info_user as iu
import ai_recommendations as ai_rcm
import data_parser as parser
import oneleg_standing_timer as ast
from mqtt_client_handler import MQTTClient
from ai_voice import read_recommend_vietnamese
from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic
from qr_scaner import scan_cccd_qr

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# Scale Device Configuration
DEVICE_NAME = 'Crenot Gofit S2'
BODY_COMPOSITION_MEASUREMENT_UUID = '0000FFB2-0000-1000-8000-00805F9B34FB'

# Alternative Mi Scale 2 Configuration (commented out)
# DEVICE_NAME = 'MI SCALE2'
# BODY_COMPOSITION_MEASUREMENT_UUID = '00002a9d-0000-1000-8000-00805f9b34fb'

# MQTT Configuration
MQTT_CONFIG = {
    'broker': "app.coreiot.io",
    'port': 1883,
    'username': "smart-scale",
    'password': "smart-scale",
    'client_id': "smart-scale",
    'topic': "v1/devices/me/telemetry"
}

# Testing Configuration
TESTING_CONFIG = {
    'enable_fake_weight': True,  # Set False to use real scale
    'weight_range': (50.0, 100.0),  # Min and Max fake weight in kg
    'measurement_delay': 3  # Delay in seconds between fake measurements
}

# Activity Level Mapping
ACTIVITY_LEVELS = {
    "Ít vận động": 1.2,
    "Vận động nhẹ": 1.375,
    "Vận động vừa": 1.55,
    "Vận động nhiều": 1.725,
    "Vận động rất nhiều": 1.9
}

# ==============================================================================
# INITIALIZATION
# ==============================================================================

logger = logging.getLogger(__name__)
root = tk.Tk()
root.withdraw()
health_data = iu.HealthDataManager()

# ==============================================================================
# USER INTERFACE
# ==============================================================================

class UserInfoDialog(simpledialog.Dialog):
    """
    Dialog nhập thông tin người dùng, hỗ trợ quét mã QR CCCD và nhập chiều cao, hệ số hoạt động.
    """
    def __init__(self, parent):
        self.cccd_data = None
        super().__init__(parent)

    def body(self, master):
        """
        Giao diện phẳng, không viền, không nổi khối.
        """
        self.title("Nhập thông tin cá nhân")

        # Style phẳng, không viền
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TFrame', background='#f4f6fb')
        style.configure('TLabel', background='#f4f6fb', font=("Segoe UI", 10))
        style.configure('Header.TLabel', font=("Segoe UI", 12, "bold"), background='#f4f6fb', foreground='#1976d2')
        style.configure('TButton', font=("Segoe UI", 10, "bold"), padding=8, relief="flat", background="#1976d2", foreground="white", borderwidth=0)
        style.map('TButton', background=[('active', '#1565c0')])
        style.configure('TEntry', padding=6, relief="flat", borderwidth=0)
        style.configure('TOptionMenu', padding=6, relief="flat", borderwidth=0)

        master.configure(bg='#f4f6fb')

        # Khung tổng (dùng Frame, không LabelFrame)
        container = ttk.Frame(master, style='TFrame', padding=(24, 24, 24, 16))
        container.pack(fill="both", expand=True)

        # Tiêu đề
        ttk.Label(container, text="Nhập thông tin cá nhân", style='Header.TLabel').pack(anchor="w", pady=(0, 18))

        # Khung quét CCCD
        cccd_frame = ttk.Frame(container, style='TFrame')
        cccd_frame.pack(fill="x", pady=(0, 12))

        self.scan_button = ttk.Button(cccd_frame, text="Quét CCCD", command=self.scan_cccd, style='TButton')
        self.scan_button.pack(side="left", pady=(0, 0))

        self.cccd_status = ttk.Label(cccd_frame, text="Chưa quét CCCD", foreground="#bdbdbd", style='TLabel')
        self.cccd_status.pack(side="left", padx=(12, 0))

        # Thông tin từ CCCD
        info_frame = ttk.Frame(container, style='TFrame')
        info_frame.pack(fill="x", pady=(0, 12))

        ttk.Label(info_frame, text="Họ tên:").grid(row=0, column=0, sticky="w", pady=2)
        self.name_label = ttk.Label(info_frame, text="", width=30, anchor="w", style='TLabel')
        self.name_label.grid(row=0, column=1, padx=5, sticky="w", pady=2)

        ttk.Label(info_frame, text="Ngày sinh:").grid(row=1, column=0, sticky="w", pady=2)
        self.dob_label = ttk.Label(info_frame, text="", width=30, anchor="w", style='TLabel')
        self.dob_label.grid(row=1, column=1, padx=5, sticky="w", pady=2)

        ttk.Label(info_frame, text="Giới tính:").grid(row=2, column=0, sticky="w", pady=2)
        self.gender_label = ttk.Label(info_frame, text="", width=30, anchor="w", style='TLabel')
        self.gender_label.grid(row=2, column=1, padx=5, sticky="w", pady=2)

        # Thông tin bổ sung
        input_frame = ttk.Frame(container, style='TFrame')
        input_frame.pack(fill="x", pady=(0, 12))

        ttk.Label(input_frame, text="Chiều cao (cm):").grid(row=0, column=0, sticky="w", pady=2)
        self.height_entry = ttk.Entry(input_frame, width=30)
        self.height_entry.grid(row=0, column=1, padx=5, sticky="w", pady=2)

        ttk.Label(input_frame, text="Hệ số hoạt động:").grid(row=1, column=0, sticky="w", pady=2)
        self.activity_var = tk.StringVar()
        self.activity_var.set("Ít vận động")
        self.activity_menu = ttk.OptionMenu(
            input_frame, self.activity_var, "Ít vận động", *ACTIVITY_LEVELS.keys()
        )
        self.activity_menu.grid(row=1, column=1, sticky="w", padx=5, pady=2)

        # Ghi chú
        note_frame = ttk.Frame(container, style='TFrame')
        note_frame.pack(fill="x", pady=(0, 0))
        note_text = "Lưu ý: Cân nặng sẽ được đo tự động từ thiết bị cân thông minh"
        ttk.Label(note_frame, text=note_text, font=("Segoe UI", 9, "italic"), foreground="#1976d2", style='TLabel').pack(anchor="w")

        return self.scan_button

    def scan_cccd(self):
        """
        Xử lý sự kiện quét mã QR CCCD.
        """
        try:
            # Call the QR scanner function
            self.cccd_data = scan_cccd_qr()

            if self.cccd_data:
                # Update the display labels
                self.name_label.config(text = self.cccd_data.get('name', ''))
                self.dob_label.config(text = self.cccd_data.get('dob', ''))
                self.gender_label.config(text = self.cccd_data.get('gender', ''))

                # Update status
                self.cccd_status.config(text = "✓ Đã quét CCCD thành công", foreground="#43a047")

                # Enable input fields
                self.height_entry.config(state = "normal")

                messagebox.showinfo("Thành công", "Đã quét CCCD thành công!\nVui lòng nhập chiều cao.")
            else:
                self.cccd_status.config(text = "Chưa quét CCCD", foreground="#bdbdbd")
                messagebox.showerror("Lỗi", "Không thể quét mã QR CCCD. Vui lòng thử lại.")

        except Exception as e:
            logger.error(f"Lỗi khi quét CCCD: {e}")
            self.cccd_status.config(text = "Chưa quét CCCD", foreground="#bdbdbd")
            messagebox.showerror("Lỗi", f"Lỗi khi quét CCCD: {str(e)}")

    def validate(self):
        """
        Kiểm tra hợp lệ trước khi xác nhận thông tin.
        """
        if not self.cccd_data:
            messagebox.showerror("Lỗi", "Vui lòng quét CCCD trước!")
            return False

        if not self.height_entry.get().strip():
            messagebox.showerror("Lỗi", "Vui lòng nhập chiều cao!")
            return False

        try:
            height = float(self.height_entry.get())

            if height <= 0 or height > 300:
                messagebox.showerror("Lỗi", "Chiều cao không hợp lệ (1-300 cm)!")
                return False

        except ValueError:
            messagebox.showerror("Lỗi", "Vui lòng nhập số hợp lệ cho chiều cao!")
            return False

        return True

    def apply(self):
        """
        Lưu thông tin người dùng sau khi xác nhận.
        """
        if self.cccd_data:
            # Calculate age from date of birth
            age = cm.calculate_age(self.cccd_data['dob'])

            self.result = {
                "name": self.cccd_data['name'],
                "dob": self.cccd_data['dob'],
                "gender": self.cccd_data['gender'],
                "cccd_id": self.cccd_data['cccd_id'],
                "address": self.cccd_data.get('address', ''),
                "height": float(self.height_entry.get()),
                "weight": None,  # Weight will be set later from scale data
                "age": age,
                "activity_factor": ACTIVITY_LEVELS[self.activity_var.get()]
            }
        else:
            self.result = None


# ==============================================================================
# WEIGHT PROCESSING
# ==============================================================================

def generate_fake_weight():
    """Generate a random fake weight within the specified range"""
    min_weight, max_weight = TESTING_CONFIG['weight_range']
    return round(random.uniform(min_weight, max_weight), 2)


def process_weight_data(weight, is_fake=False):
    """Process weight data and perform calculations"""
    if not cbc.is_meaningful_weight(user_info, weight):
        return

    user_info['weight'] = weight
    weight_source = "(FAKE DATA)" if is_fake else ""
    logger.info(f"Cân nặng: {weight} kg {weight_source}")

    # Calculate body composition
    body_composition = cbc.calculate_body_metrics(user_info)
    health_data.set_body_composition(body_composition)

    # Optional: One-leg standing timer (commented out)
    # oneleg_standing_timer = ast.one_leg_balance_detection()
    # print("=== KẾT QUẢ ĐO ===")
    # print(f"Thời gian đứng 1 chân: {oneleg_standing_timer['session_duration']:.1f} giây")
    # print(f"Độ lệch trung tâm trung bình: {oneleg_standing_timer['avg_offset']:.1f} pixels")

    # Save data and get recommendations
    mqtt_client.publish(MQTT_CONFIG['topic'], health_data.get_body_composition())
    cu.update_csv(user_info, health_data.get_body_composition())

    ai_recommend = ai_rcm.ai_health_recommendations(health_data.get_body_composition())
    logger.info(ai_recommend)

    # Optional: Voice recommendations (commented out)
    # read_recommend_vietnamese(user_info, ai_recommend)

    sys.exit(0)


# ==============================================================================
# BLUETOOTH SCALE FUNCTIONS
# ==============================================================================

async def find_scale_device():
    """Find the scale device by name"""
    return await BleakScanner().find_device_by_name(DEVICE_NAME)


def notification_handler(characteristic: BleakGATTCharacteristic, data: bytearray):
    """Handle notifications from the scale device"""
    weight = parser.data_parser(data, DEVICE_NAME)
    process_weight_data(weight, is_fake = False)


async def connect_and_measure():
    """Connect to scale and start measurements"""
    disconnected_event = asyncio.Event()

    def disconnected_callback(_bleak_client: BleakClient):
        logger.info("Scale disconnected")
        disconnected_event.set()

    device = await find_scale_device()
    if not device:
        logger.info("No scale device found")
        return

    logger.info(f"Found device: {device.name}")

    client = BleakClient(device, disconnected_callback = disconnected_callback)

    async with client:
        await client.start_notify(BODY_COMPOSITION_MEASUREMENT_UUID, notification_handler)
        await disconnected_event.wait()


# ==============================================================================
# TESTING FUNCTIONS
# ==============================================================================

async def fake_weight_testing():
    """Simulate weight measurements for testing purposes"""
    logger.info("=== FAKE WEIGHT TESTING MODE ENABLED ===")
    min_weight, max_weight = TESTING_CONFIG['weight_range']
    logger.info(f"Generating fake weights between {min_weight}kg and {max_weight}kg")

    while True:
        fake_weight = generate_fake_weight()
        logger.info(f"Generated fake weight: {fake_weight}kg")
        process_weight_data(fake_weight, is_fake = True)
        await asyncio.sleep(TESTING_CONFIG['measurement_delay'])


# ==============================================================================
# MAIN FUNCTIONS
# ==============================================================================

def get_user_info():
    """Get user information through dialog"""
    dialog = UserInfoDialog(root)
    if dialog.result is None:
        logger.error("No user information provided")
        sys.exit(1)
    return dialog.result


def initialize_mqtt():
    """Initialize and connect MQTT client"""
    mqtt_client = MQTTClient(
        MQTT_CONFIG['broker'],
        MQTT_CONFIG['port'],
        MQTT_CONFIG['username'],
        MQTT_CONFIG['password'],
        client_id = MQTT_CONFIG['client_id']
    )
    mqtt_client.connect()
    return mqtt_client


async def main():
    """Main application loop"""
    if TESTING_CONFIG['enable_fake_weight']:
        await fake_weight_testing()
    else:
        logger.info("Starting real scale connection...")
        while True:
            await connect_and_measure()
            logger.info("Restarting scale scan...")


def run_async_main():
    """Run the async main function in a new event loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main())


# ==============================================================================
# APPLICATION ENTRY POINT
# ==============================================================================

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level = logging.INFO,
        format = "%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    # Initialize components
    mqtt_client = initialize_mqtt()
    health_data.set_user_info(get_user_info())
    user_info = health_data.get_user_info()

    # Start async thread
    threading.Thread(target = run_async_main, daemon = True).start()

    # Run main GUI loop
    try:
        root.mainloop()
    except KeyboardInterrupt:
        logger.info("Application terminated by user")
    finally:
        logger.info("Cleaning up resources")