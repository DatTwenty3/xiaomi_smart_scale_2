# Hướng dẫn sử dụng chức năng MQTT

## Tổng quan

Dự án Xiaomi Smart Scale đã được tích hợp chức năng publish dữ liệu lên MQTT broker sau khi đo và tính toán các chỉ số cơ thể. Dữ liệu sẽ được gửi tự động lên MQTT broker khi người dùng hoàn thành quá trình đo.

## Cấu hình MQTT

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

## Cách hoạt động

### 1. Tự động publish trong web app
Khi người dùng hoàn thành quá trình đo và tính toán các chỉ số cơ thể thông qua web interface, dữ liệu sẽ được publish tự động lên MQTT:

```python
# Trong hàm calculate_metrics() của app.py
if mqtt_client:
    mqtt_client.publish(MQTT_CONFIG['topic'], body_composition)
    print("✓ Đã publish dữ liệu lên MQTT thành công!")
```

### 2. API endpoint riêng biệt
Có thể gọi API endpoint `/api/publish-mqtt` để publish dữ liệu lên MQTT một cách độc lập:

```bash
curl -X POST http://localhost:5000/api/publish-mqtt \
  -H "Content-Type: application/json" \
  -d '{
    "body_composition": {
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
  }'
```

## Cấu trúc dữ liệu được publish

Dữ liệu được publish lên MQTT có cấu trúc như sau:

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

## Testing

### 1. Chạy test script
```bash
python test_mqtt_publish.py
```

### 2. Kiểm tra log
Khi chạy Flask app, bạn sẽ thấy các log message:
```
✓ Đã publish dữ liệu lên MQTT thành công!
```

### 3. Kiểm tra kết nối MQTT
Script test sẽ kiểm tra:
- Kết nối MQTT broker
- Publish dữ liệu test
- Response từ Flask app endpoints

## Xử lý lỗi

### Lỗi kết nối MQTT
```python
try:
    mqtt_client.publish(MQTT_CONFIG['topic'], body_composition)
    print("✓ Đã publish dữ liệu lên MQTT thành công!")
except Exception as e:
    print(f"✗ Lỗi khi publish MQTT: {e}")
```

### Kiểm tra MQTT client
```python
if mqtt_client:
    # Publish data
else:
    print("✗ MQTT client chưa được khởi tạo")
```

## Monitoring

### 1. Log messages
- `✓ Đã publish dữ liệu lên MQTT thành công!` - Publish thành công
- `✗ Lỗi khi publish MQTT: {error}` - Có lỗi xảy ra
- `✗ MQTT client chưa được khởi tạo` - Client chưa sẵn sàng

### 2. Response từ API
```json
{
  "success": true,
  "user_info": {...},
  "body_composition": {...},
  "ai_recommendations": {...},
  "timestamp": "2024-01-15 10:30:00",
  "csv_saved": true,
  "mqtt_published": true
}
```

## Troubleshooting

### 1. MQTT client không kết nối được
- Kiểm tra kết nối internet
- Xác nhận thông tin broker, port, username, password
- Kiểm tra firewall settings

### 2. Dữ liệu không được publish
- Kiểm tra log messages
- Xác nhận MQTT client đã được khởi tạo
- Kiểm tra cấu trúc dữ liệu

### 3. Lỗi JSON serialization
- Đảm bảo dữ liệu có thể serialize thành JSON
- Kiểm tra các giá trị None hoặc NaN

## Tích hợp với ThingsBoard

Dữ liệu được publish lên topic `v1/devices/me/telemetry` có thể được ThingsBoard nhận và xử lý để:
- Hiển thị dashboard real-time
- Tạo alerts và notifications
- Phân tích xu hướng sức khỏe
- Lưu trữ lịch sử dữ liệu
