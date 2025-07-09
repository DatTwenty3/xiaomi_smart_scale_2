"""
Đo thời gian đứng 1 chân bằng camera, sử dụng MediaPipe Pose và so sánh vector landmarks.
"""
import cv2
import mediapipe as mp
import time
import numpy as np
from scipy.spatial.distance import cosine

# Khởi tạo các module từ MediaPipe
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Hàm hiển thị đếm ngược
def countdown(cap, duration, message):
    """
    Hiển thị đếm ngược trên màn hình trong khoảng thời gian nhất định.
    """
    start_time = time.time()
    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret:
            break
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        remaining_time = int(duration - (time.time() - start_time))
        cv2.putText(image, f"{message} trong {remaining_time} giay", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.imshow("Countdown", image)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    cv2.destroyWindow("Countdown")

def landmarks_to_vector(landmarks):
    """
    Chuyển đổi landmarks thành vector (x, y) của các điểm.
    """
    vector = []
    for lm in landmarks:
        vector.append(lm.x)
        vector.append(lm.y)
    return np.array(vector)

def calculate_max_similarity(current_vector, samples):
    """
    Tính độ tương đồng lớn nhất giữa vector hiện tại và các mẫu đã thu thập.
    """
    max_sim = 0
    for sample in samples:
        sim = 1 - cosine(current_vector, sample)
        if sim > max_sim:
            max_sim = sim
    return max_sim

def collect_samples(pose, cap, num_samples, instruction_text):
    """
    Thu thập các mẫu landmarks từ camera với hướng dẫn cụ thể.
    """
    samples = []
    collected = 0
    start_time = time.time()
    while collected < num_samples and time.time() - start_time < 30:
        ret, frame = cap.read()
        if not ret:
            break
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            landmarks = results.pose_landmarks.landmark
            vector = landmarks_to_vector(landmarks)
            samples.append(vector)
            collected += 1
            time.sleep(1)
        cv2.putText(image, instruction_text, (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(image, f"Da thu thap: {collected}/{num_samples}", (30, 90), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0), 2)
        cv2.imshow("Sample Collection", image)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break
    return samples

def one_leg_balance_detection(camera_index=0, num_samples=20):
    """
    Theo dõi tư thế đứng 1 chân qua camera và so sánh điểm trọng tâm khi đứng 1 chân
    với điểm trọng tâm khi đứng 2 chân (baseline) đã được cập nhật trước đó.
    """
    try:
        cap = cv2.VideoCapture(camera_index)
        with mp_pose.Pose(min_detection_confidence = 0.5, min_tracking_confidence = 0.5) as pose:
            countdown(cap, 10, "Chuan bi dung hai chan")
            print("Vui long dung hai chan...")
            two_legs_samples = collect_samples(pose, cap, num_samples, "Dung hai chan de thu thap mau")
            countdown(cap, 10, "Chuan bi dung mot chan")
            print("Vui long dung mot chan...")
            one_leg_samples = collect_samples(pose, cap, num_samples, "Dung mot chan de thu thap mau")
            countdown(cap, 10, "Chuan bi bat dau do")
            if len(two_legs_samples) < num_samples or len(one_leg_samples) < num_samples:
                print("Khong thu thap du mau. Dang thoat...")
                cap.release()
                cv2.destroyAllWindows()
                return {'session_duration': 0, 'avg_offset': 0, 'baseline': None}
            session_active = False
            session_start_time = None
            session_offsets = []
            baseline_com = None
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = pose.process(image)
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                h, w, _ = image.shape
                if results.pose_landmarks:
                    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                    landmarks = results.pose_landmarks.landmark
                    current_vector = landmarks_to_vector(landmarks)
                    one_leg_sim = calculate_max_similarity(current_vector, one_leg_samples)
                    two_legs_sim = calculate_max_similarity(current_vector, two_legs_samples)
                    left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                    right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                    center_hip_x = (left_hip.x + right_hip.x) / 2
                    center_hip_y = (left_hip.y + right_hip.y) / 2
                    current_com = (int(center_hip_x * w), int(center_hip_y * h))
                    if one_leg_sim > two_legs_sim:
                        if not session_active:
                            session_active = True
                            session_start_time = time.time()
                            session_offsets = []
                            if baseline_com is None:
                                baseline_com = current_com
                        offset = abs(current_com[0] - baseline_com[0])
                        session_offsets.append(offset)
                        current_session_time = time.time() - session_start_time
                        cv2.putText(image, f"Thoi gian dung 1 chan: {current_session_time:.1f}s", (30, 50),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        cv2.putText(image, f"Do lech trong tam: {offset}px", (30, 90),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    else:
                        if session_active:
                            break
                        else:
                            cv2.putText(image, "Vui long dung 1 chan de bat dau!", (30, 50),
                                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                cv2.imshow("One Leg Standing Timer", image)
                if cv2.waitKey(10) & 0xFF == ord('q'):
                    break
            cap.release()
            cv2.destroyAllWindows()
            if session_active:
                session_duration = time.time() - session_start_time
                avg_offset = np.mean(session_offsets) if session_offsets else 0
                result = {'session_duration': session_duration, 'avg_offset': avg_offset, 'baseline': baseline_com}
            else:
                result = {'session_duration': 0, 'avg_offset': 0, 'baseline': baseline_com}
            return result
    except Exception as e:
        print(f"Lỗi đo thăng bằng 1 chân: {e}")
        return {'session_duration': 0, 'avg_offset': 0, 'baseline': None}


# Ví dụ sử dụng hàm:
if __name__ == "__main__":
    results = one_leg_balance_detection()
    print("=== KẾT QUẢ ĐO ===")
    print(f"Thời gian đứng 1 chân: {results['session_duration']:.1f} giây")
    print(f"Độ lệch trung tâm trung bình: {results['avg_offset']:.1f} pixels")