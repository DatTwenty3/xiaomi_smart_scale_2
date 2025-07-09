class HealthDataManager:
    """
    Quản lý thông tin người dùng và các chỉ số sức khỏe.
    """
    def __init__(self):
        """
        Khởi tạo các biến lưu trữ dữ liệu sức khỏe.
        """
        self.user_info = {}
        self.body_composition = {}
        self.measurements = {}

    def get_user_info(self):
        """
        Lấy thông tin người dùng.
        Returns:
            dict: Thông tin người dùng
        """
        return self.user_info

    def set_user_info(self, new_info):
        """
        Cập nhật thông tin người dùng.
        Args:
            new_info (dict): Thông tin mới
        """
        self.user_info = new_info

    def get_body_composition(self):
        """
        Lấy thông tin thành phần cơ thể.
        Returns:
            dict: Thông tin thành phần cơ thể
        """
        return self.body_composition

    def set_body_composition(self, new_body_composition):
        """
        Cập nhật thông tin thành phần cơ thể.
        Args:
            new_body_composition (dict): Thông tin mới
        """
        self.body_composition = new_body_composition