#!/usr/bin/env python3
"""
Script test cho web app Xiaomi Smart Scale
"""

import requests
import json
import time

def test_web_app():
    """Test các API endpoints của web app"""
    base_url = "http://localhost:5000"
    
    print("🚀 Bắt đầu test web app Xiaomi Smart Scale...")
    print("=" * 50)
    
    # Test 1: Kiểm tra trang chủ
    print("1. Test trang chủ...")
    try:
        response = requests.get(base_url)
        if response.status_code == 200:
            print("✅ Trang chủ hoạt động bình thường")
        else:
            print(f"❌ Lỗi trang chủ: {response.status_code}")
    except Exception as e:
        print(f"❌ Không thể kết nối đến web app: {e}")
        return
    
    # Test 2: Test API tính toán với dữ liệu mẫu
    print("\n2. Test API tính toán...")
    test_data = {
        "name": "Nguyễn Văn Test",
        "dob": "01/01/1990",
        "gender": "male",
        "age": 34,
        "height": 170.0,
        "weight": 70.0,
        "activity_factor": 1.55,
        "cccd_id": "123456789012"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/calculate",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ API tính toán hoạt động bình thường")
                print(f"   - BMI: {result['body_composition']['bmi']}")
                print(f"   - BMR: {result['body_composition']['bmr']}")
                print(f"   - TDEE: {result['body_composition']['tdee']}")
                print(f"   - Tỷ lệ mỡ: {result['body_composition']['fp']}%")
            else:
                print(f"❌ Lỗi tính toán: {result.get('message', 'Unknown error')}")
        else:
            print(f"❌ Lỗi HTTP: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi khi test API tính toán: {e}")
    
    # Test 3: Test API clear session
    print("\n3. Test API clear session...")
    try:
        response = requests.post(f"{base_url}/api/clear-session")
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ API clear session hoạt động bình thường")
            else:
                print("❌ Lỗi clear session")
        else:
            print(f"❌ Lỗi HTTP: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi khi test clear session: {e}")
    
    # Test 4: Test với dữ liệu nữ
    print("\n4. Test với dữ liệu nữ...")
    test_data_female = {
        "name": "Nguyễn Thị Test",
        "dob": "15/06/1995",
        "gender": "female",
        "age": 29,
        "height": 160.0,
        "weight": 55.0,
        "activity_factor": 1.375
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/calculate",
            headers={"Content-Type": "application/json"},
            json=test_data_female
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Test dữ liệu nữ thành công")
                print(f"   - BMI: {result['body_composition']['bmi']}")
                print(f"   - BMR: {result['body_composition']['bmr']}")
                print(f"   - Tỷ lệ mỡ: {result['body_composition']['fp']}%")
            else:
                print(f"❌ Lỗi với dữ liệu nữ: {result.get('message', 'Unknown error')}")
        else:
            print(f"❌ Lỗi HTTP với dữ liệu nữ: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi khi test dữ liệu nữ: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Hoàn thành test web app!")
    print("\n📝 Hướng dẫn sử dụng:")
    print("1. Mở trình duyệt và truy cập: http://localhost:5000")
    print("2. Chọn tab 'Nhập thủ công' hoặc 'Quét CCCD'")
    print("3. Điền thông tin và nhấn 'Tính toán'")
    print("4. Xem kết quả trong modal hoặc trang chi tiết")

if __name__ == "__main__":
    print("⚠️  Lưu ý: Đảm bảo web app đang chạy trước khi test!")
    print("   Chạy: python app.py")
    print()
    
    input("Nhấn Enter để bắt đầu test...")
    test_web_app()
