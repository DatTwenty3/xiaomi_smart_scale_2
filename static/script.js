// JavaScript cho Xiaomi Smart Scale Web App

// ==============================================================================
// CONFIGURATION
// ==============================================================================
const CONFIG = {
    SHOW_TEST_BUTTON: true, // Đặt false để ẩn nút Test Demo
};

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các event listeners
    initializeEventListeners();
    
    // Khởi tạo form validation
    initializeFormValidation();
    
    // Cấu hình hiển thị nút Test Demo
    configureTestButton();
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
    
    // Button test demo (chỉ thêm event listener nếu nút được hiển thị)
    if (CONFIG.SHOW_TEST_BUTTON) {
        document.getElementById('testBtn').addEventListener('click', fillTestData);
    }
    
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
    
    // Thêm class has-value nếu có giá trị
    if (value) {
        field.classList.add('has-value');
    } else {
        field.classList.remove('has-value');
    }
    
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
        errorDiv.textContent = '';
    }
}

// Progress Steps Management
function updateProgressStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
        }
    });
}

// Enhanced form validation with visual feedback
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
    }
}

function showFieldSuccess(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = '';
    }
}

// Function để cập nhật floating labels khi điền dữ liệu programmatically
function updateFloatingLabels() {
    const inputs = document.querySelectorAll('.form-control, .form-select');
    inputs.forEach(input => {
        if (input.value && input.value.trim() !== '') {
            input.classList.add('has-value');
        } else {
            input.classList.remove('has-value');
        }
    });
}

async function scanQRCode() {
    // Mở modal QR scanner
    const qrModal = new bootstrap.Modal(document.getElementById('qrScannerModal'));
    qrModal.show();
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
    
    // Cập nhật floating labels sau khi điền dữ liệu
    updateFloatingLabels();
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
    
    // Cập nhật progress step sang bước tính toán
    updateProgressStep(4);
    
    // Hiển thị loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    
    try {
        // Lấy dữ liệu từ form
        const formData = getFormData();
        
        // Nếu có dữ liệu test, thêm cân nặng và thời gian thăng bằng test vào
        const testWeight = sessionStorage.getItem('testWeight');
        const testBalanceTime = sessionStorage.getItem('balanceTime');
        
        if (testWeight) {
            formData.weight = parseFloat(testWeight);
        }
        
        if (testBalanceTime) {
            formData.balance_time = parseFloat(testBalanceTime);
        }
        
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
            
            // Hiển thị thông báo lưu CSV
            if (result.csv_saved) {
                showNotification('✓ Đã lưu kết quả vào file CSV thành công!', 'success');
            } else {
                showNotification('⚠️ Lưu kết quả vào CSV thất bại', 'warning');
            }
            
            // Chuyển thẳng đến trang kết quả chi tiết
            window.location.href = '/results';
            
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
    
    // Cập nhật progress step
    updateProgressStep(2);
    
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
            
            // Cập nhật progress step
            updateProgressStep(3);
            
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
    sessionStorage.removeItem('testWeight');
    
    // Reset progress step về bước đo cân
    updateProgressStep(2);
    
    showNotification('Đã reset kết quả đo. Bạn có thể đo lại.', 'info');
}

// ==============================================================================
// BALANCE TEST FUNCTIONS
// ==============================================================================

// ==============================================================================
// BALANCE TEST MODAL FUNCTIONS
// ==============================================================================

function openBalanceModal() {
    // Cập nhật progress step sang bước đo thăng bằng
    updateProgressStep(3);
    
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
    
    // Cập nhật progress step sang bước tính toán
    updateProgressStep(4);
    
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
            
            // Cập nhật progress step sang bước tính toán
            updateProgressStep(4);
            
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
    // Dừng camera nếu đang chạy
    stopBalanceCamera();
}

function startBalanceTest() {
    // Ẩn trạng thái ban đầu và hiển thị trạng thái đang đo (client-side)
    document.getElementById('balanceTestStatus').style.display = 'none';
    document.getElementById('balanceTestRunning').style.display = 'block';
    
    startClientSideBalanceDetection();
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
    
    // Xóa dữ liệu test
    sessionStorage.removeItem('testWeight');
    sessionStorage.removeItem('balanceTime');
    
    // Reset progress step về bước đầu
    updateProgressStep(1);
    
    showNotification('Đã xóa dữ liệu', 'info');
}

function resetForm() {
    document.getElementById('personalInfoForm').reset();
    clearAllFieldErrors();
    
    // Reset floating labels
    updateFloatingLabels();
    
    // Reset progress step về bước đầu
    updateProgressStep(1);
    
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
        error.textContent = '';
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

// ==============================================================================
// TEST DATA FUNCTIONS
// ==============================================================================

function fillTestData() {
    // Tạo dữ liệu demo ngẫu nhiên
    const testData = generateRandomTestData();
    
    // Điền thông tin cá nhân và trigger events để cập nhật floating labels
    const fields = [
        { id: 'fullName', value: testData.name },
        { id: 'dateOfBirth', value: testData.dob },
        { id: 'gender', value: testData.gender },
        { id: 'age', value: testData.age },
        { id: 'height', value: testData.height },
        { id: 'cccd', value: testData.cccd },
        { id: 'address', value: testData.address }
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            element.value = field.value;
        }
    });
    
    // Cập nhật floating labels sau khi điền tất cả dữ liệu
    updateFloatingLabels();
    
    // Chọn mức độ vận động ngẫu nhiên
    const activityOptions = document.querySelectorAll('.activity-option');
    const randomActivityIndex = Math.floor(Math.random() * activityOptions.length);
    activityOptions.forEach(opt => opt.classList.remove('selected'));
    activityOptions[randomActivityIndex].classList.add('selected');
    document.getElementById('activity').value = activityOptions[randomActivityIndex].getAttribute('data-value');
    
    // Hiển thị cân nặng demo
    displayWeightOnForm(testData.weight);
    
    // Hiển thị thời gian thăng bằng demo (luôn có để test đầy đủ)
    displayBalanceResult(testData.balanceTime);
    sessionStorage.setItem('balanceTime', testData.balanceTime);
    
    // Lưu dữ liệu vào session để có thể tính toán
    sessionStorage.setItem('testWeight', testData.weight);
    
    // Cập nhật progress step sang bước tính toán (vì đã có đầy đủ dữ liệu)
    updateProgressStep(4);
    
    // Hiển thị nút đo và tính toán
    showMeasurementButtons();
    
    showNotification('Đã điền dữ liệu demo thành công!', 'success');
}

function generateRandomTestData() {
    // Danh sách tên demo
    const names = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thị Dung',
        'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Minh Giang', 'Bùi Thị Hoa',
        'Phan Văn Inh', 'Ngô Thị Kim', 'Dương Minh Long', 'Lý Thị Mai',
        'Đinh Văn Nam', 'Tôn Thị Oanh', 'Võ Minh Phúc', 'Đỗ Thị Quỳnh'
    ];
    
    // Danh sách địa chỉ demo
    const addresses = [
        '123 Nguyễn Huệ, Quận 1, TP.HCM',
        '456 Lê Lợi, Quận 3, TP.HCM',
        '789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        '321 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        '654 Võ Văn Tần, Quận 3, TP.HCM',
        '987 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'
    ];
    
    // Tạo dữ liệu ngẫu nhiên
    const name = names[Math.floor(Math.random() * names.length)];
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const age = Math.floor(Math.random() * 50) + 20; // 20-70 tuổi
    const height = (Math.random() * 30 + 150).toFixed(1); // 150-180 cm
    const weight = (Math.random() * 30 + 50).toFixed(1); // 50-80 kg
    const balanceTime = (Math.random() * 20 + 5).toFixed(1); // 5-25 giây
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    
    // Tạo ngày sinh từ tuổi
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Đảm bảo ngày hợp lệ
    const dob = `${birthDay.toString().padStart(2, '0')}/${birthMonth.toString().padStart(2, '0')}/${birthYear}`;
    
    // Tạo số CCCD demo
    const cccd = Math.floor(Math.random() * 900000000000) + 100000000000; // 12 chữ số
    
    return {
        name: name,
        dob: dob,
        gender: gender,
        age: age,
        height: parseFloat(height),
        weight: parseFloat(weight),
        balanceTime: parseFloat(balanceTime),
        address: address,
        cccd: cccd.toString()
    };
}

// ==============================================================================
// CONFIGURATION FUNCTIONS
// ==============================================================================

function configureTestButton() {
    const testButton = document.getElementById('testBtn');
    
    if (!CONFIG.SHOW_TEST_BUTTON) {
        // Ẩn nút Test Demo
        testButton.style.display = 'none';
        console.log('Test Demo button is hidden (CONFIG.SHOW_TEST_BUTTON = false)');
    } else {
        // Hiển thị nút Test Demo
        testButton.style.display = 'inline-block';
        console.log('Test Demo button is visible (CONFIG.SHOW_TEST_BUTTON = true)');
    }
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

// ==============================================================================
// QR SCANNER FUNCTIONS
// ==============================================================================

// QR Scanner variables
let qrStream = null;
let qrVideo = null;
let qrCanvas = null;
let qrContext = null;
let qrScanning = false;
let qrScanInterval = null;

// Initialize QR Scanner event listeners
function initializeQRScanner() {
    // QR Scanner buttons
    document.getElementById('startQrScannerBtn').addEventListener('click', startQRScanner);
    document.getElementById('stopQrScannerBtn').addEventListener('click', stopQRScanner);
    document.getElementById('confirmQrDataBtn').addEventListener('click', confirmQRData);
    document.getElementById('retryQrScannerBtn').addEventListener('click', retryQRScanner);
    document.getElementById('retryQrErrorBtn').addEventListener('click', retryQRScanner);
    document.getElementById('closeQrModal').addEventListener('click', closeQRModal);
    document.getElementById('closeQrModalFooter').addEventListener('click', closeQRModal);
    
    // Get video and canvas elements
    qrVideo = document.getElementById('qrVideo');
    qrCanvas = document.getElementById('qrCanvas');
    qrContext = qrCanvas.getContext('2d');
}

// Start QR Scanner
async function startQRScanner() {
    try {
        // Show scanning status
        showQRScannerStatus('running');
        
        // Request camera access
        qrStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Use back camera if available
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        // Set video source
        qrVideo.srcObject = qrStream;
        
        // Wait for video to load
        qrVideo.onloadedmetadata = function() {
            qrVideo.play();
            qrScanning = true;
            
            // Start scanning for QR codes
            startQRCodeDetection();
        };
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showQRScannerError('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.');
    }
}

// Stop QR Scanner
function stopQRScanner() {
    qrScanning = false;
    
    if (qrScanInterval) {
        clearInterval(qrScanInterval);
        qrScanInterval = null;
    }
    
    if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        qrStream = null;
    }
    
    if (qrVideo) {
        qrVideo.srcObject = null;
    }
    
    showQRScannerStatus('status');
}

// Start QR Code Detection
function startQRCodeDetection() {
    qrScanInterval = setInterval(() => {
        if (qrScanning && qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
            detectQRCode();
        }
    }, 100); // Check every 100ms
}

// Detect QR Code using simple pattern matching
function detectQRCode() {
    // Set canvas size to match video
    qrCanvas.width = qrVideo.videoWidth;
    qrCanvas.height = qrVideo.videoHeight;
    
    // Draw current video frame to canvas
    qrContext.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);
    
    // Get image data
    const imageData = qrContext.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
    
    // Simple QR code detection (this is a basic implementation)
    // In a real application, you would use a proper QR code library like jsQR
    const qrData = detectQRCodeFromImageData(imageData);
    
    if (qrData) {
        // QR code detected
        stopQRScanner();
        processQRData(qrData);
    }
}

// QR code detection using jsQR library
function detectQRCodeFromImageData(imageData) {
    try {
        // Use jsQR library to detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
            console.log('QR Code detected:', code.data);
            return code.data;
        }
        
        return null;
    } catch (error) {
        console.error('Error detecting QR code:', error);
        return null;
    }
}

// Process detected QR data
async function processQRData(qrData) {
    try {
        // Send QR data to backend for parsing
        const response = await fetch('/api/parse-qr-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                qr_data: qrData
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show parsed data
            showQRScannerResult(result.data);
        } else {
            showQRScannerError(result.message || 'Không thể phân tích dữ liệu QR');
        }
        
    } catch (error) {
        console.error('Error processing QR data:', error);
        showQRScannerError('Lỗi khi xử lý dữ liệu QR');
    }
}

// Show QR Scanner Status
function showQRScannerStatus(status) {
    // Hide all sections
    document.getElementById('qrScannerStatus').style.display = 'none';
    document.getElementById('qrScannerRunning').style.display = 'none';
    document.getElementById('qrScannerResult').style.display = 'none';
    document.getElementById('qrScannerError').style.display = 'none';
    
    // Show appropriate section
    if (status === 'running') {
        document.getElementById('qrScannerRunning').style.display = 'block';
    } else {
        document.getElementById('qrScannerStatus').style.display = 'block';
    }
}

// Show QR Scanner Result
function showQRScannerResult(data) {
    // Hide other sections
    document.getElementById('qrScannerStatus').style.display = 'none';
    document.getElementById('qrScannerRunning').style.display = 'none';
    document.getElementById('qrScannerError').style.display = 'none';
    
    // Show result section
    document.getElementById('qrScannerResult').style.display = 'block';
    
    // Display parsed data
    const resultDataDiv = document.getElementById('qrResultData');
    resultDataDiv.innerHTML = `
        <h6><i class="fas fa-id-card me-2"></i>Thông tin từ Căn cước</h6>
        <div class="row">
            <div class="col-6">
                <p><strong>Họ tên:</strong> <span>${data.name || '-'}</span></p>
                <p><strong>Ngày sinh:</strong> <span>${data.dob || '-'}</span></p>
                <p><strong>Giới tính:</strong> <span>${data.gender === 'male' ? 'Nam' : data.gender === 'female' ? 'Nữ' : '-'}</span></p>
            </div>
            <div class="col-6">
                <p><strong>Số Căn cước:</strong> <span>${data.cccd_id || '-'}</span></p>
                <p><strong>Địa chỉ:</strong> <span>${data.address || '-'}</span></p>
            </div>
        </div>
    `;
    
    // Store data for confirmation
    window.currentQRData = data;
}

// Show QR Scanner Error
function showQRScannerError(message) {
    // Hide other sections
    document.getElementById('qrScannerStatus').style.display = 'none';
    document.getElementById('qrScannerRunning').style.display = 'none';
    document.getElementById('qrScannerResult').style.display = 'none';
    
    // Show error section
    document.getElementById('qrScannerError').style.display = 'block';
    document.getElementById('qrErrorMessage').textContent = message;
}

// Confirm QR Data and fill form
function confirmQRData() {
    if (window.currentQRData) {
        const data = window.currentQRData;
        
        // Fill form fields
        document.getElementById('fullName').value = data.name || '';
        document.getElementById('dateOfBirth').value = data.dob || '';
        document.getElementById('gender').value = data.gender || '';
        document.getElementById('cccd').value = data.cccd_id || '';
        document.getElementById('address').value = data.address || '';
        
        // Calculate age from date of birth
        if (data.dob) {
            const age = calculateAgeFromDOB(data.dob);
            if (age > 0) {
                document.getElementById('age').value = age;
            }
        }
        
        // Show CCCD info section
        showCCCDInfo(data);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('qrScannerModal'));
        modal.hide();
        
        // Show success message
        showNotification('Đã điền thông tin từ Căn cước thành công!', 'success');
    }
}

// Retry QR Scanner
function retryQRScanner() {
    stopQRScanner();
    showQRScannerStatus('status');
}

// Close QR Modal
function closeQRModal() {
    stopQRScanner();
    const modal = bootstrap.Modal.getInstance(document.getElementById('qrScannerModal'));
    modal.hide();
}

// Calculate age from date of birth
function calculateAgeFromDOB(dob) {
    try {
        const [day, month, year] = dob.split('/');
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age > 0 ? age : 0;
    } catch (error) {
        console.error('Error calculating age:', error);
        return 0;
    }
}

// Show CCCD Info section
function showCCCDInfo(data) {
    const cccdInfoDiv = document.getElementById('cccdInfo');
    const qrStatusDiv = document.getElementById('qrStatus');
    
    // Update CCCD info display
    document.getElementById('cccdName').textContent = data.name || '-';
    document.getElementById('cccdDob').textContent = data.dob || '-';
    document.getElementById('cccdGender').textContent = data.gender === 'male' ? 'Nam' : data.gender === 'female' ? 'Nữ' : '-';
    document.getElementById('cccdId').textContent = data.cccd_id || '-';
    document.getElementById('cccdAddress').textContent = data.address || '-';
    
    // Show CCCD info section
    cccdInfoDiv.style.display = 'block';
    
    // Update QR status
    qrStatusDiv.innerHTML = '<span class="badge bg-success">Đã quét Căn cước thành công</span>';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Initialize QR Scanner when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeQRScanner();
});

// ==============================================================================
// CLIENT-SIDE ONE-LEG BALANCE DETECTION (MediaPipe)
// ==============================================================================

let balanceVideoEl = null;
let balanceCanvasEl = null;
let balanceCtx = null;
let balanceStream = null;
let pose = null;

let twoLegSamples = [];
let oneLegSamples = [];
let collectingPhase = 'idle'; // 'two_legs' | 'one_leg' | 'measure'
let collectedCount = 0;
let targetSamples = 20;
let phaseStartTs = 0;
let sessionActive = false;
let sessionStartTs = 0;
let sessionOffsets = [];
let baselineCOM = null;
let measureRAF = null;
let measureTimer = null;
let restCountdownTimer = null;
let restSecondsLeft = 0;
let isResting = false;
const ONE_LEG_SIM_THRESHOLD = 0.8; // Ngưỡng 80% để xác nhận tư thế đứng 1 chân

function updateBalancePhaseLabel(text) {
    const badge = document.getElementById('balancePhaseLabel');
    if (badge) badge.textContent = text;
    const heading = document.getElementById('balanceInstruction');
    if (heading) heading.textContent = text;
}

function landmarksToVector(landmarks) {
    const vector = [];
    for (const lm of landmarks) {
        vector.push(lm.x, lm.y);
    }
    return vector;
}

function cosineSimilarity(a, b) {
    let dot = 0, na = 0, nb = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function calcMaxSimilarity(currentVector, samples) {
    let maxSim = 0;
    for (const s of samples) {
        const sim = cosineSimilarity(currentVector, s);
        if (sim > maxSim) maxSim = sim;
    }
    return maxSim;
}

async function startClientSideBalanceDetection() {
    try {
        balanceVideoEl = document.getElementById('balanceVideo');
        balanceCanvasEl = document.getElementById('balanceCanvas');
        balanceCtx = balanceCanvasEl.getContext('2d');
        updateBalancePhaseLabel('Chuẩn bị...');

        // Initialize 3D Landmark Grid
        init3DLandmarkGrid();

        // Camera access
        balanceStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        balanceVideoEl.srcObject = balanceStream;
        await balanceVideoEl.play();

        // Init MediaPipe Pose
        pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        });
        pose.setOptions({ 
            modelComplexity: 1, 
            smoothLandmarks: true, 
            enableSegmentation: false, 
            minDetectionConfidence: 0.5, 
            minTrackingConfidence: 0.5,
            useWorldLandmarks: true  // Enable 3D world landmarks
        });
        // Gắn handler: vừa vẽ landmarks, vừa cập nhật state machine
        pose.onResults((results) => {
            lastPoseLandmarks = results.poseLandmarks || null;
            onPoseResults(results);
            update3DLandmarkGrid(results);
            advanceBalanceState();
        });

        // Start pipeline using Camera utils if available
        startCollectionSequence();
    } catch (e) {
        console.error(e);
        showNotification('Không thể truy cập camera hoặc khởi tạo Pose', 'error');
        resetBalanceModal();
    }
}

function startCollectionSequence() {
    twoLegSamples = [];
    oneLegSamples = [];
    collectedCount = 0;
    sessionActive = false;
    sessionOffsets = [];
    baselineCOM = null;
    // Nghỉ/chuẩn bị 5s trước khi bắt đầu thu mẫu 2 chân
    collectingPhase = 'pre_rest';
    phaseStartTs = performance.now();
    updateCountsUI();
    showPhase('rest');
    startRestCountdown(5, () => {
        collectingPhase = 'two_legs';
        updateBalancePhaseLabel('ĐỨNG HAI CHÂN, NHÌN THẲNG – ĐANG THU MẪU');
        showPhase('collect_two');
    }, 'Chuẩn bị cho quá trình thu thập mẫu đứng 2 chân');
    requestAnimationFrame(processVideoFrame);
}

function onPoseResults(results) {
    const video = balanceVideoEl;
    const canvas = balanceCanvasEl;
    const ctx = balanceCtx;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw camera frame under canvas overlay (optional draw landmarks only)
    // We only draw landmarks to overlay for speed
    if (results.poseLandmarks) {
        drawLandmarksOverlay(ctx, results.poseLandmarks, canvas.width, canvas.height);
    }
}

function drawLandmarksOverlay(ctx, landmarks, w, h) {
    ctx.strokeStyle = 'rgba(0,255,0,0.8)';
    ctx.lineWidth = 2;
    for (const lm of landmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,0,0.8)';
        ctx.fill();
    }
}

async function processVideoFrame() {
    if (!balanceVideoEl || balanceVideoEl.readyState < 2) {
        measureRAF = requestAnimationFrame(processVideoFrame);
        return;
    }
    await pose.send({ image: balanceVideoEl });

    // After pose results callback drew overlay, we also run state machine by estimating landmarks again
    // To avoid double compute, we rely on lastResults via pose.onResults closure; but mediapipe doesn't expose.
    // Instead, we run lightweight checks using a cached canvas read is not needed; we will recompute with another send next frame.

    // Use last known landmarks from the previous draw stored globally? We'll re-fetch via a simple trick: not available.
    // So we attach landmarks on balanceCanvas for state; easier approach: store to window in onPoseResults.
    measureRAF = requestAnimationFrame(processVideoFrame);
}

// Hook landmarks for state machine
let lastPoseLandmarks = null;

function advanceBalanceState() {
    if (!lastPoseLandmarks) return;
    const vector = landmarksToVector(lastPoseLandmarks);
    const w = balanceCanvasEl.width;
    const h = balanceCanvasEl.height;
    const leftHip = lastPoseLandmarks[23]; // LEFT_HIP index in MediaPipe Pose v0.5
    const rightHip = lastPoseLandmarks[24];
    if (!leftHip || !rightHip) return;
    const centerHipX = (leftHip.x + rightHip.x) / 2;
    const centerHipY = (leftHip.y + rightHip.y) / 2;
    const currentCOM = [Math.round(centerHipX * w), Math.round(centerHipY * h)];

    if (collectingPhase === 'two_legs') {
        // Thu thập tối đa 1 mẫu/200ms để tránh bùng nổ mẫu
        throttleCollectSample(twoLegSamples, vector);
        if (twoLegSamples.length >= targetSamples) {
            if (!isResting) {
                collectedCount = 0;
                // Vào trạng thái nghỉ để tránh gọi lặp
                collectingPhase = 'rest_two_to_one';
                showPhase('rest');
                startRestCountdown(5, () => {
                    collectingPhase = 'one_leg';
                    updateBalancePhaseLabel('ĐỨNG MỘT CHÂN – ĐANG THU MẪU');
                    showPhase('collect_one');
                }, 'Chuẩn bị cho quá trình thu thập mẫu đứng 1 chân');
            }
        }
        return;
    }

    if (collectingPhase === 'one_leg') {
        throttleCollectSample(oneLegSamples, vector);
        if (oneLegSamples.length >= targetSamples) {
            if (!isResting) {
                // Vào trạng thái nghỉ để tránh gọi lặp
                collectingPhase = 'rest_one_to_measure';
                showPhase('rest');
                startRestCountdown(5, () => {
                    collectingPhase = 'measure';
                    sessionActive = false;
                    sessionOffsets = [];
                    baselineCOM = null;
                    sessionStartTs = 0;
                    updateBalancePhaseLabel('BẮT ĐẦU ĐO – GIỮ MỘT CHÂN CÀNG LÂU CÀNG TỐT');
                    showPhase('measure');
                }, 'Chuẩn bị cho quá trình đo thăng bằng');
            }
        }
        return;
    }

    if (collectingPhase === 'measure') {
        const oneSim = calcMaxSimilarity(vector, oneLegSamples);
        const twoSim = calcMaxSimilarity(vector, twoLegSamples);
        if (oneSim > twoSim && oneSim >= ONE_LEG_SIM_THRESHOLD) {
            if (!sessionActive) {
                sessionActive = true;
                sessionStartTs = performance.now();
                sessionOffsets = [];
                if (!baselineCOM) baselineCOM = currentCOM;
            }
            const offset = Math.abs(currentCOM[0] - baselineCOM[0]);
            sessionOffsets.push(offset);
            updateElapsedTime();
        } else {
            if (sessionActive) {
                finishBalanceSession();
            }
        }
    }
}

// Thu thập mẫu có kiểm soát tốc độ (~5 mẫu/giây)
let lastSampleTs = 0;
function throttleCollectSample(bucket, vector) {
    if (isResting) return; // Không thu mẫu khi đang nghỉ
    const now = performance.now();
    if (now - lastSampleTs < 500) return; // 0.5s/mẫu
    lastSampleTs = now;
    if (bucket.length < targetSamples) bucket.push(vector);
    updateCountsUI();
}

function updateCountsUI() {
    const c1 = document.getElementById('countTwoLegs');
    const c2 = document.getElementById('countOneLeg');
    const t1 = document.getElementById('targetSamples');
    const t2 = document.getElementById('targetSamples2');
    if (c1) c1.textContent = (collectingPhase === 'two_legs' ? twoLegSamples.length : oneLegSamples.length).toString();
    if (t1) t1.textContent = targetSamples.toString();
}

function startRestCountdown(seconds, onDone, prepareLabel) {
    isResting = true;
    restSecondsLeft = seconds;
    const el = document.getElementById('balanceCountdown');
    if (el) {
        el.style.display = 'block';
        el.textContent = `${restSecondsLeft}`;
    }
    updateBalancePhaseLabel(prepareLabel || 'Chuẩn bị');
    if (restCountdownTimer) clearInterval(restCountdownTimer);
    restCountdownTimer = setInterval(() => {
        restSecondsLeft -= 1;
        if (el) el.textContent = `${restSecondsLeft}`;
        if (restSecondsLeft <= 0) {
            clearInterval(restCountdownTimer);
            if (el) el.style.display = 'none';
            isResting = false;
            if (typeof onDone === 'function') onDone();
        }
    }, 1000);
}

function showPhase(phase) {
    const sampleCounts = document.getElementById('balanceSampleCounts');
    const countdown = document.getElementById('balanceCountdown');
    const elapsed = document.getElementById('balanceElapsed');
    const note = document.getElementById('collectNote');
    if (!sampleCounts || !countdown || !elapsed) return;
    if (phase === 'rest') {
        sampleCounts.style.display = 'none';
        elapsed.style.display = 'none';
        countdown.style.display = 'block';
    } else if (phase === 'collect_two') {
        sampleCounts.style.display = 'block';
        countdown.style.display = 'none';
        elapsed.style.display = 'none';
        const c1 = document.getElementById('countTwoLegs');
        if (c1) c1.textContent = twoLegSamples.length.toString();
        if (note) note.style.display = 'none';
    } else if (phase === 'collect_one') {
        sampleCounts.style.display = 'block';
        countdown.style.display = 'none';
        elapsed.style.display = 'none';
        const c1 = document.getElementById('countTwoLegs');
        if (c1) c1.textContent = oneLegSamples.length.toString();
        if (note) note.style.display = 'none';
    } else if (phase === 'measure') {
        sampleCounts.style.display = 'none';
        countdown.style.display = 'none';
        elapsed.style.display = 'block';
        updateElapsedTime();
    }
}

function updateElapsedTime() {
    const el = document.getElementById('balanceElapsed');
    if (!el || !sessionActive) return;
    const sec = (performance.now() - sessionStartTs) / 1000;
    el.textContent = `${sec.toFixed(1)}s`;
}

function finishBalanceSession() {
    const durationSec = (performance.now() - sessionStartTs) / 1000;
    const avgOffset = sessionOffsets.length ? (sessionOffsets.reduce((a,b)=>a+b,0) / sessionOffsets.length) : 0;
    // Show result UI
    document.getElementById('balanceTime').textContent = durationSec.toFixed(1);
    document.getElementById('balanceTestRunning').style.display = 'none';
    document.getElementById('balanceTestResult').style.display = 'block';
    showNotification(`Đo thăng bằng thành công: ${durationSec.toFixed(1)} giây`, 'success');
    stopBalanceCamera();
}

function stopBalanceCamera() {
    if (measureRAF) cancelAnimationFrame(measureRAF);
    if (balanceStream) {
        balanceStream.getTracks().forEach(t => t.stop());
        balanceStream = null;
    }
    // Reset pose instance để giải phóng tài nguyên
    try { if (pose && pose.close) pose.close(); } catch(e) {}
    pose = null;
    lastPoseLandmarks = null;
    twoLegSamples = [];
    oneLegSamples = [];
    
    // Clean up 3D Landmark Grid
    if (window.balanceLandmarkGrid) {
        window.balanceLandmarkGrid.updateLandmarks([]);
    }
}

// 3D Landmark Grid Functions
let balanceLandmarkGrid = null;

function init3DLandmarkGrid() {
    try {
        const landmarkContainer = document.getElementById('balanceLandmarkGrid');
        if (!landmarkContainer) {
            console.warn('3D Landmark Grid container not found');
            return;
        }

        // Clear container
        landmarkContainer.innerHTML = '';

        // Check if LandmarkGrid is available
        if (typeof window.LandmarkGrid === 'undefined') {
            console.warn('LandmarkGrid not available, showing loading message');
            landmarkContainer.innerHTML = `
                <div class="landmark-grid-loading">
                    <div class="spinner-border text-primary" role="status"></div>
                    <span>Đang tải 3D Grid...</span>
                </div>
            `;
            return;
        }

        // Initialize 3D Landmark Grid
        balanceLandmarkGrid = new window.LandmarkGrid(landmarkContainer, {
            connectionColor: 0x333333,  // Dark gray for connections
            definedColors: [
                { name: 'LEFT', value: 0xff6b35 },  // Orange for left side
                { name: 'RIGHT', value: 0x4ecdc4 }  // Teal for right side
            ],
            range: 2,
            fitToGrid: true,
            labelSuffix: 'm',
            landmarkSize: 2,
            numCellsPerAxis: 4,
            showHidden: false,
            centered: true,
            backgroundColor: 0xffffff,  // White background
            gridColor: 0x333333,       // Dark gray grid lines
            axisColor: 0x666666,       // Medium gray for axes
        });

        // Store globally for cleanup
        window.balanceLandmarkGrid = balanceLandmarkGrid;
        
        console.log('3D Landmark Grid initialized successfully');
    } catch (error) {
        console.error('Error initializing 3D Landmark Grid:', error);
        const landmarkContainer = document.getElementById('balanceLandmarkGrid');
        if (landmarkContainer) {
            landmarkContainer.innerHTML = `
                <div class="landmark-grid-loading">
                    <span class="text-danger">Lỗi khởi tạo 3D Grid</span>
                </div>
            `;
        }
    }
}

function update3DLandmarkGrid(results) {
    try {
        if (!balanceLandmarkGrid) return;

        if (results.poseWorldLandmarks) {
            // Get pose connections and landmarks from MediaPipe
            const poseConnections = window.POSE_CONNECTIONS || [];
            const leftLandmarks = window.POSE_LANDMARKS_LEFT ? Object.values(window.POSE_LANDMARKS_LEFT) : [];
            const rightLandmarks = window.POSE_LANDMARKS_RIGHT ? Object.values(window.POSE_LANDMARKS_RIGHT) : [];
            
            // Update 3D landmarks with pose connections and color coding
            balanceLandmarkGrid.updateLandmarks(
                results.poseWorldLandmarks, 
                poseConnections, 
                [
                    { 
                        list: leftLandmarks, 
                        color: 'LEFT' 
                    },
                    { 
                        list: rightLandmarks, 
                        color: 'RIGHT' 
                    }
                ]
            );
        } else {
            // Clear landmarks if no pose detected
            balanceLandmarkGrid.updateLandmarks([]);
        }
    } catch (error) {
        console.error('Error updating 3D Landmark Grid:', error);
    }
}
