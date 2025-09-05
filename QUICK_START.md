# 🚀 Hướng dẫn chạy nhanh Web App

## Bước 1: Cài đặt dependencies

```bash
pip install -r web_requirements.txt
```

## Bước 2: Cấu hình API keys (tùy chọn)

Tạo file `.env` trong thư mục gốc:

```env
GOOGLE_API_KEY=your_google_api_key_here
LANGCHAIN_API_KEY=your_langchain_api_key_here
```

> **Lưu ý:** Nếu không có API key, web app vẫn hoạt động nhưng sẽ không có khuyến nghị AI.

## Bước 3: Chạy web app

```bash
python app.py
```

## Bước 4: Truy cập web app

Mở trình duyệt và truy cập: **http://localhost:5000**

## Bước 5: Sử dụng

### Cách 1: Nhập thủ công
1. Chọn tab "Nhập thủ công"
2. Điền đầy đủ thông tin
3. Nhấn "Tính toán"

### Cách 2: Quét QR CCCD
1. Chọn tab "Quét CCCD"
2. Nhấn "Quét mã QR CCCD"
3. Cho phép truy cập camera
4. Hướng camera vào mã QR trên CCCD
5. Nhập chiều cao, cân nặng và hệ số hoạt động
6. Nhấn "Tính toán"

## Test web app

Chạy script test:

```bash
python test_web_app.py
```

## Cấu trúc file đã tạo

```
xiaomi_smart_scale/
├── app.py                    # Flask web app chính
├── web_requirements.txt      # Dependencies
├── test_web_app.py          # Script test
├── README_WEB_APP.md        # Hướng dẫn chi tiết
├── QUICK_START.md           # Hướng dẫn nhanh
├── templates/               # HTML templates
│   ├── index.html
│   └── results.html
└── static/                  # CSS & JavaScript
    ├── style.css
    ├── script.js
    └── results.js
```

## Tính năng chính

✅ **Nhập thông tin thủ công** - Form đầy đủ với validation  
✅ **Quét QR CCCD** - Tích hợp camera và OCR  
✅ **Tính toán chỉ số** - BMI, BMR, TDEE, tỷ lệ mỡ, nước, cơ...  
✅ **Khuyến nghị AI** - Sử dụng Google Gemini  
✅ **Giao diện đẹp** - Bootstrap 5 + Material Design  
✅ **Responsive** - Hỗ trợ mobile và desktop  
✅ **Export kết quả** - In hoặc xem chi tiết  

## Troubleshooting

### Lỗi camera không hoạt động
- Kiểm tra quyền truy cập camera
- Thử refresh trang

### Lỗi import modules
- Chạy: `pip install -r web_requirements.txt`
- Kiểm tra Python version (>= 3.8)

### Lỗi AI recommendations
- Kiểm tra file `.env` có API key không
- Kiểm tra kết nối internet

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. File `README_WEB_APP.md` để biết thêm chi tiết
2. Chạy `python test_web_app.py` để test
3. Kiểm tra console log để xem lỗi

---

🎉 **Chúc bạn sử dụng web app thành công!**
