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
    
    // Button bước tiếp theo
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);
    
    // Button tính toán
    document.getElementById('calculateBtn').addEventListener('click', calculateMetrics);
    
    // Button xóa dữ liệu
    document.getElementById('clearBtn').addEventListener('click', clearData);
    
    // Button đo lại
    document.getElementById('remeasureBtn').addEventListener('click', remeasure);
    
    // Button xem kết quả chi tiết
    document.getElementById('viewDetailedResults').addEventListener('click', viewDetailedResults);
    
    // Button xem lịch sử
    document.getElementById('viewHistoryBtn').addEventListener('click', viewHistory);
    document.getElementById('refreshHistoryBtn').addEventListener('click', refreshHistory);
    
    // Activity selector
    initializeActivitySelector();
    
    // Weight measurement buttons
    document.getElementById('startWeightBtn').addEventListener('click', startWeightMeasurement);
    document.getElementById('confirmWeightBtn').addEventListener('click', confirmWeight);
    document.getElementById('retryWeightBtn').addEventListener('click', retryWeightMeasurement);
    document.getElementById('cancelWeightBtn').addEventListener('click', cancelWeightMeasurement);
    document.getElementById('closeWeightModal').addEventListener('click', closeWeightModal);
    document.getElementById('closeWeightModalFooter').addEventListener('click', closeWeightModal);
    
    // Balance choice buttons
    document.getElementById('yesBalanceBtn').addEventListener('click', openBalanceModal);
    document.getElementById('noBalanceBtn').addEventListener('click', skipBalanceTest);
    
    // Balance test buttons
    document.getElementById('startBalanceBtn').addEventListener('click', startBalanceTest);
    document.getElementById('confirmBalanceBtn').addEventListener('click', confirmBalanceTest);
    document.getElementById('retryBalanceBtn').addEventListener('click', retryBalanceTest);
    document.getElementById('cancelBalanceBtn').addEventListener('click', cancelBalanceTest);
    document.getElementById('closeBalanceModal').addEventListener('click', closeBalanceModal);
    document.getElementById('closeBalanceModalFooter').addEventListener('click', closeBalanceModal);
    
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
            
            // Điền thông tin vào form
            fillFormFromCCCD(result.data);
            
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
        scanBtn.innerHTML = '<i class="fas fa-qrcode me-2"></i>Quét QR CCCD để tự động điền thông tin';
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

function fillFormFromCCCD(data) {
    // Điền thông tin vào form
    document.getElementById('fullName').value = data.name || '';
    document.getElementById('dateOfBirth').value = data.dob || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('cccd').value = data.cccd_id || '';
    document.getElementById('address').value = data.address || '';
    
    // Tính tuổi từ ngày sinh
    if (data.dob) {
        const age = calculateAgeFromDOB(data.dob);
        if (age > 0) {
            document.getElementById('age').value = age;
        }
    }
}

function calculateAgeFromDOB(dob) {
    // Chuyển đổi từ dd/mm/yyyy sang Date object
    const parts = dob.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        
        const birthDate = new Date(year, month, day);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
    return 0;
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
            // Lấy thời gian thăng bằng từ sessionStorage nếu có
            const balanceTime = sessionStorage.getItem('balanceTime');
            if (balanceTime) {
                result.balance_time = parseFloat(balanceTime);
            }
            
            // Lưu kết quả vào sessionStorage để hiển thị ở trang results
            sessionStorage.setItem('calculationResult', JSON.stringify(result));
            
            // Hiển thị kết quả trong modal
            displayResults(result);
            
            // Hiển thị thông báo lưu CSV
            if (result.csv_saved) {
                showNotification('✓ Đã lưu kết quả vào file CSV thành công!', 'success');
            } else {
                showNotification('⚠️ Lưu kết quả vào CSV thất bại', 'warning');
            }
            
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

// ==============================================================================
// WEIGHT MEASUREMENT FUNCTIONS
// ==============================================================================

function nextStep() {
    // Validate form trước khi chuyển sang bước đo cân
    if (!validateForm()) {
        showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
        return;
    }
    
    // Mở modal đo cân nặng
    const weightModal = new bootstrap.Modal(document.getElementById('weightModal'));
    weightModal.show();
    
    // Reset modal về trạng thái ban đầu
    resetWeightModal();
}

function startWeightMeasurement() {
    // Ẩn trạng thái ban đầu và hiển thị trạng thái đang tìm kiếm
    document.getElementById('weightMeasurementStatus').style.display = 'none';
    document.getElementById('weightSearching').style.display = 'block';
    
    // Gọi API bắt đầu đo cân
    fetch('/api/start-weight-measurement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Bắt đầu polling để lấy cân nặng
            startWeightPolling();
        } else {
            showNotification(result.message, 'error');
            resetWeightModal();
        }
    })
    .catch(error => {
        console.error('Error starting weight measurement:', error);
        showNotification('Lỗi khi bắt đầu đo cân', 'error');
        resetWeightModal();
    });
}

function startWeightPolling() {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/get-current-weight');
            const result = await response.json();
            
            if (result.success && result.weight && result.weight > 0) {
                // Có cân nặng, hiển thị kết quả
                clearInterval(pollInterval);
                displayWeightResult(result.weight);
            } else if (!result.is_measuring) {
                // Đã dừng đo, kiểm tra lần cuối
                clearInterval(pollInterval);
                if (!result.weight || result.weight <= 0) {
                    showNotification('Không thể đo được cân nặng. Vui lòng thử lại.', 'warning');
                    resetWeightMeasurement();
                }
            }
        } catch (error) {
            console.error('Error polling weight:', error);
        }
    }, 1000); // Poll mỗi giây
    
    // Timeout sau 5 phút
    setTimeout(() => {
        clearInterval(pollInterval);
        if (!document.getElementById('weightDisplay').style.display !== 'none') {
            showNotification('Hết thời gian đo cân. Vui lòng thử lại.', 'warning');
            resetWeightMeasurement();
        }
    }, 300000); // 5 phút = 300000ms
}

function displayWeightResult(weight) {
    document.getElementById('currentWeightValue').textContent = weight.toFixed(1);
    document.getElementById('weightSearching').style.display = 'none';
    document.getElementById('weightDisplay').style.display = 'block';
}

function confirmWeight() {
    const weight = parseFloat(document.getElementById('currentWeightValue').textContent);
    
    if (!weight || weight <= 0) {
        showNotification('Cân nặng không hợp lệ', 'error');
        return;
    }
    
    // Gọi API xác nhận cân nặng
    fetch('/api/confirm-weight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            weight: weight
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Cân nặng đã được xác nhận!', 'success');
            
            // Hiển thị kết quả cân nặng trên form
            displayWeightOnForm(weight);
            
            // Đóng modal đo cân nặng
            const weightModal = bootstrap.Modal.getInstance(document.getElementById('weightModal'));
            if (weightModal) {
                weightModal.hide();
            }
            
            // Hiển thị modal lựa chọn đo thăng bằng
            const balanceChoiceModal = new bootstrap.Modal(document.getElementById('balanceChoiceModal'));
            balanceChoiceModal.show();
        } else {
            showNotification(result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error confirming weight:', error);
        showNotification('Lỗi khi xác nhận cân nặng', 'error');
    });
}

function retryWeightMeasurement() {
    resetWeightModal();
    startWeightMeasurement();
}

function cancelWeightMeasurement() {
    resetWeightModal();
    showNotification('Đã hủy đo cân nặng', 'info');
}

function closeWeightModal() {
    resetWeightModal();
}

function resetWeightModal() {
    // Hiển thị trạng thái ban đầu
    document.getElementById('weightMeasurementStatus').style.display = 'block';
    document.getElementById('weightSearching').style.display = 'none';
    document.getElementById('weightDisplay').style.display = 'none';
}

function resetWeightMeasurement() {
    // Legacy function - redirect to resetWeightModal
    resetWeightModal();
}

// ==============================================================================
// MEASUREMENT DISPLAY FUNCTIONS
// ==============================================================================

function displayWeightOnForm(weight) {
    // Hiển thị kết quả cân nặng trên form
    document.getElementById('displayWeight').textContent = weight.toFixed(1);
    
    // Ẩn thông báo và hiện kết quả
    document.getElementById('weightInfo').style.display = 'none';
    document.getElementById('weightResult').style.display = 'block';
}

function displayBalanceResult(balanceTime) {
    // Hiển thị kết quả thời gian thăng bằng trên form
    document.getElementById('displayBalanceTime').textContent = balanceTime.toFixed(1);
    document.getElementById('balanceInfo').style.display = 'none';
    document.getElementById('balanceResult').style.display = 'block';
}

function showMeasurementButtons() {
    // Ẩn nút "Bước tiếp theo" và hiển thị nút "Đo lại" và "Tính toán"
    document.getElementById('nextStepBtn').style.display = 'none';
    document.getElementById('remeasureBtn').style.display = 'inline-block';
    document.getElementById('calculateBtn').style.display = 'inline-block';
}

function hideMeasurementButtons() {
    // Ẩn nút "Đo lại" và "Tính toán", hiển thị nút "Bước tiếp theo"
    document.getElementById('nextStepBtn').style.display = 'inline-block';
    document.getElementById('remeasureBtn').style.display = 'none';
    document.getElementById('calculateBtn').style.display = 'none';
}

function resetMeasurementDisplay() {
    // Reset hiển thị kết quả đo
    document.getElementById('weightInfo').style.display = 'block';
    document.getElementById('weightResult').style.display = 'none';
    document.getElementById('balanceInfo').style.display = 'block';
    document.getElementById('balanceResult').style.display = 'none';
    
    // Reset giá trị
    document.getElementById('displayWeight').textContent = '-';
    document.getElementById('displayBalanceTime').textContent = '-';
}

function remeasure() {
    // Reset hiển thị kết quả đo
    resetMeasurementDisplay();
    
    // Ẩn nút đo và tính toán
    hideMeasurementButtons();
    
    // Xóa dữ liệu đo khỏi sessionStorage
    sessionStorage.removeItem('balanceTime');
    
    showNotification('Đã reset kết quả đo. Bạn có thể đo lại.', 'info');
}

// ==============================================================================
// BALANCE TEST FUNCTIONS
// ==============================================================================

// ==============================================================================
// BALANCE TEST MODAL FUNCTIONS
// ==============================================================================

function openBalanceModal() {
    // Đóng modal lựa chọn
    const balanceChoiceModal = bootstrap.Modal.getInstance(document.getElementById('balanceChoiceModal'));
    if (balanceChoiceModal) {
        balanceChoiceModal.hide();
    }
    
    // Mở modal thăng bằng
    const balanceModal = new bootstrap.Modal(document.getElementById('balanceModal'));
    balanceModal.show();
    
    // Reset modal về trạng thái ban đầu
    resetBalanceModal();
}

function skipBalanceTest() {
    // Xóa thời gian thăng bằng khỏi sessionStorage
    sessionStorage.removeItem('balanceTime');
    
    // Đóng modal lựa chọn
    const balanceChoiceModal = bootstrap.Modal.getInstance(document.getElementById('balanceChoiceModal'));
    if (balanceChoiceModal) {
        balanceChoiceModal.hide();
    }
    
    // Hiển thị nút đo và tính toán
    showMeasurementButtons();
    
    showNotification('Đã bỏ qua đo thăng bằng', 'info');
}

function confirmBalanceTest() {
    // Lấy thời gian thăng bằng
    const balanceTime = parseFloat(document.getElementById('balanceTime').textContent);
    
    // Lưu vào sessionStorage
    sessionStorage.setItem('balanceTime', balanceTime);
    
    // Gọi API lưu thời gian thăng bằng
    fetch('/api/save-balance-time', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            balance_time: balanceTime
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Hiển thị kết quả thời gian thăng bằng trên form
            displayBalanceResult(balanceTime);
            
            // Đóng modal thăng bằng
            const balanceModal = bootstrap.Modal.getInstance(document.getElementById('balanceModal'));
            if (balanceModal) {
                balanceModal.hide();
            }
            
            // Hiển thị nút đo và tính toán
            showMeasurementButtons();
            
            showNotification('Thời gian thăng bằng đã được lưu!', 'success');
        } else {
            showNotification(result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error saving balance time:', error);
        showNotification('Lỗi khi lưu thời gian thăng bằng', 'error');
    });
}

function cancelBalanceTest() {
    resetBalanceModal();
    showNotification('Đã hủy đo thăng bằng', 'warning');
}

function closeBalanceModal() {
    resetBalanceModal();
}

function resetBalanceModal() {
    // Reset về trạng thái ban đầu
    document.getElementById('balanceTestStatus').style.display = 'block';
    document.getElementById('balanceTestRunning').style.display = 'none';
    document.getElementById('balanceTestResult').style.display = 'none';
    
    // Reset button states
    document.getElementById('startBalanceBtn').disabled = false;
    document.getElementById('balanceTime').textContent = '0';
}

function startBalanceTest() {
    // Ẩn trạng thái ban đầu và hiển thị trạng thái đang đo
    document.getElementById('balanceTestStatus').style.display = 'none';
    document.getElementById('balanceTestRunning').style.display = 'block';
    
    // Gọi API đo thăng bằng
    fetch('/api/balance-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Hiển thị kết quả
            document.getElementById('balanceTime').textContent = result.balance_time.toFixed(1);
            document.getElementById('balanceTestRunning').style.display = 'none';
            document.getElementById('balanceTestResult').style.display = 'block';
            
            showNotification(`Đo thăng bằng thành công: ${result.balance_time.toFixed(1)} giây`, 'success');
        } else {
            showNotification(result.message, 'error');
            resetBalanceModal();
        }
    })
    .catch(error => {
        console.error('Error testing balance:', error);
        showNotification('Lỗi khi đo thăng bằng', 'error');
        resetBalanceModal();
    });
}

function retryBalanceTest() {
    resetBalanceModal();
    startBalanceTest();
}


function validateForm() {
    const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'age', 'height', 'activity'];
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

function validateManualForm() {
    const requiredFields = ['manualName', 'manualDob', 'manualGender', 'manualAge', 'manualHeight', 'manualActivity'];
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
    const requiredFields = ['qrHeight', 'qrActivity'];
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
    return {
        name: document.getElementById('fullName').value,
        dob: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        age: parseInt(document.getElementById('age').value),
        height: parseFloat(document.getElementById('height').value),
        activity_factor: parseFloat(document.getElementById('activity').value),
        cccd_id: document.getElementById('cccd').value,
        address: document.getElementById('address').value
    };
}

function getManualFormData() {
    return {
        name: document.getElementById('manualName').value,
        dob: document.getElementById('manualDob').value,
        gender: document.getElementById('manualGender').value,
        age: parseInt(document.getElementById('manualAge').value),
        height: parseFloat(document.getElementById('manualHeight').value),
        activity_factor: parseFloat(document.getElementById('manualActivity').value),
        cccd_id: document.getElementById('manualCccd').value,
        address: document.getElementById('manualAddress').value
    };
}

function getQRFormData() {
    return {
        height: parseFloat(document.getElementById('qrHeight').value),
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
    
    // Balance Test Result
    if (result.balance_time) {
        html += `
            <div class="row">
                <div class="col-12">
                    <h6 class="text-info mb-3">
                        <i class="fas fa-balance-scale me-2"></i>Thời gian thăng bằng
                    </h6>
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h4 class="mb-0">
                                <i class="fas fa-clock me-2"></i>
                                ${result.balance_time.toFixed(1)} giây
                            </h4>
                            <p class="mb-0 mt-2">Thời gian đứng 1 chân</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
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

// ==============================================================================
// HISTORY FUNCTIONS
// ==============================================================================

function viewHistory() {
    // Lấy tên người dùng từ kết quả hiện tại
    const resultData = sessionStorage.getItem('calculationResult');
    if (!resultData) {
        showNotification('Không có dữ liệu để xem lịch sử', 'warning');
        return;
    }
    
    const result = JSON.parse(resultData);
    const userName = result.user_info.name;
    
    if (!userName) {
        showNotification('Không tìm thấy tên người dùng', 'error');
        return;
    }
    
    // Hiển thị modal lịch sử
    const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
    historyModal.show();
    
    // Load lịch sử
    loadUserHistory(userName);
}

function loadUserHistory(userName) {
    const historyContent = document.getElementById('historyContent');
    
    // Hiển thị loading
    historyContent.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2">Đang tải lịch sử đo của ${userName}...</p>
        </div>
    `;
    
    // Gọi API lấy lịch sử
    fetch(`/api/get-history/${encodeURIComponent(userName)}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                displayHistory(result.data, userName);
            } else {
                historyContent.innerHTML = `
                    <div class="alert alert-warning text-center">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${result.message}
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading history:', error);
            historyContent.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Lỗi khi tải lịch sử: ${error.message}
                </div>
            `;
        });
}

function displayHistory(historyData, userName) {
    const historyContent = document.getElementById('historyContent');
    
    if (!historyData || historyData.length === 0) {
        historyContent.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                Chưa có lịch sử đo cho ${userName}
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="mb-3">
            <h6 class="text-primary">
                <i class="fas fa-user me-2"></i>Lịch sử đo của: ${userName}
            </h6>
            <p class="text-muted">Tổng cộng: ${historyData.length} lần đo</p>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Thời gian</th>
                        <th>Cân nặng (kg)</th>
                        <th>BMI</th>
                        <th>BMR</th>
                        <th>Tỷ lệ mỡ (%)</th>
                        <th>Tỷ lệ nước (%)</th>
                        <th>Khối lượng cơ (kg)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    historyData.forEach((record, index) => {
        const datetime = record.datetime || 'N/A';
        const weight = record.weight || 'N/A';
        const bmi = record.bmi || 'N/A';
        const bmr = record.bmr || 'N/A';
        const fatPct = record.fat_percentage || 'N/A';
        const waterPct = record.water_percentage || 'N/A';
        const muscle = record.muscle_mass || 'N/A';
        
        html += `
            <tr>
                <td>${datetime}</td>
                <td>${weight}</td>
                <td>${bmi}</td>
                <td>${bmr}</td>
                <td>${fatPct}</td>
                <td>${waterPct}</td>
                <td>${muscle}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    historyContent.innerHTML = html;
}

function refreshHistory() {
    // Lấy tên người dùng từ kết quả hiện tại
    const resultData = sessionStorage.getItem('calculationResult');
    if (resultData) {
        const result = JSON.parse(resultData);
        const userName = result.user_info.name;
        if (userName) {
            loadUserHistory(userName);
        }
    }
}

function clearData() {
    // Xóa dữ liệu form
    resetForm();
    resetWeightModal();
    
    // Reset measurement display
    resetMeasurementDisplay();
    
    // Reset buttons
    hideMeasurementButtons();
    
    // Xóa session
    fetch('/api/clear-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    showNotification('Đã xóa dữ liệu', 'info');
}

function resetForm() {
    document.getElementById('personalInfoForm').reset();
    clearAllFieldErrors();
    
    // Ẩn thông tin CCCD
    document.getElementById('cccdInfo').style.display = 'none';
    document.getElementById('qrStatus').innerHTML = '<span class="badge bg-secondary">Chưa quét CCCD</span>';
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

// Activity Selector Functions
function initializeActivitySelector() {
    const activityOptions = document.querySelectorAll('.activity-option');
    const hiddenInput = document.getElementById('activity');
    
    // Set default selection
    activityOptions[0].classList.add('selected');
    
    activityOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            activityOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update hidden input value
            const value = this.getAttribute('data-value');
            hiddenInput.value = value;
            
            // Add animation effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Add hover effects
        option.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
            }
        });
    });
}
