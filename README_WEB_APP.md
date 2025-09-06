# Xiaomi Smart Scale - Web Application

## Tổng quan

Web application này đóng vai trò là front-end cho dự án Xiaomi Smart Scale, cho phép người dùng:

- Nhập thông tin cơ thể thủ công
- Quét mã QR từ CCCD để lấy dữ liệu tự động
- Tính toán và hiển thị các chỉ số thành phần cơ thể
- Nhận khuyến nghị AI về sức khỏe

## Tính năng chính

### 1. Nhập thông tin thủ công
- Họ tên, ngày sinh, giới tính, tuổi
- Chiều cao (cân nặng được đo tự động từ Bluetooth scale)
- Hệ số hoạt động (từ ít vận động đến rất nhiều vận động)
- Số CCCD (tùy chọn)
- Địa chỉ thường trú (tùy chọn)

### 2. Quét QR CCCD
- Tích hợp camera để quét mã QR trên CCCD
- Tự động trích xuất thông tin: họ tên, ngày sinh, giới tính, số CCCD, địa chỉ
- Chỉ cần nhập thêm chiều cao và hệ số hoạt động (cân nặng được đo tự động)

### 3. Đo cân nặng từ Bluetooth scale
- Tích hợp Bluetooth để kết nối với cân thông minh
- Hỗ trợ cân Crenot Gofit S2 và Mi Scale 2
- Đo cân nặng tự động, không cần nhập thủ công
- Xác nhận cân nặng trước khi tính toán

### 4. Tính toán các chỉ số
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

### 5. Khuyến nghị AI
- Sử dụng Google Gemini AI để đưa ra khuyến nghị sức khỏe
- Phân tích chi tiết các chỉ số và đưa ra lời khuyên

### 6. Lưu trữ dữ liệu
- Tự động lưu kết quả vào file `user_data.csv`
- Xem lịch sử đo của người dùng
- Thông báo trạng thái lưu dữ liệu
- Tương thích với định dạng CSV hiện có

## Cài đặt

### 1. Cài đặt dependencies

```bash
pip install -r web_requirements.txt
```

### 2. Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc:

```env
GOOGLE_API_KEY=your_google_api_key_here
LANGCHAIN_API_KEY=your_langchain_api_key_here
```

### 3. Chạy ứng dụng

```bash
python app.py
```

Ứng dụng sẽ chạy tại: `http://localhost:5000`

## Cấu trúc thư mục

```
xiaomi_smart_scale/
├── app.py                          # Flask web application chính
├── web_requirements.txt            # Dependencies cho web app
├── templates/                      # HTML templates
│   ├── index.html                 # Trang chủ
│   └── results.html               # Trang kết quả chi tiết
├── static/                        # Static files
│   ├── style.css                  # CSS styling
│   ├── script.js                  # JavaScript chính
│   └── results.js                 # JavaScript cho trang kết quả
├── pkl/                          # Machine learning models
│   ├── body_fat.pkl
│   └── weight-height.pkl
└── [các file Python gốc...]      # Các module Python gốc
```

## API Endpoints

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

**Response:**
```json
{
    "success": true,
    "data": {
        "name": "Nguyễn Văn A",
        "dob": "01/01/1990",
        "gender": "male",
        "cccd_id": "123456789012",
        "address": "Hà Nội"
    }
}
```

### POST /api/calculate
Tính toán các chỉ số cơ thể dựa trên thông tin đã nhập.

**Request Body:**
```json
{
    "height": 170,
    "weight": 70,
    "activity_factor": 1.55,
    "name": "Nguyễn Văn A",
    "dob": "01/01/1990",
    "gender": "male",
    "age": 34
}
```

**Response:**
```json
{
    "success": true,
    "user_info": {...},
    "body_composition": {
        "bmi": 24.22,
        "bmr": 1680.5,
        "tdee": 2604.8,
        "lbm": 55.2,
        "fp": 15.5,
        "wp": 60.2,
        "ms": 45.8,
        "bm": 2.8,
        "pp": 18.5,
        "vf": 8.2,
        "iw": 63.0
    },
    "ai_recommendations": "Khuyến nghị từ AI...",
    "timestamp": "2024-01-01 12:00:00"
}
```

### POST /api/clear-session
Xóa dữ liệu session.

## Sử dụng

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

### 3. Xem kết quả
- Kết quả sẽ hiển thị trong modal popup
- Nhấn "Xem chi tiết" để chuyển đến trang kết quả đầy đủ
- Có thể in kết quả hoặc phân tích mới

## Lưu ý kỹ thuật

### Camera và QR Scanning
- Cần camera để quét QR CCCD
- Sử dụng OpenCV và pyzbar để xử lý QR code
- Hỗ trợ định dạng QR code chuẩn của CCCD Việt Nam

### AI Recommendations
- Sử dụng Google Gemini AI
- Cần API key hợp lệ
- Có thể tắt tính năng này nếu không có API key

### Responsive Design
- Hỗ trợ mobile và desktop
- Sử dụng Bootstrap 5
- Giao diện Material Design

## Troubleshooting

### Lỗi camera không hoạt động
- Kiểm tra quyền truy cập camera
- Thử refresh trang và cho phép camera lại

### Lỗi AI recommendations
- Kiểm tra API key trong file .env
- Đảm bảo kết nối internet

### Lỗi tính toán
- Kiểm tra dữ liệu đầu vào
- Đảm bảo các file .pkl models tồn tại

## Phát triển thêm

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

## Liên hệ

Nếu có vấn đề hoặc góp ý, vui lòng tạo issue trên repository.
