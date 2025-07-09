"""
Ví dụ sử dụng MQTTClient để publish dữ liệu telemetry lên MQTT Broker theo chu kỳ.
"""
import time
from mqtt_client_handler import MQTTClient

# Thông tin cấu hình
BROKER_ADDRESS = "app.coreiot.io"
PORT = 1883
USERNAME = "smart-scale"
PASSWORD = "smart-scale"
CLIENT_ID = "smart-scale"
PUBLISH_TOPIC = "v1/devices/me/telemetry"

# Khởi tạo và kết nối
mqtt_client = MQTTClient(BROKER_ADDRESS, PORT, USERNAME, PASSWORD, client_id=CLIENT_ID)
mqtt_client.connect()

# Ví dụ publish telemetry data theo chu kỳ
measurements = {
    'temperature': 30,
    'humidity': 50,
    'light': 100
}

def publish_loop():
    """
    Vòng lặp gửi dữ liệu telemetry lên MQTT Broker.
    """
    try:
        while True:
            mqtt_client.publish(PUBLISH_TOPIC, measurements)
            # Cập nhật giá trị hoặc thực hiện các thao tác khác nếu cần
            measurements['temperature'] += 1
            measurements['humidity'] += 1
            measurements['light'] += 1
            time.sleep(5)
    except KeyboardInterrupt:
        print("Dừng publish dữ liệu.")
    except Exception as e:
        print(f"Lỗi trong quá trình publish: {e}")

if __name__ == "__main__":
    publish_loop()