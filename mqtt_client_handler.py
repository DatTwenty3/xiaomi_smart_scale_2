import paho.mqtt.client as mqtt
import json
import logging

logger = logging.getLogger(__name__)

class MQTTClient:
    """
    Quản lý kết nối và giao tiếp với MQTT Broker.
    """
    def __init__(self, broker_address, port, username, password, client_id="client"):
        """
        Khởi tạo client MQTT.
        """
        self.client = mqtt.Client(client_id)
        self.client.username_pw_set(username, password)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.broker_address = broker_address
        self.port = port
        self.client.loop_start()

    def on_connect(self, client, userdata, flags, rc):
        """
        Xử lý sự kiện kết nối MQTT.
        """
        if rc == 0:
            logger.info("Kết nối với MQTT Broker thành công!")
            client.subscribe("v1/devices/me/rpc/request/+")
        else:
            logger.error(f"Kết nối bị lỗi với mã: {rc}")

    def on_message(self, client, userdata, message):
        """
        Xử lý khi nhận được message từ MQTT Broker.
        """
        payload = message.payload.decode("utf-8")
        logger.info(f"Received: {payload}")
        try:
            jsonobj = json.loads(payload)
            if jsonobj.get('method') == "setValue":
                temp_data = {'value': jsonobj.get('params')}
                client.publish('v1/devices/me/attributes', json.dumps(temp_data), qos=1)
        except Exception as e:
            logger.error(f"Đã xảy ra lỗi trong quá trình phản hồi MQTT Broker: {e}")

    def connect(self):
        """
        Kết nối tới MQTT Broker.
        """
        try:
            self.client.connect(self.broker_address, self.port)
        except Exception as e:
            logger.error(f"Lỗi khi kết nối MQTT: {e}")

    def publish(self, topic, payload, qos=1):
        """
        Gửi dữ liệu lên MQTT Broker.
        """
        try:
            self.client.publish(topic, json.dumps(payload), qos)
            logger.info('Đã publish thành công lên MQTT Broker!')
        except Exception as e:
            logger.error(f"Đã xảy ra lỗi trong quá trình publish lên MQTT Broker: {e}")