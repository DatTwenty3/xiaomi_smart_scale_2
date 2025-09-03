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

class ModernButton(tk.Button):
    """Custom button với thiết kế hiện đại"""
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.configure(
            relief="flat",
            borderwidth=0,
            font=("Segoe UI", 10, "bold"),
            cursor="hand2",
            activebackground="#1565c0",
            activeforeground="white"
        )
        self.bind("<Enter>", self.on_enter)
        self.bind("<Leave>", self.on_leave)
        
    def on_enter(self, e):
        self.configure(background="#1565c0")
        
    def on_leave(self, e):
        self.configure(background="#1976d2")

class ModernEntry(tk.Entry):
    """Custom entry với thiết kế hiện đại"""
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.configure(
            relief="flat",
            borderwidth=2,
            font=("Segoe UI", 10),
            highlightthickness=1,
            highlightcolor="#1976d2",
            highlightbackground="#e0e0e0"
        )

class UserInfoDialog(simpledialog.Dialog):
    """
    Dialog nhập thông tin người dùng với giao diện hiện đại, hỗ trợ quét mã QR CCCD và nhập chiều cao, hệ số hoạt động.
    """
    def __init__(self, parent):
        self.cccd_data = None
        super().__init__(parent)

    def body(self, master):
        """
        Giao diện hiện đại với Material Design colors và typography.
        """
        self.title("Nhập thông tin cá nhân")
        
        # Cấu hình style hiện đại
        style = ttk.Style()
        style.theme_use('clam')
        
        # Colors theo Material Design
        primary_color = "#1976d2"
        primary_dark = "#1565c0"
        primary_light = "#bbdefb"
        accent_color = "#ff9800"
        surface_color = "#ffffff"
        background_color = "#f5f5f5"
        text_primary = "#212121"
        text_secondary = "#757575"
        success_color = "#4caf50"
        error_color = "#f44336"
        
        # Configure styles
        style.configure('Modern.TFrame', background=surface_color)
        style.configure('Modern.TLabel', 
                       background=surface_color, 
                       font=("Segoe UI", 10),
                       foreground=text_primary)
        style.configure('Header.TLabel', 
                       font=("Segoe UI", 18, "bold"), 
                       background=surface_color, 
                       foreground=primary_color)
        style.configure('Subheader.TLabel', 
                       font=("Segoe UI", 12, "bold"), 
                       background=surface_color, 
                       foreground=text_primary)
        style.configure('Info.TLabel', 
                       font=("Segoe UI", 9), 
                       background=surface_color, 
                       foreground=text_secondary)
        style.configure('Success.TLabel', 
                       font=("Segoe UI", 10), 
                       background=surface_color, 
                       foreground=success_color)
        style.configure('Modern.TButton', 
                       font=("Segoe UI", 10, "bold"), 
                       padding=(16, 12), 
                       relief="flat", 
                       background=primary_color, 
                       foreground="white", 
                       borderwidth=0)
        style.map('Modern.TButton', 
                  background=[('active', primary_dark), ('pressed', primary_dark)])
        style.configure('Modern.TEntry', 
                       padding=(12, 8), 
                       relief="flat", 
                       borderwidth=1)
        style.configure('Modern.TOptionMenu', 
                       padding=(12, 8), 
                       relief="flat", 
                       borderwidth=1)

        # Cấu hình master window
        master.configure(bg=background_color)
        
        # Container chính với shadow effect
        main_container = tk.Frame(master, bg=surface_color, relief="flat", bd=0)
        main_container.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Header section
        header_frame = tk.Frame(main_container, bg=surface_color, height=80)
        header_frame.pack(fill="x", pady=(0, 20))
        header_frame.pack_propagate(False)
        
        # Icon và title
        title_label = tk.Label(header_frame, 
                              text="⚖️", 
                              font=("Segoe UI", 24), 
                              bg=surface_color, 
                              fg=primary_color)
        title_label.pack(side="left", padx=(20, 10))
        
        title_text = tk.Label(header_frame, 
                             text="Thông tin cá nhân", 
                             font=("Segoe UI", 18, "bold"), 
                             bg=surface_color, 
                             fg=primary_color)
        title_text.pack(side="left", pady=20)
        
        # Content container
        content_frame = tk.Frame(main_container, bg=surface_color)
        content_frame.pack(fill="both", expand=True, padx=20)
        
        # Section 1: CCCD Scanning
        self.create_section_header(content_frame, "📱 Quét CCCD", 0)
        
        cccd_frame = tk.Frame(content_frame, bg=surface_color)
        cccd_frame.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        
        self.scan_button = ModernButton(cccd_frame, 
                                       text="Quét CCCD", 
                                       command=self.scan_cccd,
                                       bg=primary_color,
                                       fg="white",
                                       font=("Segoe UI", 11, "bold"),
                                       padx=20,
                                       pady=10)
        self.scan_button.pack(side="left")
        
        self.cccd_status = tk.Label(cccd_frame, 
                                   text="Chưa quét CCCD", 
                                   font=("Segoe UI", 10),
                                   fg=text_secondary,
                                   bg=surface_color)
        self.cccd_status.pack(side="left", padx=(20, 0), pady=10)
        
        # Section 2: CCCD Information
        self.create_section_header(content_frame, "👤 Thông tin từ CCCD", 2)
        
        info_frame = tk.Frame(content_frame, bg=surface_color)
        info_frame.grid(row=3, column=0, sticky="ew", pady=(0, 20))
        
        # Grid layout cho thông tin
        labels = ["Họ tên:", "Ngày sinh:", "Giới tính:"]
        self.info_labels = {}
        
        for i, label_text in enumerate(labels):
            label = tk.Label(info_frame, 
                            text=label_text, 
                            font=("Segoe UI", 10, "bold"),
                            bg=surface_color, 
                            fg=text_primary)
            label.grid(row=i, column=0, sticky="w", pady=8, padx=(0, 20))
            
            value_label = tk.Label(info_frame, 
                                  text="", 
                                  font=("Segoe UI", 10),
                                  bg=surface_color, 
                                  fg=text_secondary,
                                  width=30,
                                  anchor="w")
            value_label.grid(row=i, column=1, sticky="w", pady=8)
            self.info_labels[label_text] = value_label
        
        # Section 3: Additional Information
        self.create_section_header(content_frame, "📏 Thông tin bổ sung", 4)
        
        input_frame = tk.Frame(content_frame, bg=surface_color)
        input_frame.grid(row=5, column=0, sticky="ew", pady=(0, 20))
        
        # Height input
        height_label = tk.Label(input_frame, 
                               text="Chiều cao (cm):", 
                               font=("Segoe UI", 10, "bold"),
                               bg=surface_color, 
                               fg=text_primary)
        height_label.grid(row=0, column=0, sticky="w", pady=12, padx=(0, 20))
        
        self.height_entry = ModernEntry(input_frame, width=25, font=("Segoe UI", 10))
        self.height_entry.grid(row=0, column=1, sticky="w", pady=12)
        
        # Activity level
        activity_label = tk.Label(input_frame, 
                                 text="Hệ số hoạt động:", 
                                 font=("Segoe UI", 10, "bold"),
                                 bg=surface_color, 
                                 fg=text_primary)
        activity_label.grid(row=1, column=0, sticky="w", pady=12, padx=(0, 20))
        
        self.activity_var = tk.StringVar()
        self.activity_var.set("Ít vận động")
        
        # Custom styled OptionMenu
        activity_frame = tk.Frame(input_frame, bg=surface_color)
        activity_frame.grid(row=1, column=1, sticky="w", pady=12)
        
        self.activity_menu = tk.OptionMenu(activity_frame, 
                                          self.activity_var, 
                                          "Ít vận động", 
                                          *ACTIVITY_LEVELS.keys(),
                                          command=self.on_activity_change)
        self.activity_menu.configure(
            font=("Segoe UI", 10),
            bg=surface_color,
            fg=text_primary,
            relief="flat",
            borderwidth=1,
            highlightthickness=1,
            highlightcolor=primary_color,
            highlightbackground="#e0e0e0",
            width=20
        )
        self.activity_menu.pack()
        
        # Section 4: Note
        note_frame = tk.Frame(content_frame, bg=surface_color)
        note_frame.grid(row=6, column=0, sticky="ew", pady=(20, 0))
        
        note_text = "💡 Lưu ý: Cân nặng sẽ được đo tự động từ thiết bị cân thông minh"
        note_label = tk.Label(note_frame, 
                             text=note_text, 
                             font=("Segoe UI", 9, "italic"), 
                             fg=primary_color, 
                             bg=surface_color,
                             wraplength=400,
                             justify="left")
        note_label.pack(anchor="w")
        
        # Configure grid weights
        content_frame.columnconfigure(0, weight=1)
        
        return self.scan_button

    def create_section_header(self, parent, text, row):
        """Tạo header cho mỗi section"""
        header = tk.Label(parent, 
                         text=text, 
                         font=("Segoe UI", 12, "bold"), 
                         bg=parent.cget("bg"), 
                         fg="#1976d2",
                         anchor="w")
        header.grid(row=row, column=0, sticky="ew", pady=(20, 10))
        
        # Separator line
        separator = tk.Frame(parent, height=2, bg="#e0e0e0")
        separator.grid(row=row+1, column=0, sticky="ew", pady=(0, 10))

    def on_activity_change(self, *args):
        """Xử lý khi thay đổi activity level"""
        pass

    def translate_gender(self, gender):
        """Chuyển đổi giới tính từ tiếng Anh sang tiếng Việt"""
        gender_mapping = {
            'male': 'Nam',
            'female': 'Nữ',
            'm': 'Nam',
            'f': 'Nữ',
            'nam': 'Nam',
            'nữ': 'Nữ',
            'nu': 'Nữ'
        }
        return gender_mapping.get(gender.lower(), gender)

    def scan_cccd(self):
        """
        Xử lý sự kiện quét mã QR CCCD.
        """
        try:
            # Call the QR scanner function
            self.cccd_data = scan_cccd_qr()

            if self.cccd_data:
                # Update the display labels
                self.info_labels["Họ tên:"].config(text=self.cccd_data.get('name', ''))
                self.info_labels["Ngày sinh:"].config(text=self.cccd_data.get('dob', ''))
                self.info_labels["Giới tính:"].config(text=self.translate_gender(self.cccd_data.get('gender', '')))

                # Update status với icon và màu
                self.cccd_status.config(
                    text="✓ Đã quét CCCD thành công", 
                    fg="#4caf50",
                    font=("Segoe UI", 10, "bold")
                )

                # Enable input fields
                self.height_entry.config(state="normal")

                messagebox.showinfo("Thành công", "Đã quét CCCD thành công!\nVui lòng nhập chiều cao.")
            else:
                self.cccd_status.config(
                    text="❌ Chưa quét CCCD", 
                    fg="#f44336"
                )
                messagebox.showerror("Lỗi", "Không thể quét mã QR CCCD. Vui lòng thử lại.")

        except Exception as e:
            logger.error(f"Lỗi khi quét CCCD: {e}")
            self.cccd_status.config(
                text="❌ Lỗi khi quét CCCD", 
                fg="#f44336"
            )
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