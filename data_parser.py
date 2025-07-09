def data_parser(data, device_name):
    """
    Phân tích dữ liệu từ thiết bị cân thông minh để lấy giá trị cân nặng.
    Args:
        data (bytes): Dữ liệu nhận được từ thiết bị
        device_name (str): Tên thiết bị
    Returns:
        float: Giá trị cân nặng (kg), hoặc None nếu lỗi
    """
    try:
        if device_name == 'Crenot Gofit S2':
            weight = round((int(data.hex()[13:18], 16) - 524288) / 1000, 2)
            return weight
        else:
            weight = int.from_bytes(data[1:3], byteorder='little') / 200
            return weight
    except Exception as e:
        print(f"Lỗi phân tích dữ liệu cân: {e}")
        return None