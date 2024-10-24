class HealthDataManager:
    def __init__(self):
        # Khởi tạo các biến lưu trữ dữ liệu
        self.user_info = {}
        self.body_composition = {}
        self.measurements = {}

    # Hàm get user_info
    def get_user_info(self):
        return self.user_info

    # Hàm set user_info
    def set_user_info(self, new_info):
        self.user_info = new_info

    # Hàm get body_composition
    def get_body_composition(self):
        return self.body_composition

    # Hàm set body_composition
    def set_body_composition(self, new_body_composition):
        self.body_composition = new_body_composition