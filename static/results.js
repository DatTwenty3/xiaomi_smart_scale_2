// JavaScript cho trang kết quả chi tiết

// Định nghĩa thông tin chi tiết về các thông số sức khỏe
const healthMetricsInfo = {
    'bmi': {
        title: 'BMI (Body Mass Index)',
        description: 'Chỉ số khối cơ thể - công cụ sàng lọc quan trọng để đánh giá nguy cơ sức khỏe liên quan đến cân nặng',
        medicalSignificance: 'BMI giúp bác sĩ đánh giá nguy cơ mắc các bệnh như tiểu đường type 2, bệnh tim mạch, tăng huyết áp, và một số loại ung thư. Chỉ số này cũng được sử dụng để theo dõi hiệu quả điều trị béo phì.',
        normalRange: '18.5 - 24.9',
        healthRisks: '• BMI < 18.5: Nguy cơ suy dinh dưỡng, loãng xương\n• BMI 25-29.9: Tăng nguy cơ bệnh tim mạch\n• BMI ≥ 30: Nguy cơ cao mắc tiểu đường, bệnh tim, đột quỵ'
    },
    'bmr': {
        title: 'BMR (Basal Metabolic Rate)',
        description: 'Tỷ lệ trao đổi chất cơ bản - năng lượng tối thiểu cần thiết để duy trì các chức năng sống cơ bản',
        medicalSignificance: 'BMR phản ánh hiệu quả trao đổi chất của cơ thể. BMR thấp có thể liên quan đến suy giáp, thiếu hụt dinh dưỡng, hoặc lối sống ít vận động. BMR cao thường gặp ở người có khối lượng cơ lớn hoặc mắc một số bệnh lý.',
        normalRange: 'Nam: 1600-2000 kcal/ngày\nNữ: 1200-1600 kcal/ngày',
        healthRisks: '• BMR thấp: Nguy cơ tăng cân, suy giáp, thiếu hụt dinh dưỡng\n• BMR cao: Có thể cần nhiều calo hơn để duy trì cân nặng'
    },
    'tdee': {
        title: 'TDEE (Total Daily Energy Expenditure)',
        description: 'Tổng năng lượng tiêu hao hàng ngày - năng lượng cần thiết để duy trì cân nặng hiện tại',
        medicalSignificance: 'TDEE là cơ sở quan trọng để lập kế hoạch dinh dưỡng. Hiểu rõ TDEE giúp kiểm soát cân nặng hiệu quả và ngăn ngừa các bệnh liên quan đến dinh dưỡng.',
        normalRange: 'Phụ thuộc vào mức độ hoạt động thể chất',
        healthRisks: '• Tiêu thụ ít hơn TDEE: Giảm cân (có thể dẫn đến suy dinh dưỡng nếu quá mức)\n• Tiêu thụ nhiều hơn TDEE: Tăng cân (nguy cơ béo phì)'
    },
    'lbm': {
        title: 'LBM (Lean Body Mass)',
        description: 'Khối lượng cơ thể nạc - tổng trọng lượng của tất cả các mô không phải mỡ (cơ, xương, nước, nội tạng)',
        medicalSignificance: 'LBM là chỉ số quan trọng để đánh giá sức khỏe tổng thể. LBM cao thường liên quan đến sức mạnh cơ bắp tốt, mật độ xương cao và khả năng phục hồi sau bệnh tật tốt hơn.',
        normalRange: 'Nam: 70-85% trọng lượng cơ thể\nNữ: 60-75% trọng lượng cơ thể',
        healthRisks: '• LBM thấp: Nguy cơ loãng xương, suy giảm chức năng vận động, giảm khả năng miễn dịch\n• LBM cao: Thường tốt cho sức khỏe, nhưng cần đảm bảo cân bằng dinh dưỡng'
    },
    'fp': {
        title: 'Tỷ lệ mỡ cơ thể (Body Fat Percentage)',
        description: 'Phần trăm trọng lượng cơ thể là mỡ - chỉ số quan trọng để đánh giá nguy cơ sức khỏe',
        medicalSignificance: 'Tỷ lệ mỡ cơ thể là yếu tố dự báo quan trọng cho sức khỏe tim mạch. Mỡ thừa, đặc biệt là mỡ nội tạng, có liên quan đến tình trạng viêm mãn tính và kháng insulin.',
        normalRange: 'Nam: 6-19%\nNữ: 16-26%',
        healthRisks: '• Tỷ lệ mỡ thấp: Nguy cơ rối loạn nội tiết, suy giảm chức năng sinh sản\n• Tỷ lệ mỡ cao: Tăng nguy cơ tiểu đường type 2, bệnh tim mạch, tăng huyết áp, đột quỵ'
    },
    'wp': {
        title: 'Tỷ lệ nước cơ thể (Body Water Percentage)',
        description: 'Phần trăm trọng lượng cơ thể là nước - chỉ số quan trọng cho sức khỏe và hiệu suất thể chất',
        medicalSignificance: 'Nước là thành phần thiết yếu cho mọi chức năng cơ thể. Tỷ lệ nước thấp có thể ảnh hưởng đến chức năng thận, tuần hoàn máu, và khả năng điều hòa thân nhiệt.',
        normalRange: 'Nam: 55-65%\nNữ: 50-60%',
        healthRisks: '• Tỷ lệ nước thấp: Nguy cơ mất nước, suy giảm chức năng thận, tăng nguy cơ sỏi thận\n• Tỷ lệ nước cao: Thường tốt, nhưng cần chú ý nếu do phù nề'
    },
    'ms': {
        title: 'Khối lượng cơ (Muscle Mass)',
        description: 'Tổng trọng lượng của tất cả các cơ bắp trong cơ thể - chỉ số quan trọng cho sức khỏe và tuổi thọ',
        medicalSignificance: 'Khối lượng cơ có liên quan trực tiếp đến sức mạnh, sức bền và khả năng phục hồi. Cơ bắp cũng đóng vai trò quan trọng trong việc điều hòa đường huyết và chuyển hóa.',
        normalRange: 'Nam: 30-50kg\nNữ: 20-40kg',
        healthRisks: '• Khối lượng cơ thấp: Nguy cơ loãng xương, té ngã, suy giảm chức năng vận động, tăng nguy cơ tử vong\n• Khối lượng cơ cao: Thường tốt cho sức khỏe, giảm nguy cơ bệnh tim mạch'
    },
    'bm': {
        title: 'Khối lượng xương (Bone Mass)',
        description: 'Tổng trọng lượng của tất cả xương trong cơ thể - chỉ số quan trọng cho sức khỏe xương',
        medicalSignificance: 'Khối lượng xương phản ánh mật độ xương và sức mạnh của hệ xương. Đây là yếu tố quan trọng để đánh giá nguy cơ loãng xương và gãy xương.',
        normalRange: 'Nam: 2.5-4.5kg\nNữ: 2.0-3.5kg',
        healthRisks: '• Khối lượng xương thấp: Nguy cơ cao loãng xương, gãy xương, đặc biệt ở phụ nữ sau mãn kinh\n• Khối lượng xương cao: Thường tốt, nhưng cần chú ý nếu do bệnh lý'
    },
    'pp': {
        title: 'Tỷ lệ protein (Protein Percentage)',
        description: 'Phần trăm trọng lượng cơ thể là protein - chỉ số quan trọng cho sức khỏe cơ bắp và miễn dịch',
        medicalSignificance: 'Protein là thành phần cơ bản của cơ bắp, enzyme, hormone và kháng thể. Tỷ lệ protein đủ giúp duy trì khối lượng cơ, chức năng miễn dịch và khả năng phục hồi.',
        normalRange: '15-20%',
        healthRisks: '• Tỷ lệ protein thấp: Nguy cơ suy giảm cơ bắp, suy giảm miễn dịch, chậm lành vết thương\n• Tỷ lệ protein cao: Thường tốt, nhưng cần đảm bảo cân bằng dinh dưỡng'
    },
    'vf': {
        title: 'Mỡ nội tạng (Visceral Fat)',
        description: 'Lượng mỡ tích tụ xung quanh các cơ quan nội tạng - yếu tố nguy cơ quan trọng cho sức khỏe',
        medicalSignificance: 'Mỡ nội tạng là loại mỡ nguy hiểm nhất, có liên quan trực tiếp đến tình trạng viêm mãn tính, kháng insulin và các bệnh chuyển hóa. Đây là yếu tố dự báo mạnh cho bệnh tim mạch.',
        normalRange: '1-9 (thang đo 1-59)',
        healthRisks: '• Mỡ nội tạng thấp (1-9): Tốt cho sức khỏe, giảm nguy cơ bệnh chuyển hóa\n• Mỡ nội tạng cao (10+): Nguy cơ cao tiểu đường type 2, bệnh tim mạch, tăng huyết áp, đột quỵ, một số loại ung thư'
    },
    'iw': {
        title: 'Cân nặng lý tưởng (Ideal Weight)',
        description: 'Trọng lượng cơ thể lý tưởng dựa trên chiều cao và giới tính - mục tiêu sức khỏe tối ưu',
        medicalSignificance: 'Cân nặng lý tưởng giúp giảm thiểu nguy cơ mắc các bệnh liên quan đến cân nặng và tối ưu hóa chức năng cơ thể. Đây là mục tiêu quan trọng trong quản lý sức khỏe dài hạn.',
        normalRange: 'Phụ thuộc vào chiều cao và giới tính',
        healthRisks: '• Cân nặng dưới lý tưởng: Nguy cơ suy dinh dưỡng, loãng xương, suy giảm miễn dịch\n• Cân nặng trên lý tưởng: Tăng nguy cơ béo phì, tiểu đường, bệnh tim mạch, đột quỵ'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Lấy dữ liệu từ sessionStorage
    const resultData = sessionStorage.getItem('calculationResult');
    
    if (resultData) {
        const result = JSON.parse(resultData);
        displayDetailedResults(result);
        initializeTooltips();
        initializeHistoryButton();
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
    
    // Hiển thị thời gian thăng bằng nếu có
    displayBalanceTime(result.balance_time);
    
    // Hiển thị khuyến nghị AI
    displayAIRecommendations(aiRec);
    
    // Khởi tạo tất cả biểu đồ ngay lập tức
    setTimeout(() => {
        createBodyCompositionChart(bodyComp);
        createHealthScoreChart(bodyComp);
        createStandardsComparisonChart(bodyComp);
        createHealthRadarChart(bodyComp);
    }, 100);
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
            <div class="metric-card health-metric" data-metric="bmi">
                <div class="metric-value">${bodyComp.bmi}</div>
                <div class="metric-label">BMI</div>
                <div class="mt-2">
                    <span class="badge ${bmiStatus.class}">${bmiStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="metric-card health-metric" data-metric="bmr">
                <div class="metric-value">${bodyComp.bmr}</div>
                <div class="metric-label">BMR (kcal/ngày)</div>
                <div class="mt-2">
                    <span class="badge ${bmrStatus.class}">${bmrStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="metric-card health-metric" data-metric="tdee">
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
            <div class="metric-card health-metric" data-metric="lbm">
                <div class="metric-value">${bodyComp.lbm} kg</div>
                <div class="metric-label">Khối lượng cơ thể nạc</div>
                <div class="mt-2">
                    <small class="text-light">Lean Body Mass</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="fp">
                <div class="metric-value">${bodyComp.fp}%</div>
                <div class="metric-label">Tỷ lệ mỡ</div>
                <div class="mt-2">
                    <span class="badge ${fatStatus.class}">${fatStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="wp">
                <div class="metric-value">${bodyComp.wp}%</div>
                <div class="metric-label">Tỷ lệ nước</div>
                <div class="mt-2">
                    <span class="badge ${waterStatus.class}">${waterStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="ms">
                <div class="metric-value">${bodyComp.ms} kg</div>
                <div class="metric-label">Khối lượng cơ</div>
                <div class="mt-2">
                    <span class="badge ${muscleStatus.class}">${muscleStatus.text}</span>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="bm">
                <div class="metric-value">${bodyComp.bm} kg</div>
                <div class="metric-label">Khối lượng xương</div>
                <div class="mt-2">
                    <small class="text-light">Bone Mass</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="pp">
                <div class="metric-value">${bodyComp.pp}%</div>
                <div class="metric-label">Tỷ lệ protein</div>
                <div class="mt-2">
                    <small class="text-light">Protein Percentage</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="vf">
                <div class="metric-value">${bodyComp.vf}</div>
                <div class="metric-label">Mỡ nội tạng</div>
                <div class="mt-2">
                    <small class="text-light">Visceral Fat</small>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="metric-card health-metric" data-metric="iw">
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

function displayBalanceTime(balanceTime) {
    const balanceTimeSection = document.getElementById('balanceTimeSection');
    const balanceTimeValue = document.getElementById('balanceTimeValue');
    
    if (balanceTime && balanceTime > 0) {
        balanceTimeValue.textContent = balanceTime.toFixed(1);
        balanceTimeSection.style.display = 'block';
    } else {
        balanceTimeSection.style.display = 'none';
    }
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
        return { class: 'status-excellent', text: 'Bình thường' };
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
        return { class: 'status-excellent', text: 'Tốt' };
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
        return { class: 'status-excellent', text: 'Tốt' };
    }
}

// Khởi tạo tooltip cho các thông số sức khỏe
function initializeTooltips() {
    const healthMetrics = document.querySelectorAll('.health-metric');
    
    healthMetrics.forEach(metric => {
        const metricType = metric.getAttribute('data-metric');
        const metricInfo = healthMetricsInfo[metricType];
        
        if (metricInfo) {
            // Chỉ thêm event listener cho click
            metric.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Kiểm tra xem tooltip đã hiển thị cho metric này chưa
                const currentTooltip = document.getElementById('health-tooltip');
                const currentMetric = currentTooltip ? currentTooltip.getAttribute('data-metric') : null;
                
                if (currentTooltip && currentMetric === metricType) {
                    // Nếu tooltip đang hiển thị cho metric này, ẩn nó
                    hideTooltip();
                } else {
                    // Nếu tooltip chưa hiển thị hoặc hiển thị cho metric khác, hiển thị tooltip mới
                    hideTooltip(); // Ẩn tooltip cũ trước
                    showTooltip(e, metricInfo, metricType);
                }
            });
            
            // Thêm cursor pointer để người dùng biết có thể click
            metric.style.cursor = 'pointer';
        }
    });
}

// Hiển thị tooltip
function showTooltip(event, metricInfo, metricType) {
    // Xóa tooltip cũ nếu có
    hideTooltip();
    
    // Tạo tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'health-tooltip';
    tooltip.id = 'health-tooltip';
    tooltip.setAttribute('data-metric', metricType); // Lưu metric type để kiểm tra
    tooltip.setAttribute('data-target-id', event.target.id || 'metric-' + metricType); // Lưu ID của thẻ target
    
    // Tạo nội dung tooltip
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <h6 class="mb-2">${metricInfo.title}</h6>
        </div>
        <div class="tooltip-body">
            <p class="mb-3"><strong>Mô tả:</strong> ${metricInfo.description}</p>
            <p class="mb-3"><strong>Ý nghĩa y học:</strong></p>
            <p class="mb-3" style="white-space: pre-line; line-height: 1.6;">${metricInfo.medicalSignificance}</p>
            <p class="mb-2"><strong>Khoảng bình thường:</strong></p>
            <p class="mb-3" style="white-space: pre-line;">${metricInfo.normalRange}</p>
            <p class="mb-2"><strong>Nguy cơ sức khỏe:</strong></p>
            <p class="mb-0" style="white-space: pre-line; line-height: 1.6;">${metricInfo.healthRisks}</p>
        </div>
        <div class="tooltip-arrow"></div>
    `;
    
    // Thêm tooltip vào body
    document.body.appendChild(tooltip);
    
    // Vị trí tooltip
    positionTooltip(event, tooltip);
    
    // Hiệu ứng fade in
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

// Ẩn tooltip
function hideTooltip() {
    const tooltip = document.getElementById('health-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (tooltip && tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }
}

// Thêm event listener toàn cục để ẩn tooltip khi click ra ngoài
document.addEventListener('click', function(event) {
    const tooltip = document.getElementById('health-tooltip');
    const healthMetrics = document.querySelectorAll('.health-metric');
    
    // Kiểm tra xem click có phải vào health metric không
    let isClickOnMetric = false;
    healthMetrics.forEach(metric => {
        if (metric.contains(event.target)) {
            isClickOnMetric = true;
        }
    });
    
    // Nếu click không phải vào health metric và tooltip đang hiển thị
    if (!isClickOnMetric && tooltip) {
        hideTooltip();
    }
});

// Thêm event listener để ẩn tooltip khi scroll
document.addEventListener('scroll', function() {
    const tooltip = document.getElementById('health-tooltip');
    if (tooltip) {
        // Ẩn tooltip khi scroll
        hideTooltip();
    }
});

// Thêm event listener để ẩn tooltip khi lăn chuột (wheel)
document.addEventListener('wheel', function() {
    const tooltip = document.getElementById('health-tooltip');
    if (tooltip) {
        // Ẩn tooltip khi lăn chuột
        hideTooltip();
    }
});

// Thêm event listener để cập nhật vị trí tooltip khi resize window
window.addEventListener('resize', function() {
    const tooltip = document.getElementById('health-tooltip');
    if (tooltip) {
        const targetId = tooltip.getAttribute('data-target-id');
        let targetMetric = null;
        
        if (targetId && targetId.startsWith('metric-')) {
            // Tìm metric theo metric type
            const metricType = tooltip.getAttribute('data-metric');
            const healthMetrics = document.querySelectorAll('.health-metric');
            healthMetrics.forEach(metric => {
                if (metric.getAttribute('data-metric') === metricType) {
                    targetMetric = metric;
                }
            });
        } else {
            // Tìm metric theo ID cụ thể
            targetMetric = document.getElementById(targetId);
        }
        
        if (targetMetric) {
            // Cập nhật vị trí tooltip theo vị trí mới của metric
            updateTooltipPosition(tooltip, targetMetric);
        }
    }
});

// Định vị tooltip
function positionTooltip(event, tooltip) {
    const rect = event.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 10;
    
    // Điều chỉnh vị trí nếu tooltip bị tràn ra ngoài viewport
    if (left < 10) {
        left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
    }
    
    if (top < 10) {
        top = rect.bottom + 10;
        tooltip.classList.add('tooltip-bottom');
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

// Cập nhật vị trí tooltip khi scroll hoặc resize
function updateTooltipPosition(tooltip, targetMetric) {
    const rect = targetMetric.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 10;
    
    // Điều chỉnh vị trí nếu tooltip bị tràn ra ngoài viewport
    if (left < 10) {
        left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
    }
    
    // Kiểm tra xem tooltip có bị tràn ra ngoài viewport không
    if (top < 10) {
        top = rect.bottom + 10;
        tooltip.classList.add('tooltip-bottom');
    } else {
        tooltip.classList.remove('tooltip-bottom');
    }
    
    // Cập nhật vị trí tooltip
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

// ==============================================================================
// HISTORY FUNCTIONS
// ==============================================================================

function initializeHistoryButton() {
    // Button xem lịch sử
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', viewHistory);
    }
    
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', refreshHistory);
    }
}

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
// NEW CHART FUNCTIONS
// ==============================================================================

// Tính điểm sức khỏe cho từng chỉ số (0-100)
function calculateHealthScore(bodyComp) {
    const scores = {};
    
    // BMI Score (0-100)
    if (bodyComp.bmi < 18.5) {
        scores.bmi = Math.max(0, 100 - (18.5 - bodyComp.bmi) * 10);
    } else if (bodyComp.bmi <= 24.9) {
        scores.bmi = 100;
    } else if (bodyComp.bmi <= 29.9) {
        scores.bmi = Math.max(0, 100 - (bodyComp.bmi - 24.9) * 8);
    } else {
        scores.bmi = Math.max(0, 100 - (bodyComp.bmi - 29.9) * 5);
    }
    
    // BMR Score (0-100)
    const avgBMR = bodyComp.gender === 'male' ? 1800 : 1400;
    const bmrRatio = bodyComp.bmr / avgBMR;
    if (bmrRatio >= 0.9 && bmrRatio <= 1.1) {
        scores.bmr = 100;
    } else if (bmrRatio >= 0.8 && bmrRatio <= 1.2) {
        scores.bmr = 80;
    } else {
        scores.bmr = Math.max(0, 100 - Math.abs(bmrRatio - 1) * 50);
    }
    
    // Fat Percentage Score (0-100)
    const fatStatus = getFatPercentageStatus(bodyComp.fp, bodyComp.gender, bodyComp.age);
    if (fatStatus.class === 'status-excellent') {
        scores.fat = 100;
    } else if (fatStatus.class === 'status-warning') {
        scores.fat = 60;
    } else {
        scores.fat = 30;
    }
    
    // Water Percentage Score (0-100)
    const waterStatus = getWaterPercentageStatus(bodyComp.wp, bodyComp.gender, bodyComp.age);
    if (waterStatus.class === 'status-excellent') {
        scores.water = 100;
    } else {
        scores.water = 60;
    }
    
    // Muscle Mass Score (0-100)
    const muscleStatus = getMuscleMassStatus(bodyComp.ms, bodyComp.gender, bodyComp.age);
    if (muscleStatus.class === 'status-excellent') {
        scores.muscle = 100;
    } else if (muscleStatus.class === 'status-warning') {
        scores.muscle = 60;
    } else {
        scores.muscle = 30;
    }
    
    // Visceral Fat Score (0-100)
    if (bodyComp.vf <= 9) {
        scores.visceral = 100;
    } else if (bodyComp.vf <= 15) {
        scores.visceral = 70;
    } else {
        scores.visceral = Math.max(0, 100 - (bodyComp.vf - 15) * 5);
    }
    
    return scores;
}

// Tạo biểu đồ điểm sức khỏe
function createHealthScoreChart(bodyComp) {
    const ctx = document.getElementById('healthScoreChart').getContext('2d');
    const scores = calculateHealthScore(bodyComp);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['BMI', 'BMR', 'Tỷ lệ mỡ', 'Tỷ lệ nước', 'Khối lượng cơ', 'Mỡ nội tạng'],
            datasets: [{
                label: 'Điểm sức khỏe',
                data: [scores.bmi, scores.bmr, scores.fat, scores.water, scores.muscle, scores.visceral],
                backgroundColor: [
                    scores.bmi >= 80 ? '#28a745' : scores.bmi >= 60 ? '#ffc107' : '#dc3545',
                    scores.bmr >= 80 ? '#28a745' : scores.bmr >= 60 ? '#ffc107' : '#dc3545',
                    scores.fat >= 80 ? '#28a745' : scores.fat >= 60 ? '#ffc107' : '#dc3545',
                    scores.water >= 80 ? '#28a745' : scores.water >= 60 ? '#ffc107' : '#dc3545',
                    scores.muscle >= 80 ? '#28a745' : scores.muscle >= 60 ? '#ffc107' : '#dc3545',
                    scores.visceral >= 80 ? '#28a745' : scores.visceral >= 60 ? '#ffc107' : '#dc3545'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.y.toFixed(0) + '/100 điểm';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '/100';
                        }
                    }
                }
            }
        }
    });
}

// Tạo biểu đồ so sánh với tiêu chuẩn
function createStandardsComparisonChart(bodyComp) {
    const ctx = document.getElementById('standardsComparisonChart').getContext('2d');
    
    // Định nghĩa tiêu chuẩn
    const standards = {
        bmi: { min: 18.5, max: 24.9, current: bodyComp.bmi },
        fat: { 
            min: bodyComp.gender === 'male' ? 6 : 16, 
            max: bodyComp.gender === 'male' ? 19 : 26, 
            current: bodyComp.fp 
        },
        water: { 
            min: bodyComp.gender === 'male' ? 55 : 50, 
            max: bodyComp.gender === 'male' ? 65 : 60, 
            current: bodyComp.wp 
        },
        muscle: { 
            min: bodyComp.gender === 'male' ? 30 : 20, 
            max: bodyComp.gender === 'male' ? 50 : 40, 
            current: bodyComp.ms 
        }
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['BMI', 'Tỷ lệ mỡ (%)', 'Tỷ lệ nước (%)', 'Khối lượng cơ (kg)'],
            datasets: [
                {
                    label: 'Tiêu chuẩn tối thiểu',
                    data: [standards.bmi.min, standards.fat.min, standards.water.min, standards.muscle.min],
                    backgroundColor: '#ffc107',
                    borderColor: '#ff8c00',
                    borderWidth: 2
                },
                {
                    label: 'Tiêu chuẩn tối đa',
                    data: [standards.bmi.max, standards.fat.max, standards.water.max, standards.muscle.max],
                    backgroundColor: '#28a745',
                    borderColor: '#1e7e34',
                    borderWidth: 2
                },
                {
                    label: 'Giá trị hiện tại',
                    data: [standards.bmi.current, standards.fat.current, standards.water.current, standards.muscle.current],
                    backgroundColor: '#007bff',
                    borderColor: '#0056b3',
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label;
                            const value = context.parsed.y;
                            const unit = context.label.includes('BMI') ? '' : 
                                       context.label.includes('mỡ') || context.label.includes('nước') ? '%' : 'kg';
                            return label + ': ' + value.toFixed(1) + unit;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Tạo biểu đồ radar tổng quan sức khỏe
function createHealthRadarChart(bodyComp) {
    const ctx = document.getElementById('healthRadarChart').getContext('2d');
    const scores = calculateHealthScore(bodyComp);
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['BMI', 'BMR', 'Tỷ lệ mỡ', 'Tỷ lệ nước', 'Khối lượng cơ', 'Mỡ nội tạng'],
            datasets: [{
                label: 'Điểm sức khỏe hiện tại',
                data: [scores.bmi, scores.bmr, scores.fat, scores.water, scores.muscle, scores.visceral],
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(0, 123, 255, 1)'
            }, {
                label: 'Mục tiêu lý tưởng',
                data: [100, 100, 100, 100, 100, 100],
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(40, 167, 69, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.r.toFixed(0) + '/100 điểm';
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value + '/100';
                        }
                    }
                }
            }
        }
    });
}
