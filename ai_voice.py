from gtts import gTTS
import os


def read_recommend_vietnamese(user_info, text):
    text = f"""Chào bạn {user_info['name']}, với độ tuổi là {user_info['age']} tuổi và cân nặng là {user_info['weight']} kí lô gam """ + text

    # Tạo đối tượng gTTS với văn bản tiếng Việt
    tts = gTTS(text = text, lang = 'vi', slow=False)

    # Lưu âm thanh vào một file tạm
    tts.save("audio/audio.mp3")

    # Phát âm thanh
    os.system("start audio/audio.mp3")  # Windows