import asyncio
import logging
import threading
import sys
import tkinter as tk
from tkinter import ttk, simpledialog
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
    """Dialog for user information input and selection"""

    def __init__(self, parent):
        self.user_data = self._load_user_data()
        self.names = self.user_data['name'].tolist()
        super().__init__(parent)

    def _load_user_data(self):
        """Load and clean user data from CSV"""
        user_data = pd.read_csv('user_data/user_data.csv')
        return user_data.drop_duplicates(subset = 'name')

    def body(self, master):
        """Create dialog body"""
        self.title("Nhập thông tin cá nhân")

        # User selection
        tk.Label(master, text = "Tạo mới hoặc chọn tên người dùng:").grid(row = 0, column = 0)
        self.name_var = tk.StringVar()
        self.name_menu = ttk.Combobox(master, textvariable = self.name_var, values = self.names)
        self.name_menu.grid(row = 0, column = 1)
        self.name_menu.bind("<<ComboboxSelected>>", self.on_name_select)

        # Input fields
        self._create_input_fields(master)

        # Activity level dropdown
        self._create_activity_dropdown(master)

        return self.name_menu

    def _create_input_fields(self, master):
        """Create input fields for user data"""
        tk.Label(master, text = "Ngày sinh (dd/mm/yyyy):").grid(row = 1)
        tk.Label(master, text = "Chiều cao (cm):").grid(row = 2)

        self.dob_entry = tk.Entry(master)
        self.height_entry = tk.Entry(master)

        self.dob_entry.grid(row = 1, column = 1)
        self.height_entry.grid(row = 2, column = 1)

    def _create_activity_dropdown(self, master):
        """Create activity level dropdown"""
        tk.Label(master, text = "Hệ số hoạt động:").grid(row = 3)

        self.activity_var = tk.StringVar()
        self.activity_var.set("Ít vận động")

        self.activity_menu = ttk.OptionMenu(
            master, self.activity_var, "Ít vận động", *ACTIVITY_LEVELS.keys()
        )
        self.activity_menu.grid(row = 3, column = 1)

    def on_name_select(self, event):
        """Handle user name selection"""
        selected_name = self.name_var.get()
        user_info = self.user_data[self.user_data['name'] == selected_name]

        if not user_info.empty:
            self._populate_fields(user_info.iloc[0])

    def _populate_fields(self, user_record):
        """Populate fields with selected user data"""
        # Clear existing data
        self.dob_entry.delete(0, tk.END)
        self.height_entry.delete(0, tk.END)

        # Fill with user data
        self.dob_entry.insert(0, user_record['dob'])
        self.height_entry.insert(0, int(user_record['height']))

        # Set activity level
        activity_mapping = {v: k for k, v in ACTIVITY_LEVELS.items()}
        activity_factor = user_record['activity_factor']
        self.activity_var.set(activity_mapping.get(activity_factor, "Ít vận động"))

    def apply(self):
        """Apply user input"""
        self.result = {
            "name": self.name_var.get(),
            "dob": self.dob_entry.get(),
            "height": int(self.height_entry.get()),
            "weight": 75.70,  # Default weight
            "age": cm.calculate_age(self.dob_entry.get()),
            "activity_factor": ACTIVITY_LEVELS[self.activity_var.get()]
        }


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