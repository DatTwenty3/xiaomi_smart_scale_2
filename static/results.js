// JavaScript cho trang kết quả chi tiết

document.addEventListener('DOMContentLoaded', function() {
    // Lấy dữ liệu từ sessionStorage
    const resultData = sessionStorage.getItem('calculationResult');
    
    if (resultData) {
        const result = JSON.parse(resultData);
        displayDetailedResults(result);
        createBodyCompositionChart(result.body_composition);
    } else {
        // Nếu không có dữ liệu, chuyển về trang chủ
        window.location.href = '/';
    }
});

function displayDetailedResults(result) {
    const userInfo = result.user_info;
    const bodyComp = result.body_composition;
    const aiRec = result.ai_recommendations;
    
    // Hiển thị thông tin người dùng
    displayUserInfo(userInfo);
    
    // Hiển thị các chỉ số cơ bản
    displayBasicMetrics(bodyComp);
    
    // Hiển thị thành phần cơ thể
    displayBodyComposition(bodyComp);
    
    // Hiển thị khuyến nghị AI
    displayAIRecommendations(aiRec);
}

function displayUserInfo(userInfo) {
    const userInfoDiv = document.getElementById('userInfo');
    
    const html = `
        <div class="col-md-6">
            <p><strong>Họ tên:</strong> ${userInfo.name}</p>
            <p><strong>Ngày sinh:</strong> ${userInfo.dob || 'Không có'}</p>
            <p><strong>Giới tính:</strong> ${userInfo.gender === 'male' ? 'Nam' : 'Nữ'}</p>
            <p><strong>Số CCCD:</strong> ${userInfo.cccd_id || 'Không có'}</p>
        </div>
        <div class="col-md-6">
            <p><strong>Tuổi:</strong> ${userInfo.age} tuổi</p>
            <p><strong>Chiều cao:</strong> ${userInfo.height} cm</p>
            <p><strong>Cân nặng:</strong> ${userInfo.weight} kg</p>
            <p><strong>Hệ số hoạt động:</strong> ${userInfo.activity_factor}</p>
        </div>
        <div class="col-12 mt-3">
            <p><strong>Địa chỉ:</strong> ${userInfo.address || 'Không có'}</p>
        </div>
    `;
    
    userInfoDiv.innerHTML = html;
}

function displayBasicMetrics(bodyComp) {
    const basicMetricsDiv = document.getElementById('basicMetrics');
    
    const bmiStatus = getBMIStatus(bodyComp.bmi);
    const bmrStatus = getBMRStatus(bodyComp.bmr, bodyComp.gender);
    
    const html = `
        <div class="col-md-4 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.bmi}</div>
                <div class="metric-label">BMI</div>
                <div class="mt-2">
                    <span class="badge ${bmiStatus.class}">${bmiStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.bmr}</div>
                <div class="metric-label">BMR (kcal/ngày)</div>
                <div class="mt-2">
                    <span class="badge ${bmrStatus.class}">${bmrStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.tdee}</div>
                <div class="metric-label">TDEE (kcal/ngày)</div>
                <div class="mt-2">
                    <small class="text-light">Năng lượng cần thiết</small>
                </div>
            </div>
        </div>
    `;
    
    basicMetricsDiv.innerHTML = html;
}

function displayBodyComposition(bodyComp) {
    const bodyCompositionDiv = document.getElementById('bodyComposition');
    
    const fatStatus = getFatPercentageStatus(bodyComp.fp, bodyComp.gender, bodyComp.age);
    const waterStatus = getWaterPercentageStatus(bodyComp.wp, bodyComp.gender, bodyComp.age);
    const muscleStatus = getMuscleMassStatus(bodyComp.ms, bodyComp.gender, bodyComp.age);
    
    const html = `
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.lbm} kg</div>
                <div class="metric-label">Khối lượng cơ thể nạc</div>
                <div class="mt-2">
                    <small class="text-light">Lean Body Mass</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.fp}%</div>
                <div class="metric-label">Tỷ lệ mỡ</div>
                <div class="mt-2">
                    <span class="badge ${fatStatus.class}">${fatStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.wp}%</div>
                <div class="metric-label">Tỷ lệ nước</div>
                <div class="mt-2">
                    <span class="badge ${waterStatus.class}">${waterStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.ms} kg</div>
                <div class="metric-label">Khối lượng cơ</div>
                <div class="mt-2">
                    <span class="badge ${muscleStatus.class}">${muscleStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.bm} kg</div>
                <div class="metric-label">Khối lượng xương</div>
                <div class="mt-2">
                    <small class="text-light">Bone Mass</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.pp}%</div>
                <div class="metric-label">Tỷ lệ protein</div>
                <div class="mt-2">
                    <small class="text-light">Protein Percentage</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.vf}</div>
                <div class="metric-label">Mỡ nội tạng</div>
                <div class="mt-2">
                    <small class="text-light">Visceral Fat</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card">
                <div class="metric-value">${bodyComp.iw} kg</div>
                <div class="metric-label">Cân nặng lý tưởng</div>
                <div class="mt-2">
                    <small class="text-light">Ideal Weight</small>
                </div>
            </div>
        </div>
    `;
    
    bodyCompositionDiv.innerHTML = html;
}

function displayAIRecommendations(aiRec) {
    const aiDiv = document.getElementById('aiRecommendations');
    
    if (aiRec) {
        aiDiv.innerHTML = `<div style="white-space: pre-line; line-height: 1.6;">${aiRec}</div>`;
    } else {
        aiDiv.innerHTML = '<p class="text-muted">Không có khuyến nghị AI</p>';
    }
}

function createBodyCompositionChart(bodyComp) {
    const ctx = document.getElementById('bodyCompositionChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Mỡ', 'Nước', 'Cơ', 'Xương', 'Khác'],
            datasets: [{
                data: [
                    bodyComp.fp,
                    bodyComp.wp,
                    (bodyComp.ms / bodyComp.weight * 100).toFixed(1),
                    (bodyComp.bm / bodyComp.weight * 100).toFixed(1),
                    (100 - bodyComp.fp - bodyComp.wp - (bodyComp.ms / bodyComp.weight * 100) - (bodyComp.bm / bodyComp.weight * 100)).toFixed(1)
                ],
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffce56',
                    '#4bc0c0',
                    '#9966ff'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// Helper functions để đánh giá các chỉ số
function getBMIStatus(bmi) {
    if (bmi < 18.5) {
        return { class: 'status-warning', text: 'Thiếu cân' };
    } else if (bmi < 25) {
        return { class: 'status-excellent', text: 'Bình thường' };
    } else if (bmi < 30) {
        return { class: 'status-warning', text: 'Thừa cân' };
    } else {
        return { class: 'status-danger', text: 'Béo phì' };
    }
}

function getBMRStatus(bmr, gender) {
    const avgBMR = gender === 'male' ? 1800 : 1400;
    if (bmr > avgBMR * 1.2) {
        return { class: 'status-excellent', text: 'Cao' };
    } else if (bmr > avgBMR * 0.8) {
        return { class: 'status-good', text: 'Bình thường' };
    } else {
        return { class: 'status-warning', text: 'Thấp' };
    }
}

function getFatPercentageStatus(fatPct, gender, age) {
    let normalRange;
    if (gender === 'male') {
        if (age < 30) normalRange = [6, 14];
        else if (age < 50) normalRange = [11, 17];
        else normalRange = [13, 19];
    } else {
        if (age < 30) normalRange = [16, 20];
        else if (age < 50) normalRange = [20, 24];
        else normalRange = [22, 26];
    }
    
    if (fatPct < normalRange[0]) {
        return { class: 'status-warning', text: 'Thấp' };
    } else if (fatPct <= normalRange[1]) {
        return { class: 'status-excellent', text: 'Bình thường' };
    } else if (fatPct <= normalRange[1] + 5) {
        return { class: 'status-warning', text: 'Hơi cao' };
    } else {
        return { class: 'status-danger', text: 'Cao' };
    }
}

function getWaterPercentageStatus(waterPct, gender, age) {
    let normalRange;
    if (gender === 'male') {
        normalRange = [55, 65];
    } else {
        normalRange = [50, 60];
    }
    
    if (waterPct < normalRange[0]) {
        return { class: 'status-warning', text: 'Thấp' };
    } else if (waterPct <= normalRange[1]) {
        return { class: 'status-excellent', text: 'Bình thường' };
    } else {
        return { class: 'status-good', text: 'Tốt' };
    }
}

function getMuscleMassStatus(muscleMass, gender, age) {
    let normalRange;
    if (gender === 'male') {
        if (age < 30) normalRange = [40, 50];
        else if (age < 50) normalRange = [35, 45];
        else normalRange = [30, 40];
    } else {
        if (age < 30) normalRange = [30, 40];
        else if (age < 50) normalRange = [25, 35];
        else normalRange = [20, 30];
    }
    
    if (muscleMass < normalRange[0]) {
        return { class: 'status-warning', text: 'Thấp' };
    } else if (muscleMass <= normalRange[1]) {
        return { class: 'status-excellent', text: 'Bình thường' };
    } else {
        return { class: 'status-good', text: 'Tốt' };
    }
}
