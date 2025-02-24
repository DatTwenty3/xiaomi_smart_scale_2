import paho.mqtt.client as mqtt
import json

class MQTTClient:
    def __init__(self, broker_address, port, username, password, client_id="client"):
        self.client = mqtt.Client(client_id)
        self.client.username_pw_set(username, password)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.broker_address = broker_address
        self.port = port
        self.client.loop_start()

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Kết nối với MQTT Broker thành công!")
            # Nếu cần subscribe topic nào, bạn có thể đặt ở đây
            client.subscribe("v1/devices/me/rpc/request/+")
        else:
            print("Kết nối bị lỗi với mã:", rc)

    def on_message(self, client, userdata, message):
        payload = message.payload.decode("utf-8")
        print("Received:", payload)
        try:
            jsonobj = json.loads(payload)
            if jsonobj.get('method') == "setValue":
                temp_data = {'value': jsonobj.get('params')}
                client.publish('v1/devices/me/attributes', json.dumps(temp_data), qos=1)
        except Exception as e:
            print("Đã xảy ra lỗi trong quá trình phản hồi MQTT Broker:", e)

    def connect(self):
        self.client.connect(self.broker_address, self.port)

    def publish(self, topic, payload, qos=1):
        """Hàm publish có thể gọi từ bên ngoài"""
        try:
            self.client.publish(topic, json.dumps(payload), qos)
            print('Đã publish thành công lên MQTT Broker !')
        except Exception as e:
            print("Đã xảy ra lỗi trong quá trình publish lên MQTT Broker:", e)