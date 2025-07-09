from gtts import gTTS
import os


def read_recommend_vietnamese(user_info, text):
    """
    Đọc khuyến nghị sức khỏe bằng tiếng Việt dựa trên thông tin người dùng và nội dung text.
    Args:
        user_info (dict): Thông tin người dùng (name, age, weight)
        text (str): Nội dung khuyến nghị
    Returns:
        None
    """
    try:
        full_text = f"Chào bạn {user_info['name']}, với độ tuổi là {user_info['age']} tuổi và cân nặng là {user_info['weight']} kí lô gam " + text
        # Tạo đối tượng gTTS với văn bản tiếng Việt
        tts = gTTS(text=full_text, lang='vi', slow=False)
        # Lưu âm thanh vào một file tạm
        audio_path = "audio/audio.mp3"
        tts.save(audio_path)
        # Phát âm thanh
        os.system(f"start {audio_path}")  # Windows
    except Exception as e:
        print(f"Lỗi đọc khuyến nghị bằng tiếng Việt: {e}")