import time

from paho.mqtt.client import PUBLISH

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

while True:
    mqtt_client.publish('v1/devices/me/telemetry', measurements)
    # Cập nhật giá trị hoặc thực hiện các thao tác khác nếu cần
    measurements['temperature'] += 1
    measurements['humidity'] += 1
    measurements['light'] += 1
    time.sleep(5)