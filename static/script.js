// JavaScript cho Xiaomi Smart Scale Web App

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các event listeners
    initializeEventListeners();
    
    // Khởi tạo form validation
    initializeFormValidation();
});

function initializeEventListeners() {
    // Button quét QR
    document.getElementById('scanQrBtn').addEventListener('click', scanQRCode);
    
    // Button tính toán
    document.getElementById('calculateBtn').addEventListener('click', calculateMetrics);
    
    // Button xóa dữ liệu
    document.getElementById('clearBtn').addEventListener('click', clearData);
    
    // Button xem kết quả chi tiết
    document.getElementById('viewDetailedResults').addEventListener('click', viewDetailedResults);
    
    // Tab switching
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            if (event.target.id === 'qr-tab') {
                // Reset QR form khi chuyển sang tab QR
                resetQRForm();
            } else if (event.target.id === 'manual-tab') {
                // Reset manual form khi chuyển sang tab manual
                resetManualForm();
            }
        });
    });
}

function initializeFormValidation() {
    // Real-time validation cho các input
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Xóa error cũ
    clearFieldError(event);
    
    if (!value) {
        showFieldError(field, 'Trường này là bắt buộc');
        return false;
    }
    
    // Validation cụ thể cho từng field
    if (field.type === 'number') {
        const numValue = parseFloat(value);
        const min = parseFloat(field.min);
        const max = parseFloat(field.max);
        
        if (isNaN(numValue)) {
            showFieldError(field, 'Vui lòng nhập số hợp lệ');
            return false;
        }
        
        if (numValue < min || numValue > max) {
            showFieldError(field, `Giá trị phải từ ${min} đến ${max}`);
            return false;
        }
    }
    
    if (field.id === 'manualDob' || field.id === 'qrDob') {
        if (!isValidDate(value)) {
            showFieldError(field, 'Định dạng ngày không hợp lệ (dd/mm/yyyy)');
            return false;
        }
    }
    
    return true;
}

function isValidDate(dateString) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    // Xóa error message cũ
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Thêm error message mới
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

async function scanQRCode() {
    const scanBtn = document.getElementById('scanQrBtn');
    const statusDiv = document.getElementById('qrStatus');
    
    // Disable button và hiển thị loading
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang quét...';
    
    try {
        const response = await fetch('/api/scan-cccd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Hiển thị thông tin CCCD
            displayCCCDInfo(result.data);
            
            // Hiển thị form bổ sung
            document.getElementById('qrForm').style.display = 'block';
            
            // Cập nhật status
            statusDiv.innerHTML = '<span class="badge bg-success">✓ Đã quét CCCD thành công</span>';
            
            showNotification('Quét CCCD thành công!', 'success');
        } else {
            statusDiv.innerHTML = '<span class="badge bg-danger">❌ ' + result.message + '</span>';
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error scanning QR:', error);
        statusDiv.innerHTML = '<span class="badge bg-danger">❌ Lỗi khi quét CCCD</span>';
        showNotification('Lỗi khi quét CCCD', 'error');
    } finally {
        // Reset button
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<i class="fas fa-qrcode me-2"></i>Quét mã QR CCCD';
    }
}

function displayCCCDInfo(data) {
    document.getElementById('cccdName').textContent = data.name || '-';
    document.getElementById('cccdDob').textContent = data.dob || '-';
    document.getElementById('cccdGender').textContent = data.gender === 'male' ? 'Nam' : 'Nữ';
    document.getElementById('cccdId').textContent = data.cccd_id || '-';
    document.getElementById('cccdAddress').textContent = data.address || '-';
    
    // Hiển thị card thông tin CCCD
    document.getElementById('cccdInfo').style.display = 'block';
}

async function calculateMetrics() {
    // Validate form trước khi gửi
    if (!validateForm()) {
        showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
        return;
    }
    
    // Hiển thị loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        // Lấy dữ liệu từ form
        const formData = getFormData();
        
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        // Đóng loading modal
        loadingModal.hide();
        
        if (result.success) {
            // Lưu kết quả vào sessionStorage để hiển thị ở trang results
            sessionStorage.setItem('calculationResult', JSON.stringify(result));
            
            // Hiển thị kết quả trong modal
            displayResults(result);
            
            // Hiển thị modal kết quả
            const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));
            resultsModal.show();
            
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error calculating metrics:', error);
        loadingModal.hide();
        showNotification('Lỗi khi tính toán', 'error');
    }
}

function validateForm() {
    const activeTab = document.querySelector('.nav-link.active').id;
    
    if (activeTab === 'manual-tab') {
        return validateManualForm();
    } else if (activeTab === 'qr-tab') {
        return validateQRForm();
    }
    
    return false;
}

function validateManualForm() {
    const requiredFields = ['manualName', 'manualDob', 'manualGender', 'manualAge', 'manualHeight', 'manualWeight', 'manualActivity'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showFieldError(field, 'Trường này là bắt buộc');
            isValid = false;
        }
    });
    
    return isValid;
}

function validateQRForm() {
    const requiredFields = ['qrHeight', 'qrWeight', 'qrActivity'];
    let isValid = true;
    
    // Kiểm tra xem đã quét CCCD chưa
    const cccdInfo = document.getElementById('cccdInfo');
    if (cccdInfo.style.display === 'none') {
        showNotification('Vui lòng quét CCCD trước', 'warning');
        return false;
    }
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showFieldError(field, 'Trường này là bắt buộc');
            isValid = false;
        }
    });
    
    return isValid;
}

function getFormData() {
    const activeTab = document.querySelector('.nav-link.active').id;
    
    if (activeTab === 'manual-tab') {
        return getManualFormData();
    } else if (activeTab === 'qr-tab') {
        return getQRFormData();
    }
    
    return {};
}

function getManualFormData() {
    return {
        name: document.getElementById('manualName').value,
        dob: document.getElementById('manualDob').value,
        gender: document.getElementById('manualGender').value,
        age: parseInt(document.getElementById('manualAge').value),
        height: parseFloat(document.getElementById('manualHeight').value),
        weight: parseFloat(document.getElementById('manualWeight').value),
        activity_factor: parseFloat(document.getElementById('manualActivity').value),
        cccd_id: document.getElementById('manualCccd').value,
        address: document.getElementById('manualAddress').value
    };
}

function getQRFormData() {
    return {
        height: parseFloat(document.getElementById('qrHeight').value),
        weight: parseFloat(document.getElementById('qrWeight').value),
        activity_factor: parseFloat(document.getElementById('qrActivity').value)
    };
}

function displayResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    
    const userInfo = result.user_info;
    const bodyComp = result.body_composition;
    const aiRec = result.ai_recommendations;
    
    let html = `
        <div class="row">
            <div class="col-12 mb-4">
                <h6 class="text-primary mb-3">
                    <i class="fas fa-user me-2"></i>Thông tin cá nhân
                </h6>
                        <div class="row">
            <div class="col-md-6">
                <p><strong>Họ tên:</strong> ${userInfo.name}</p>
                <p><strong>Tuổi:</strong> ${userInfo.age} tuổi</p>
                <p><strong>Giới tính:</strong> ${userInfo.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                <p><strong>Địa chỉ:</strong> ${userInfo.address || 'Không có'}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Chiều cao:</strong> ${userInfo.height} cm</p>
                <p><strong>Cân nặng:</strong> ${userInfo.weight} kg</p>
                <p><strong>Hệ số hoạt động:</strong> ${userInfo.activity_factor}</p>
                <p><strong>Số CCCD:</strong> ${userInfo.cccd_id || 'Không có'}</p>
            </div>
        </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.bmi}</div>
                    <div class="metric-label">BMI</div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.bmr}</div>
                    <div class="metric-label">BMR (kcal/ngày)</div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.tdee}</div>
                    <div class="metric-label">TDEE (kcal/ngày)</div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.lbm} kg</div>
                    <div class="metric-label">Khối lượng cơ thể nạc</div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.fp}%</div>
                    <div class="metric-label">Tỷ lệ mỡ</div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.wp}%</div>
                    <div class="metric-label">Tỷ lệ nước</div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="metric-card">
                    <div class="metric-value">${bodyComp.ms} kg</div>
                    <div class="metric-label">Khối lượng cơ</div>
                </div>
            </div>
        </div>
    `;
    
    if (aiRec) {
        html += `
            <div class="row">
                <div class="col-12">
                    <h6 class="text-primary mb-3">
                        <i class="fas fa-robot me-2"></i>Khuyến nghị AI
                    </h6>
                    <div class="card bg-light">
                        <div class="card-body">
                            <div style="white-space: pre-line;">${aiRec}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    resultsContent.innerHTML = html;
}

function viewDetailedResults() {
    // Chuyển đến trang kết quả chi tiết
    window.location.href = '/results';
}

function clearData() {
    // Xóa dữ liệu form
    resetManualForm();
    resetQRForm();
    
    // Xóa session
    fetch('/api/clear-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    showNotification('Đã xóa dữ liệu', 'info');
}

function resetManualForm() {
    document.getElementById('manualForm').reset();
    clearAllFieldErrors();
}

function resetQRForm() {
    document.getElementById('qrForm').reset();
    document.getElementById('qrForm').style.display = 'none';
    document.getElementById('cccdInfo').style.display = 'none';
    document.getElementById('qrStatus').innerHTML = '<span class="badge bg-secondary">Chưa quét CCCD</span>';
    clearAllFieldErrors();
}

function clearAllFieldErrors() {
    document.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(error => {
        error.remove();
    });
}

function showNotification(message, type = 'info') {
    // Tạo toast notification
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${getIconForType(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Xóa toast sau khi ẩn
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}
