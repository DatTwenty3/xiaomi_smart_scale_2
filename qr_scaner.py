import cv2
import time
from pyzbar import pyzbar


def scan_cccd_qr():
    """
    Scan CCCD QR code and return parsed data.

    Returns:
        dict: Parsed CCCD data or None if failed/cancelled
        {
            "name": str,
            "dob": str,
            "gender": str,
            "cccd_id": str,
            "cmnd_id": str,
            "address": str,
            "issue_date": str
        }
    """
    cap = None
    try:
        # Initialize camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise RuntimeError("Cannot open camera")

        print("Camera ready. Point CCCD QR code to camera...")
        print("Press 'q' to cancel")

        last_data = ""
        last_time = 0
        cooldown = 1  # 1 second cooldown

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Flip frame and detect QR codes
            frame = cv2.flip(frame, 1)
            codes = pyzbar.decode(frame)

            for code in codes:
                # Draw detection box
                x, y, w, h = code.rect
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

                # Decode QR data
                data = code.data.decode('utf-8')
                current_time = time.time()

                # Process with cooldown
                if data != last_data or (current_time - last_time) > cooldown:
                    parsed_data = _parse_cccd_data(data)
                    if parsed_data:
                        print("CCCD detected! Processing...")
                        return parsed_data

                    last_data = data
                    last_time = current_time

            # Show frame
            cv2.imshow('CCCD QR Scanner - Press Q to cancel', frame)

            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("Scan cancelled by user")
                break

    except Exception as e:
        print(f"Error: {e}")
        return None
    finally:
        # Cleanup
        if cap:
            cap.release()
        cv2.destroyAllWindows()

    return None


def _parse_cccd_data(data):
    """Parse CCCD QR code data into structured format."""
    parts = data.split('|')
    if len(parts) < 6:
        return None

    try:
        cccd_id = parts[0].strip()
        cmnd_id = parts[1].strip()
        name = parts[2].strip()
        dob_raw = parts[3].strip()
        gender = parts[4].strip()
        address = parts[5].strip()
        issue_date_raw = parts[6].strip() if len(parts) > 6 else ""

        # Format date of birth (ddmmyyyy -> dd/mm/yyyy)
        dob_formatted = _format_date(dob_raw)

        # Format issue date
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
    """Format date from ddmmyyyy to dd/mm/yyyy."""
    if len(date_str) == 8 and date_str.isdigit():
        day = date_str[:2]
        month = date_str[2:4]
        year = date_str[4:8]
        return f"{day}/{month}/{year}"
    return date_str


# Example usage
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