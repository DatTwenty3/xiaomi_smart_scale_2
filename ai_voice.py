from gtts import gTTS
import os


def read_recommend_vietnamese(text):
    # Tạo đối tượng gTTS với văn bản tiếng Việt
    tts = gTTS(text = text, lang = 'vi', slow=False)

    # Lưu âm thanh vào một file tạm
    tts.save("audio/temp_audio.mp3")

    # Phát âm thanh
    os.system("start audio/temp_audio.mp3")  # Windows