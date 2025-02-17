import paho.mqtt.client as mqttclient
import time
import json

BROKER_ADDRESS = "app.coreiot.io"
PORT = 1883
ACCESS_TOKEN = "smart-scale"
ACCESS_USERNAME = "smart-scale"

def subscribed(client, userdata, mid, granted_qos):
    print("Subscribed...")


def recv_message(client, userdata, message):
    print("Received: ", message.payload.decode("utf-8"))
    temp_data = {'value': True}
    try:
        jsonobj = json.loads(message.payload)
        if jsonobj['method'] == "setValue":
            temp_data['value'] = jsonobj['params']
            client.publish('v1/devices/me/attributes', json.dumps(temp_data), 1)
    except:
        pass


def connected(client, usedata, flags, rc):
    if rc == 0:
        print("Connected successfully!!")
        client.subscribe("v1/devices/me/rpc/request/+")
    else:
        print("Connection is failed")


client = mqttclient.Client("smart-scale")
client.username_pw_set(ACCESS_USERNAME, ACCESS_TOKEN)

client.on_connect = connected
client.connect(BROKER_ADDRESS, 1883)
client.loop_start()

client.on_subscribe = subscribed
client.on_message = recv_message

temp = 30
humi = 50
light_intesity = 100
counter = 0
while True:
    collect_data = {'temperature': temp, 'humidity': humi, 'light':light_intesity}
    temp += 1
    humi += 1
    light_intesity += 1
    measurements = {
        'gender': 'male',
        'weight': 70.0,
        'age': 30,
        'bmi': 22.5,
        'bmr': 1500,
        'tdee': 2000,
        'lbm': 60.0,
        'fp': 15.0,
        'wp': 50.0,
        'bm': 5.0,
        'ms': 25.0,
        'pp': 18.0,
        'vf': 10.0,
        'iw': 65.0
    }
    client.publish('v1/devices/me/telemetry', json.dumps(measurements), 1)
    time.sleep(5)