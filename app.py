from flask import Flask, render_template, request, jsonify, session
import os
import sys
import json
import subprocess
import tempfile
from datetime import datetime

# Import các module Python có sẵn
import calc_metrics as cm
import calc_body_composition as cbc
import ai_predict as ap
import ai_recommendations as ai_rcm
import info_user as iu
from qr_scaner import scan_cccd_qr

app = Flask(__name__)
app.secret_key = 'xiaomi_smart_scale_secret_key_2024'

# Khởi tạo HealthDataManager
health_data = iu.HealthDataManager()

@app.route('/')
def index():
    """Trang chủ với giao diện nhập thông tin"""
    return render_template('index.html')

@app.route('/api/scan-cccd', methods=['POST'])
def scan_cccd():
    """API endpoint để quét CCCD QR"""
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
                'message': 'Không thể quét mã QR CCCD'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi quét CCCD: {str(e)}'
        })

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
        weight = float(data.get('weight', 0))
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
        
        # Tính toán các chỉ số cơ thể
        body_composition = cbc.calculate_body_metrics(user_info)
        
        if body_composition:
            # Lưu kết quả tính toán
            health_data.set_body_composition(body_composition)
            
            # Lấy khuyến nghị AI
            ai_recommendations = ai_rcm.ai_health_recommendations(body_composition)
            
            # Chuẩn bị kết quả trả về
            result = {
                'success': True,
                'user_info': user_info,
                'body_composition': body_composition,
                'ai_recommendations': ai_recommendations,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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

@app.route('/api/clear-session', methods=['POST'])
def clear_session():
    """Xóa dữ liệu session"""
    session.clear()
    return jsonify({'success': True})

@app.route('/results')
def results():
    """Trang hiển thị kết quả"""
    return render_template('results.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
