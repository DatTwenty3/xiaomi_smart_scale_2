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

    Parameters:
        cap: Đối tượng VideoCapture (camera).
        duration (int): Thời gian đếm ngược (giây).
        message (str): Thông báo hiển thị trên màn hình.
    """
    start_time = time.time()
    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret:
            break
        # Chuyển đổi màu sắc để hiển thị
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        # Tính thời gian còn lại
        remaining_time = int(duration - (time.time() - start_time))
        # Hiển thị thông báo và thời gian còn lại
        cv2.putText(image, f"{message} trong {remaining_time} giay", (30, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.imshow("Countdown", image)
        # Thoát nếu nhấn 'q'
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
            # Chờ 1 giây trước khi thu thập mẫu tiếp theo
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

    Parameters:
        camera_index (int): Chỉ số camera (mặc định 0).
        num_samples (int): Số lượng mẫu thu thập cho mỗi tư thế (mặc định 20).

    Returns:
        dict: Kết quả phiên gồm:
              - 'session_duration': Thời gian đứng 1 chân (giây).
              - 'avg_offset': Độ lệch trung tâm trung bình (theo pixel).
              - 'baseline': Điểm COM baseline (x, y) khi đứng 2 chân.
    """
    # Mở camera
    cap = cv2.VideoCapture(camera_index)

    with mp_pose.Pose(min_detection_confidence = 0.5, min_tracking_confidence = 0.5) as pose:
        countdown(cap, 10, "Chuan bi dung hai chan")
        # Thu thập mẫu cho tư thế đứng hai chân
        print("Vui long dung hai chan...")
        two_legs_samples = collect_samples(pose, cap, num_samples, "Dung hai chan de thu thap mau")
        countdown(cap, 10, "Chuan bi dung mot chan")

        # Thu thập mẫu cho tư thế đứng một chân
        print("Vui long dung mot chan...")
        one_leg_samples = collect_samples(pose, cap, num_samples, "Dung mot chan de thu thap mau")
        countdown(cap, 10, "Chuan bi bat dau do")

        # Kiểm tra nếu không thu thập đủ mẫu
        if len(two_legs_samples) < num_samples or len(one_leg_samples) < num_samples:
            print("Khong thu thap du mau. Dang thoat...")
            cap.release()
            cv2.destroyAllWindows()
            return {'session_duration': 0, 'avg_offset': 0, 'baseline': None}

        # Chuyển sang giai đoạn chính
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

                # Chuyển landmarks thành vector
                current_vector = landmarks_to_vector(landmarks)

                # Tính độ tương đồng lớn nhất với các mẫu
                one_leg_sim = calculate_max_similarity(current_vector, one_leg_samples)
                two_legs_sim = calculate_max_similarity(current_vector, two_legs_samples)

                # Tính điểm COM dựa trên trung điểm hông
                left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                center_hip_x = (left_hip.x + right_hip.x) / 2
                center_hip_y = (left_hip.y + right_hip.y) / 2
                current_com = (int(center_hip_x * w), int(center_hip_y * h))

                # Xác định tư thế
                if one_leg_sim > two_legs_sim:
                    # Đang đứng một chân
                    if not session_active:
                        session_active = True
                        session_start_time = time.time()
                        session_offsets = []
                        if baseline_com is None:
                            baseline_com = current_com

                    # Tính offset và các thông tin khác
                    offset = abs(current_com[0] - baseline_com[0])
                    session_offsets.append(offset)
                    current_session_time = time.time() - session_start_time
                    cv2.putText(image, f"Thoi gian dung 1 chan: {current_session_time:.1f}s", (30, 50),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(image, f"Do lech trong tam: {offset}px", (30, 90),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                else:
                    # Đang đứng hai chân
                    if session_active:
                        # Kết thúc phiên
                        break
                    else:
                        cv2.putText(image, "Vui long dung 1 chan de bat dau!", (30, 50),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

                # Vẽ COM hiện tại (màu xanh dương)
                cv2.circle(image, current_com, 8, (255, 0, 0), -1)
                cv2.putText(image, "Vi tri COM hien tai", (current_com[0] + 10, current_com[1]),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

                # Vẽ COM baseline nếu có (màu xanh lá)
                if baseline_com is not None:
                    cv2.circle(image, baseline_com, 8, (0, 255, 0), -1)
                    cv2.putText(image, "Vi tri COM can bang", (baseline_com[0] + 10, baseline_com[1]),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

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


# Ví dụ sử dụng hàm:
if __name__ == "__main__":
    results = one_leg_balance_detection()
    print("=== KẾT QUẢ ĐO ===")
    print(f"Thời gian đứng 1 chân: {results['session_duration']:.1f} giây")
    print(f"Độ lệch trung tâm trung bình: {results['avg_offset']:.1f} pixels")