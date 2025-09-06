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
        createBodyCompositionChart(result.body_composition);
        initializeTooltips();
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

// Thêm event listener để cập nhật vị trí tooltip khi scroll
document.addEventListener('scroll', function() {
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
