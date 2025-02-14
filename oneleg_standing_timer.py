import cv2
import mediapipe as mp
import time
import numpy as np


def one_leg_balance_detection(camera_index=0, ankle_diff_threshold=0.1):
    """
    Theo dõi tư thế đứng 1 chân qua camera và so sánh điểm trọng tâm khi đứng 1 chân
    với điểm trọng tâm khi đứng 2 chân (baseline) đã được cập nhật trước đó.

    Parameters:
        camera_index (int): Chỉ số camera (mặc định 0).
        ankle_diff_threshold (float): Ngưỡng chênh lệch tọa độ y của 2 mắt cá chân để xác định "đứng 1 chân".

    Returns:
        dict: Kết quả phiên gồm:
              - 'session_duration': Thời gian đứng 1 chân (giây).
              - 'avg_offset': Độ lệch trung tâm trung bình (theo pixel).
              - 'baseline': Điểm COM baseline (x, y) khi đứng 2 chân.
    """
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    cap = cv2.VideoCapture(camera_index)

    session_active = False  # Cờ ghi nhận phiên đứng 1 chân
    session_start_time = None  # Thời điểm bắt đầu phiên
    session_offsets = []  # Danh sách lưu offset trong phiên
    baseline_com = None  # Điểm COM khi đứng 2 chân (baseline)

    with mp_pose.Pose(min_detection_confidence = 0.5, min_tracking_confidence = 0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Chuyển đổi màu ảnh cho MediaPipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            h, w, _ = image.shape

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                landmarks = results.pose_landmarks.landmark

                # Lấy tọa độ mắt cá chân trái và phải
                left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

                if left_ankle.visibility > 0.5 and right_ankle.visibility > 0.5:
                    # Tính chênh lệch tọa độ y (đã chuẩn hóa từ 0 đến 1)
                    diff = abs(left_ankle.y - right_ankle.y)

                    # Tính điểm COM dựa trên trung điểm hông
                    left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
                    right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
                    center_hip_x = (left_hip.x + right_hip.x) / 2
                    center_hip_y = (left_hip.y + right_hip.y) / 2
                    current_com = (int(center_hip_x * w), int(center_hip_y * h))

                    # Khi đang ở tư thế 2 chân (diff <= threshold) và chưa bắt đầu phiên, cập nhật baseline
                    if diff <= ankle_diff_threshold and not session_active:
                        baseline_com = current_com

                    # Vẽ COM hiện tại (màu xanh dương)
                    cv2.circle(image, current_com, 8, (255, 0, 0), -1)
                    cv2.putText(image, "Vi tri COM hien tai", (current_com[0] + 10, current_com[1]),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

                    # Vẽ COM baseline nếu có (màu xanh lá)
                    if baseline_com is not None:
                        cv2.circle(image, baseline_com, 8, (0, 255, 0), -1)
                        cv2.putText(image, "Vi tri COM can bang", (baseline_com[0] + 10, baseline_com[1]),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                    # Nếu diff vượt quá ngưỡng => phát hiện tư thế đứng 1 chân
                    if diff > ankle_diff_threshold:
                        if not session_active:
                            # Nếu chưa có baseline, lấy ngay COM hiện tại làm baseline
                            if baseline_com is None:
                                baseline_com = current_com
                            session_active = True
                            session_start_time = time.time()
                            session_offsets = []

                        # Tính offset là khoảng cách theo phương ngang giữa COM hiện tại và baseline
                        offset = abs(current_com[0] - baseline_com[0])
                        session_offsets.append(offset)
                        current_session_time = time.time() - session_start_time
                        cv2.putText(image, f"Thoi gian dung 1 chan: {current_session_time:.1f}s", (30, 50),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        cv2.putText(image, f"Do lech trong tam: {offset}px", (30, 90),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    else:
                        # Nếu phiên đang ghi nhận mà người dùng trở lại tư thế 2 chân, kết thúc phiên
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


# Ví dụ sử dụng hàm:
# if __name__ == "__main__":
#     results = one_leg_balance_detection()
#     print("=== KẾT QUẢ ĐO ===")
#     print(f"Thời gian đứng 1 chân: {results['session_duration']:.1f} giây")
#     print(f"Độ lệch trung tâm trung bình: {results['avg_offset']:.1f} pixels")
#     #print(f"Baseline COM (x, y): {results['baseline']}")