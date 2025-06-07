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
    """Dialog for user information input with CCCD QR scanner"""

    def __init__(self, parent):
        self.cccd_data = None
        super().__init__(parent)

    def body(self, master):
        """Create dialog body"""
        self.title("Nhập thông tin cá nhân")

        # CCCD QR Scanner section
        qr_frame = tk.Frame(master)
        qr_frame.grid(row = 0, column = 0, columnspan = 2, pady = 10)

        tk.Label(qr_frame, text = "1. Quét mã QR trên CCCD:", font = ("Arial", 10, "bold")).pack()
        self.scan_button = tk.Button(qr_frame, text = "Quét CCCD", command = self.scan_cccd,
                                     bg = "#4CAF50", fg = "white", font = ("Arial", 9))
        self.scan_button.pack(pady = 5)

        # Status label for CCCD scan
        self.cccd_status = tk.Label(qr_frame, text = "Chưa quét CCCD", fg = "red")
        self.cccd_status.pack()

        # User info display (read-only)
        info_frame = tk.Frame(master)
        info_frame.grid(row = 1, column = 0, columnspan = 2, pady = 10)

        tk.Label(info_frame, text = "Thông tin từ CCCD:", font = ("Arial", 10, "bold")).grid(row = 0, column = 0,
                                                                                             columnspan = 2)

        tk.Label(info_frame, text = "Họ tên:").grid(row = 1, column = 0, sticky = "w")
        self.name_label = tk.Label(info_frame, text = "", bg = "lightgray", width = 30, anchor = "w")
        self.name_label.grid(row = 1, column = 1, padx = 5)

        tk.Label(info_frame, text = "Ngày sinh:").grid(row = 2, column = 0, sticky = "w")
        self.dob_label = tk.Label(info_frame, text = "", bg = "lightgray", width = 30, anchor = "w")
        self.dob_label.grid(row = 2, column = 1, padx = 5)

        tk.Label(info_frame, text = "Giới tính:").grid(row = 3, column = 0, sticky = "w")
        self.gender_label = tk.Label(info_frame, text = "", bg = "lightgray", width = 30, anchor = "w")
        self.gender_label.grid(row = 3, column = 1, padx = 5)

        # Manual input section
        input_frame = tk.Frame(master)
        input_frame.grid(row = 2, column = 0, columnspan = 2, pady = 10)

        tk.Label(input_frame, text = "2. Nhập thông tin bổ sung:", font = ("Arial", 10, "bold")).grid(row = 0,
                                                                                                      column = 0,
                                                                                                      columnspan = 2)

        # Height input
        tk.Label(input_frame, text = "Chiều cao (cm):").grid(row = 1, column = 0, sticky = "w")
        self.height_entry = tk.Entry(input_frame, width = 30)
        self.height_entry.grid(row = 1, column = 1, padx = 5)

        # Activity level dropdown
        tk.Label(input_frame, text = "Hệ số hoạt động:").grid(row = 2, column = 0, sticky = "w")
        self.activity_var = tk.StringVar()
        self.activity_var.set("Ít vận động")
        self.activity_menu = ttk.OptionMenu(
            input_frame, self.activity_var, "Ít vận động", *ACTIVITY_LEVELS.keys()
        )
        self.activity_menu.grid(row = 2, column = 1, sticky = "w", padx = 5)

        # Add note about weight measurement
        note_frame = tk.Frame(master)
        note_frame.grid(row = 3, column = 0, columnspan = 2, pady = 10)

        note_text = "Lưu ý: Cân nặng sẽ được đo tự động từ thiết bị cân thông minh"
        tk.Label(note_frame, text = note_text, font = ("Arial", 9, "italic"), fg = "blue").pack()

        return self.scan_button

    def scan_cccd(self):
        """Handle CCCD QR code scanning"""
        try:
            # Call the QR scanner function
            self.cccd_data = scan_cccd_qr()

            if self.cccd_data:
                # Update the display labels
                self.name_label.config(text = self.cccd_data.get('name', ''))
                self.dob_label.config(text = self.cccd_data.get('dob', ''))
                self.gender_label.config(text = self.cccd_data.get('gender', ''))

                # Update status
                self.cccd_status.config(text = "✓ Đã quét CCCD thành công", fg = "green")

                # Enable input fields
                self.height_entry.config(state = "normal")

                messagebox.showinfo("Thành công", "Đã quét CCCD thành công!\nVui lòng nhập chiều cao.")
            else:
                messagebox.showerror("Lỗi", "Không thể quét mã QR CCCD. Vui lòng thử lại.")

        except Exception as e:
            messagebox.showerror("Lỗi", f"Lỗi khi quét CCCD: {str(e)}")

    def validate(self):
        """Validate input before applying"""
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
        """Apply user input"""
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
    print(f"Cân nặng: {weight} kg {weight_source}")

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
    print(ai_recommend)

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