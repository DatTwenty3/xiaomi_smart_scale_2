"""
Quét mã QR CCCD bằng camera, trích xuất và chuẩn hóa thông tin cá nhân.
"""
import cv2
import time
from pyzbar import pyzbar
import logging

logger = logging.getLogger(__name__)

def scan_cccd_qr():
    """
    Quét mã QR CCCD và trả về dữ liệu đã phân tích.
    Returns:
        dict: Thông tin CCCD hoặc None nếu thất bại/hủy
    """
    cap = None
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise RuntimeError("Cannot open camera")
        logger.info("Camera ready. Point CCCD QR code to camera...")
        logger.info("Press 'q' to cancel")
        last_data = ""
        last_time = 0
        cooldown = 1
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            codes = pyzbar.decode(frame)
            for code in codes:
                x, y, w, h = code.rect
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                data = code.data.decode('utf-8')
                current_time = time.time()
                if data != last_data or (current_time - last_time) > cooldown:
                    parsed_data = _parse_cccd_data(data)
                    if parsed_data:
                        logger.info("CCCD detected! Processing...")
                        return parsed_data
                    last_data = data
                    last_time = current_time
            cv2.imshow('CCCD QR Scanner - Press Q to cancel', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                logger.info("Scan cancelled by user")
                break
    except Exception as e:
        logger.error(f"Error: {e}")
        return None
    finally:
        if cap:
            cap.release()
        cv2.destroyAllWindows()
    return None

def _parse_cccd_data(data):
    """
    Phân tích dữ liệu QR CCCD thành dict chuẩn hóa.
    """
    parts = data.split('|')
    if len(parts) < 6:
        return None
    try:
        cccd_id = parts[0].strip()
        cmnd_id = parts[1].strip()
        name = parts[2].strip()
        dob_raw = parts[3].strip()
        gender = parts[4].strip()
        if gender.lower() == "nam":
            gender = "male"
        elif gender.lower() == "nữ" or gender.lower() == "nu":
            gender = "female"
        address = parts[5].strip()
        issue_date_raw = parts[6].strip() if len(parts) > 6 else ""
        dob_formatted = _format_date(dob_raw)
        issue_date_formatted = _format_date(issue_date_raw) if issue_date_raw else ""
        return {
            "name": name,
            "dob": dob_formatted,
            "gender": gender,
            "cccd_id": cccd_id,
            "cmnd_id": cmnd_id,
            "address": address,
            "issue_date": issue_date_formatted
        }
    except (IndexError, ValueError):
        return None

def _format_date(date_str):
    """
    Định dạng ngày từ ddmmyyyy sang dd/mm/yyyy.
    """
    if len(date_str) == 8 and date_str.isdigit():
        day = date_str[:2]
        month = date_str[2:4]
        year = date_str[4:8]
        return f"{day}/{month}/{year}"
    return date_str

if __name__ == "__main__":
    result = scan_cccd_qr()
    print(result)
    if result:
        print("\n" + "=" * 50)
        print("CCCD INFORMATION:")
        print("=" * 50)
        for key, value in result.items():
            print(f'{key}: {value}')
        print("=" * 50)
    else:
        print("No CCCD data found or scan cancelled")