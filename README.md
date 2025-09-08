# 🚀 E-Health Station - Xiaomi Smart Scale

## 📋 Tổng quan

Dự án E-Health Station là một hệ thống đo và phân tích thành phần cơ thể sử dụng cân thông minh Xiaomi, tích hợp với web application và MQTT để theo dõi sức khỏe. Hệ thống cho phép:

- Đo cân nặng tự động từ Bluetooth scale
- Quét mã QR CCCD để lấy thông tin cá nhân
- Tính toán các chỉ số thành phần cơ thể (BMI, BMR, TDEE, tỷ lệ mỡ, nước, cơ...)
- Nhận khuyến nghị AI về sức khỏe
- Lưu trữ dữ liệu và publish lên MQTT server

## 🚀 Hướng dẫn chạy nhanh

### Bước 1: Cài đặt dependencies

```bash
pip install -r web_requirements.txt
```

### Bước 2: Cấu hình API keys (tùy chọn)

Tạo file `.env` trong thư mục gốc:

```env
GOOGLE_API_KEY=your_google_api_key_here
LANGCHAIN_API_KEY=your_langchain_api_key_here
```

> **Lưu ý:** Nếu không có API key, web app vẫn hoạt động nhưng sẽ không có khuyến nghị AI.

### Bước 3: Chạy web app

```bash
python app.py
```

### Bước 4: Truy cập web app

Mở trình duyệt và truy cập: **http://localhost:5000**

## 🎯 Tính năng chính

### ✅ **Nhập thông tin thủ công**
- Form đầy đủ với validation
- Họ tên, ngày sinh, giới tính, tuổi
- Chiều cao (cân nặng được đo tự động từ Bluetooth scale)
- Hệ số hoạt động (từ ít vận động đến rất nhiều vận động)
- Số CCCD và địa chỉ thường trú (tùy chọn)

### ✅ **Quét QR CCCD**
- Tích hợp camera để quét mã QR trên CCCD
- Tự động trích xuất thông tin: họ tên, ngày sinh, giới tính, số CCCD, địa chỉ
- Chỉ cần nhập thêm chiều cao và hệ số hoạt động

### ✅ **Đo cân nặng từ Bluetooth scale**
- Tích hợp Bluetooth để kết nối với cân thông minh
- Hỗ trợ cân Crenot Gofit S2 và Mi Scale 2
- Đo cân nặng tự động, không cần nhập thủ công
- Xác nhận cân nặng trước khi tính toán

### ✅ **Tính toán các chỉ số cơ thể**
- **BMI** (Body Mass Index)
- **BMR** (Basal Metabolic Rate)
- **TDEE** (Total Daily Energy Expenditure)
- **Khối lượng cơ thể nạc** (Lean Body Mass)
- **Tỷ lệ mỡ** (Fat Percentage)
- **Tỷ lệ nước** (Water Percentage)
- **Khối lượng cơ** (Muscle Mass)
- **Khối lượng xương** (Bone Mass)
- **Tỷ lệ protein** (Protein Percentage)
- **Mỡ nội tạng** (Visceral Fat)
- **Cân nặng lý tưởng** (Ideal Weight)

### ✅ **Khuyến nghị AI**
- Sử dụng Google Gemini AI để đưa ra khuyến nghị sức khỏe
- Phân tích chi tiết các chỉ số và đưa ra lời khuyên

### ✅ **Lưu trữ dữ liệu**
- Tự động lưu kết quả vào file `user_data.csv`
- Xem lịch sử đo của người dùng
- Thông báo trạng thái lưu dữ liệu

### ✅ **Publish MQTT**
- Tự động publish dữ liệu lên MQTT broker
- Tích hợp với ThingsBoard để theo dõi real-time
- Cấu hình MQTT: `app.coreiot.io:1883`

### ✅ **Giao diện đẹp**
- Bootstrap 5 + Material Design
- Responsive - Hỗ trợ mobile và desktop
- Export kết quả - In hoặc xem chi tiết

## 📁 Cấu trúc thư mục

```
xiaomi_smart_scale/
├── app.py                          # Flask web application chính
├── main.py                         # Desktop application (Tkinter)
├── web_requirements.txt            # Dependencies cho web app
├── requirements.txt                # Dependencies cho desktop app
├── templates/                      # HTML templates
│   ├── index.html                 # Trang chủ
│   └── results.html               # Trang kết quả chi tiết
├── static/                        # Static files
│   ├── style.css                  # CSS styling
│   ├── script.js                  # JavaScript chính
│   ├── results.js                 # JavaScript cho trang kết quả
│   └── enhanced-charts.js         # Charts và visualizations
├── pkl/                          # Machine learning models
│   ├── body_fat.pkl
│   └── weight-height.pkl
├── user_data/                    # Dữ liệu người dùng
│   └── user_data.csv
├── logo/                         # Logo và hình ảnh
│   └── hcmut.png
└── [các file Python modules...]  # Các module Python gốc
```

## 🔧 API Endpoints

### 1. Tính toán chỉ số cơ thể
- **URL:** `POST /api/calculate`
- **Mô tả:** Tính toán các chỉ số cơ thể dựa trên thông tin người dùng
- **Input:** JSON với thông tin người dùng
- **Output:** Kết quả tính toán và khuyến nghị AI

### 2. Bluetooth Scale
- **URL:** `POST /api/start-weight-measurement`
- **Mô tả:** Bắt đầu đo cân nặng từ Bluetooth scale
- **URL:** `GET /api/get-current-weight`
- **Mô tả:** Lấy cân nặng hiện tại từ scale
- **URL:** `POST /api/confirm-weight`
- **Mô tả:** Xác nhận cân nặng và chuyển sang bước tính toán

### 3. Lưu trữ dữ liệu
- **URL:** `POST /api/save-results`
- **Mô tả:** Lưu kết quả vào CSV (backup function)
- **URL:** `GET /api/get-history/<name>`
- **Mô tả:** Lấy lịch sử đo của người dùng

### 4. Quét CCCD
- **URL:** `POST /api/scan-cccd`
- **Mô tả:** Quét mã QR CCCD và trả về thông tin đã trích xuất

### 5. MQTT Publish
- **URL:** `POST /api/publish-mqtt`
- **Mô tả:** Publish dữ liệu lên MQTT broker

### 6. Đo thăng bằng
- **URL:** `POST /api/balance-test`
- **Mô tả:** Đo thời gian thăng bằng đứng 1 chân

## 📡 Cấu hình MQTT

### Thông tin kết nối
- **Broker**: `app.coreiot.io`
- **Port**: `1883`
- **Username**: `smart-scale`
- **Password**: `smart-scale`
- **Client ID**: `smart-scale`
- **Topic**: `v1/devices/me/telemetry`

### Cấu hình trong code
```python
MQTT_CONFIG = {
    'broker': "app.coreiot.io",
    'port': 1883,
    'username': "smart-scale",
    'password': "smart-scale",
    'client_id': "smart-scale",
    'topic': "v1/devices/me/telemetry"
}
```

### Cấu trúc dữ liệu được publish
```json
{
  "weight": 70.0,
  "height": 170.0,
  "bmi": 24.22,
  "body_fat_percentage": 15.5,
  "muscle_mass": 45.2,
  "bone_mass": 3.1,
  "water_percentage": 60.0,
  "visceral_fat": 8.0,
  "metabolic_age": 28,
  "timestamp": "2024-01-15 10:30:00"
}
```

## 🎮 Cách sử dụng

### 1. Nhập thông tin thủ công
1. Truy cập `http://localhost:5000`
2. Chọn tab "Nhập thủ công"
3. Điền đầy đủ thông tin bắt buộc
4. Nhấn "Tính toán"

### 2. Quét QR CCCD
1. Chọn tab "Quét CCCD"
2. Nhấn "Quét mã QR CCCD"
3. Cho phép truy cập camera
4. Hướng camera vào mã QR trên CCCD
5. Nhập thêm chiều cao, cân nặng và hệ số hoạt động
6. Nhấn "Tính toán"

### 3. Đo cân nặng từ Bluetooth
1. Nhấn "Bắt đầu đo cân"
2. Đứng lên cân Bluetooth
3. Chờ nhận được cân nặng
4. Xác nhận cân nặng
5. Tiếp tục với các bước khác

### 4. Xem kết quả
- Kết quả sẽ hiển thị trong modal popup
- Nhấn "Xem chi tiết" để chuyển đến trang kết quả đầy đủ
- Có thể in kết quả hoặc phân tích mới

## 🔍 Log và Monitoring

### Thông báo trạng thái trong log:

#### 🔍 **Khi bắt đầu đo cân:**
```
🔍 BLUETOOTH: Bắt đầu tìm kiếm thiết bị cân...
📱 BLUETOOTH: Tìm kiếm thiết bị: Crenot Gofit S2
```

#### ✅ **Khi tìm thấy thiết bị:**
```
✅ BLUETOOTH: Đã tìm thấy thiết bị: Crenot Gofit S2
🔄 BLUETOOTH: Đang kết nối và chờ dữ liệu cân nặng...
```

#### ⚖️ **Khi nhận được cân nặng:**
```
📱 BLUETOOTH: Nhận được cân nặng từ thiết bị: 70.5 kg
```

#### ✅ **Khi xác nhận cân nặng:**
```
✅ XÁC NHẬN: Cân nặng 70.5 kg đã được xác nhận từ người dùng
```

#### 🧮 **Khi tính toán các chỉ số:**
```
⚖️  CÂN NẶNG NHẬN ĐƯỢC: 70.5 kg
📏 CHIỀU CAO: 170 cm
🧮 BMI TÍNH TOÁN: 24.39
--------------------------------------------------
```

#### 💾 **Khi lưu CSV:**
```
💾 Đang lưu dữ liệu vào CSV...
✅ CSV: Đã lưu dữ liệu vào CSV thành công!
```

#### 📡 **Khi publish MQTT:**
```
📡 Đang publish dữ liệu lên MQTT server...
✅ MQTT: Đã publish dữ liệu lên server thành công!
   📍 Topic: v1/devices/me/telemetry
   🏠 Broker: app.coreiot.io:1883
==================================================
```

## 🛠️ Troubleshooting

### Lỗi camera không hoạt động
- Kiểm tra quyền truy cập camera
- Thử refresh trang và cho phép camera lại

### Lỗi AI recommendations
- Kiểm tra API key trong file .env
- Đảm bảo kết nối internet

### Lỗi tính toán
- Kiểm tra dữ liệu đầu vào
- Đảm bảo các file .pkl models tồn tại

### Lỗi MQTT
- Kiểm tra kết nối internet
- Xác nhận thông tin broker, port, username, password
- Kiểm tra firewall settings

### Lỗi import modules
- Chạy: `pip install -r web_requirements.txt`
- Kiểm tra Python version (>= 3.8)

## 🔧 Phát triển thêm

### Thêm tính năng mới
1. Tạo API endpoint mới trong `app.py`
2. Thêm giao diện trong `templates/`
3. Cập nhật JavaScript trong `static/`

### Tùy chỉnh giao diện
- Chỉnh sửa `static/style.css`
- Sử dụng Bootstrap classes
- Thêm animations với CSS

### Tích hợp database
- Có thể thêm SQLAlchemy để lưu trữ dữ liệu
- Tạo user accounts và lịch sử đo
- Export dữ liệu ra Excel/PDF

### Tích hợp với ThingsBoard
Dữ liệu được publish lên topic `v1/devices/me/telemetry` có thể được ThingsBoard nhận và xử lý để:
- Hiển thị dashboard real-time
- Tạo alerts và notifications
- Phân tích xu hướng sức khỏe
- Lưu trữ lịch sử dữ liệu

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. File log để xem thông báo lỗi chi tiết
2. Kiểm tra console log để xem lỗi
3. Đảm bảo tất cả dependencies đã được cài đặt
4. Kiểm tra kết nối internet và MQTT broker

---

🎉 **Chúc bạn sử dụng E-Health Station thành công!**

