from flask import Flask, render_template, request, jsonify, session
import os
import sys
import json
import subprocess
import tempfile
import asyncio
import threading
import logging
from datetime import datetime

# Import các module Python có sẵn
import calc_metrics as cm
import calc_body_composition as cbc
import ai_predict as ap
import ai_recommendations as ai_rcm
import info_user as iu
from qr_scaner import scan_cccd_qr
from mqtt_client_handler import MQTTClient
import data_parser as parser
import csv_update as cu
import oneleg_timer as olt
from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic

app = Flask(__name__)
app.secret_key = 'xiaomi_smart_scale_secret_key_2024'

# Khởi tạo HealthDataManager
health_data = iu.HealthDataManager()

# ==============================================================================
# BLUETOOTH SCALE CONFIGURATION
# ==============================================================================

# Scale Device Configuration
DEVICE_NAME = 'Crenot Gofit S2'
BODY_COMPOSITION_MEASUREMENT_UUID = '0000FFB2-0000-1000-8000-00805F9B34FB'

# MQTT Configuration
MQTT_CONFIG = {
    'broker': "app.coreiot.io",
    'port': 1883,
    'username': "smart-scale",
    'password': "smart-scale",
    'client_id': "smart-scale",
    'topic': "v1/devices/me/telemetry"
}

# Global variables for Bluetooth scale
current_weight = None
weight_measurement_active = False
mqtt_client = None

# ==============================================================================
# BLUETOOTH SCALE FUNCTIONS
# ==============================================================================

def initialize_mqtt():
    """Initialize and connect MQTT client"""
    global mqtt_client
    mqtt_client = MQTTClient(
        MQTT_CONFIG['broker'],
        MQTT_CONFIG['port'],
        MQTT_CONFIG['username'],
        MQTT_CONFIG['password'],
        client_id=MQTT_CONFIG['client_id']
    )
    mqtt_client.connect()
    return mqtt_client

async def find_scale_device():
    """Find the scale device by name"""
    return await BleakScanner().find_device_by_name(DEVICE_NAME)

def notification_handler(characteristic: BleakGATTCharacteristic, data: bytearray):
    """Handle notifications from the scale device"""
    global current_weight
    weight = parser.data_parser(data, DEVICE_NAME)
    if weight and weight > 0:
        current_weight = weight
        print(f"Received weight: {weight} kg")

async def connect_and_measure():
    """Connect to scale and start measurements"""
    global weight_measurement_active
    disconnected_event = asyncio.Event()

    def disconnected_callback(_bleak_client: BleakClient):
        print("Scale disconnected")
        weight_measurement_active = False
        disconnected_event.set()

    device = await find_scale_device()
    if not device:
        print("No scale device found")
        weight_measurement_active = False
        return

    print(f"Found device: {device.name}")
    weight_measurement_active = True

    client = BleakClient(device, disconnected_callback=disconnected_callback)

    async with client:
        await client.start_notify(BODY_COMPOSITION_MEASUREMENT_UUID, notification_handler)
        await disconnected_event.wait()

def run_bluetooth_scan():
    """Run Bluetooth scan in background thread"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(connect_and_measure())

@app.route('/')
def index():
    """Trang chủ với giao diện nhập thông tin"""
    return render_template('index.html')

@app.route('/api/scan-cccd', methods=['POST'])
def scan_cccd():
    """API endpoint để quét Căn cước QR"""
    try:
        # Gọi hàm quét QR từ module Python
        cccd_data = scan_cccd_qr()
        
        if cccd_data:
            # Lưu dữ liệu vào session
            session['cccd_data'] = cccd_data
            return jsonify({
                'success': True,
                'data': cccd_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Không thể quét mã QR Căn cước'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi quét Căn cước: {str(e)}'
        })

@app.route('/api/parse-qr-data', methods=['POST'])
def parse_qr_data():
    """API endpoint để parse dữ liệu QR từ frontend"""
    try:
        data = request.get_json()
        qr_data = data.get('qr_data', '')
        
        if not qr_data:
            return jsonify({
                'success': False,
                'message': 'Không có dữ liệu QR để xử lý'
            })
        
        # Sử dụng hàm parse từ qr_scaner.py
        parsed_data = _parse_cccd_data(qr_data)
        
        if parsed_data:
            # Lưu dữ liệu vào session
            session['cccd_data'] = parsed_data
            return jsonify({
                'success': True,
                'data': parsed_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Không thể phân tích dữ liệu QR Căn cước'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi phân tích dữ liệu QR: {str(e)}'
        })

def _parse_cccd_data(data):
    """
    Phân tích dữ liệu QR Căn cước thành dict chuẩn hóa.
    (Copy từ qr_scaner.py)
    """
    parts = data.split('|')
    if len(parts) < 6:
        return None
    try:
        cccd_id = parts[0].strip()
        cmnd_id = parts[1].strip()
        name = parts[2].strip()
        dob_raw = parts[3].strip()
        gender = parts[4].strip()
        if gender.lower() == "nam":
            gender = "male"
        elif gender.lower() == "nữ" or gender.lower() == "nu":
            gender = "female"
        address = parts[5].strip()
        issue_date_raw = parts[6].strip() if len(parts) > 6 else ""
        dob_formatted = _format_date(dob_raw)
        issue_date_formatted = _format_date(issue_date_raw) if issue_date_raw else ""
        return {
            "name": name,
            "dob": dob_formatted,
            "gender": gender,
            "cccd_id": cccd_id,
            "cmnd_id": cmnd_id,
            "address": address,
            "issue_date": issue_date_formatted
        }
    except (IndexError, ValueError):
        return None

def _format_date(date_str):
    """
    Định dạng ngày từ ddmmyyyy sang dd/mm/yyyy.
    (Copy từ qr_scaner.py)
    """
    if len(date_str) == 8 and date_str.isdigit():
        day = date_str[:2]
        month = date_str[2:4]
        year = date_str[4:8]
        return f"{day}/{month}/{year}"
    return date_str

@app.route('/api/calculate', methods=['POST'])
def calculate_metrics():
    """API endpoint để tính toán các chỉ số cơ thể"""
    try:
        data = request.get_json()
        
        # Lấy dữ liệu từ form hoặc session
        if 'cccd_data' in session and session['cccd_data']:
            cccd_data = session['cccd_data']
            name = cccd_data.get('name', '')
            dob = cccd_data.get('dob', '')
            gender = cccd_data.get('gender', '')
            cccd_id = cccd_data.get('cccd_id', '')
            address = cccd_data.get('address', '')
        else:
            # Dữ liệu nhập thủ công
            name = data.get('name', '')
            dob = data.get('dob', '')
            gender = data.get('gender', '')
            cccd_id = data.get('cccd_id', '')
            address = data.get('address', '')
        
        # Thông tin bắt buộc
        height = float(data.get('height', 0))
        # Lấy cân nặng từ session (đã được xác nhận từ Bluetooth scale) hoặc từ request data (test demo)
        weight = session.get('confirmed_weight') or data.get('weight')
        if not weight:
            return jsonify({
                'success': False,
                'message': 'Vui lòng đo cân nặng trước khi tính toán'
            })
        weight = float(weight)
        activity_factor = float(data.get('activity_factor', 1.2))
        
        # Tính tuổi từ ngày sinh
        age = cm.calculate_age(dob) if dob else int(data.get('age', 0))
        
        # Tạo user_info
        user_info = {
            'name': name,
            'dob': dob,
            'gender': gender,
            'cccd_id': cccd_id,
            'address': address,
            'height': height,
            'weight': weight,
            'age': age,
            'activity_factor': activity_factor
        }
        
        # Lưu thông tin người dùng
        health_data.set_user_info(user_info)
        
        # Lấy thời gian thăng bằng từ session hoặc từ request data (test demo)
        balance_time = session.get('balance_time') or data.get('balance_time')
        
        # Tính toán các chỉ số cơ thể
        body_composition = cbc.calculate_body_metrics(user_info, balance_time)
        
        if body_composition:
            # Lưu kết quả tính toán
            health_data.set_body_composition(body_composition)
            
            # Lưu dữ liệu vào CSV
            try:
                csv_success = cu.update_csv(user_info, body_composition)
                if csv_success:
                    print("✓ Đã lưu dữ liệu vào CSV thành công!")
                else:
                    print("✗ Lỗi khi lưu dữ liệu vào CSV")
            except Exception as e:
                print(f"✗ Lỗi khi lưu CSV: {e}")
            
            # Lấy khuyến nghị AI
            ai_recommendations = ai_rcm.ai_health_recommendations(body_composition)
            
            # Chuẩn bị kết quả trả về
            result = {
                'success': True,
                'user_info': user_info,
                'body_composition': body_composition,
                'ai_recommendations': ai_recommendations,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'csv_saved': csv_success if 'csv_success' in locals() else False
            }
            
            return jsonify(result)
        else:
            return jsonify({
                'success': False,
                'message': 'Lỗi khi tính toán các chỉ số cơ thể'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi tính toán: {str(e)}'
        })

@app.route('/api/start-weight-measurement', methods=['POST'])
def start_weight_measurement():
    """Bắt đầu đo cân nặng từ Bluetooth scale"""
    global weight_measurement_active, current_weight
    
    try:
        # Reset current weight
        current_weight = None
        weight_measurement_active = True
        
        # Start Bluetooth scan in background thread
        thread = threading.Thread(target=run_bluetooth_scan, daemon=True)
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Đang tìm kiếm cân Bluetooth...'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi bắt đầu đo cân: {str(e)}'
        })

@app.route('/api/get-current-weight', methods=['GET'])
def get_current_weight():
    """Lấy cân nặng hiện tại từ scale"""
    global current_weight, weight_measurement_active
    
    return jsonify({
        'success': True,
        'weight': current_weight,
        'is_measuring': weight_measurement_active
    })

@app.route('/api/confirm-weight', methods=['POST'])
def confirm_weight():
    """Xác nhận cân nặng và chuyển sang bước tính toán"""
    global current_weight
    
    data = request.get_json()
    confirmed_weight = data.get('weight')
    
    if not confirmed_weight:
        return jsonify({
            'success': False,
            'message': 'Cân nặng không hợp lệ'
        })
    
    # Lưu cân nặng vào session
    session['confirmed_weight'] = confirmed_weight
    
    return jsonify({
        'success': True,
        'message': 'Cân nặng đã được xác nhận'
    })

@app.route('/api/save-balance-time', methods=['POST'])
def save_balance_time():
    """Lưu thời gian thăng bằng vào session"""
    try:
        data = request.get_json()
        balance_time = data.get('balance_time')
        
        if balance_time is not None:
            session['balance_time'] = balance_time
            return jsonify({
                'success': True,
                'message': 'Thời gian thăng bằng đã được lưu'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Thời gian thăng bằng không hợp lệ'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lưu thời gian thăng bằng: {str(e)}'
        })

@app.route('/api/save-results', methods=['POST'])
def save_results():
    """Lưu kết quả vào CSV (backup function)"""
    try:
        data = request.get_json()
        user_info = data.get('user_info', {})
        body_composition = data.get('body_composition', {})
        
        if not user_info or not body_composition:
            return jsonify({
                'success': False,
                'message': 'Thiếu dữ liệu để lưu'
            })
        
        # Lưu vào CSV
        csv_success = cu.update_csv(user_info, body_composition)
        
        if csv_success:
            return jsonify({
                'success': True,
                'message': 'Đã lưu dữ liệu vào CSV thành công'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Lỗi khi lưu dữ liệu vào CSV'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lưu dữ liệu: {str(e)}'
        })

@app.route('/api/balance-test', methods=['POST'])
def balance_test():
    """Đo thời gian thăng bằng đứng 1 chân"""
    try:
        # Gọi hàm đo thăng bằng từ oneleg_timer.py
        balance_result = olt.one_leg_balance_detection()
        
        if balance_result and balance_result.get('session_duration', 0) > 0:
            return jsonify({
                'success': True,
                'balance_time': balance_result['session_duration'],
                'avg_offset': balance_result.get('avg_offset', 0),
                'message': 'Đo thăng bằng thành công'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Không thể đo được thời gian thăng bằng. Vui lòng thử lại.'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi đo thăng bằng: {str(e)}'
        })

@app.route('/api/get-history/<name>')
def get_user_history(name):
    """Lấy lịch sử đo của người dùng"""
    try:
        history_df = cu.get_user_history(name, limit=10)
        
        if history_df.empty:
            return jsonify({
                'success': True,
                'data': [],
                'message': 'Không có lịch sử đo'
            })
        
        # Convert DataFrame to list of dictionaries
        history_data = history_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'data': history_data,
            'count': len(history_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy lịch sử: {str(e)}'
        })

@app.route('/api/clear-session', methods=['POST'])
def clear_session():
    """Xóa dữ liệu session"""
    global current_weight, weight_measurement_active
    current_weight = None
    weight_measurement_active = False
    session.clear()
    return jsonify({'success': True})

@app.route('/results')
def results():
    """Trang hiển thị kết quả"""
    return render_template('results.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

