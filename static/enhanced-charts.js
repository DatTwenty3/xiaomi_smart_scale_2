// Enhanced Data Visualization với Interactive Charts
// Tích hợp Chart.js và custom health indicators

class HealthDataVisualizer {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            gray: '#6b7280'
        };
    }

    // Tạo health status indicator
    createHealthStatusIndicator(value, type, ranges) {
        let status = 'excellent';
        let color = this.colors.success;
        
        if (value < ranges.good.min || value > ranges.good.max) {
            status = 'danger';
            color = this.colors.danger;
        } else if (value < ranges.excellent.min || value > ranges.excellent.max) {
            status = 'warning';
            color = this.colors.warning;
        }

        return {
            status,
            color,
            class: `health-status-indicator ${status}`
        };
    }

    // Tạo progress ring
    createProgressRing(containerId, value, max, label, color = this.colors.primary) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const percentage = (value / max) * 100;
        const circumference = 2 * Math.PI * 50; // radius = 50
        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

        container.innerHTML = `
            <div class="progress-ring">
                <svg>
                    <circle class="progress-ring-circle progress-ring-bg" cx="60" cy="60" r="50"></circle>
                    <circle class="progress-ring-circle progress-ring-fill" 
                            cx="60" cy="60" r="50" 
                            style="--progress: ${(percentage / 100) * circumference}; stroke: ${color};"></circle>
                </svg>
                <div class="progress-ring-text">
                    <div class="progress-ring-value">${value.toFixed(1)}</div>
                    <div class="progress-ring-label">${label}</div>
                </div>
            </div>
        `;
    }

    // Tạo body composition chart
    createBodyCompositionChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const chartData = {
            labels: ['Mỡ', 'Cơ', 'Nước', 'Xương', 'Protein'],
            datasets: [{
                data: [
                    data.fp || 0,
                    data.ms || 0,
                    data.wp || 0,
                    data.bm || 0,
                    data.pp || 0
                ],
                backgroundColor: [
                    this.colors.danger,
                    this.colors.success,
                    this.colors.info,
                    this.colors.warning,
                    this.colors.secondary
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toFixed(1) + '%';
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }

    // Tạo health score chart
    createHealthScoreChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Tính health score dựa trên các chỉ số
        const healthScore = this.calculateHealthScore(data);
        
        // Tạo container cho chart và text overlay
        const container = canvas.parentElement;
        container.style.position = 'relative';
        
        // Tạo text overlay
        const textOverlay = document.createElement('div');
        textOverlay.id = canvasId + '-overlay';
        textOverlay.style.position = 'absolute';
        textOverlay.style.top = '50%';
        textOverlay.style.left = '50%';
        textOverlay.style.transform = 'translate(-50%, -50%)';
        textOverlay.style.textAlign = 'center';
        textOverlay.style.pointerEvents = 'none';
        textOverlay.style.zIndex = '10';
        
        // Tạo HTML cho text overlay
        textOverlay.innerHTML = `
            <div style="font-size: 2rem; font-weight: bold; color: ${this.getHealthScoreColor(healthScore)}; line-height: 1;">
                ${healthScore}
            </div>
            <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                điểm
            </div>
        `;
        
        // Xóa overlay cũ nếu có
        const oldOverlay = document.getElementById(canvasId + '-overlay');
        if (oldOverlay) {
            oldOverlay.remove();
        }
        
        // Thêm overlay mới
        container.appendChild(textOverlay);
        
        const chartData = {
            labels: ['Điểm sức khỏe'],
            datasets: [{
                data: [healthScore, 100 - healthScore],
                backgroundColor: [
                    this.getHealthScoreColor(healthScore),
                    '#f3f4f6'
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        };

        this.charts[canvasId] = new Chart(canvas, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                cutout: '75%',
                animation: {
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }

    // Tính health score
    calculateHealthScore(data) {
        let score = 0;
        let factors = 0;

        // BMI scoring
        const bmiScore = this.getBMIScore(data.bmi);
        score += bmiScore * 0.2;
        factors += 0.2;

        // Body fat scoring
        const fatScore = this.getBodyFatScore(data.fp, data.gender);
        score += fatScore * 0.2;
        factors += 0.2;

        // Water percentage scoring
        const waterScore = this.getWaterScore(data.wp, data.gender);
        score += waterScore * 0.15;
        factors += 0.15;

        // Muscle mass scoring
        const muscleScore = this.getMuscleScore(data.ms, data.gender, data.weight);
        score += muscleScore * 0.15;
        factors += 0.15;

        // Visceral fat scoring
        const visceralScore = this.getVisceralFatScore(data.vf);
        score += visceralScore * 0.15;
        factors += 0.15;

        // Balance time scoring
        const balanceScore = this.getBalanceScore(data.ols);
        score += balanceScore * 0.15;
        factors += 0.15;

        return factors > 0 ? Math.round(score / factors) : 0;
    }

    // Các hàm tính điểm cho từng chỉ số
    getBMIScore(bmi) {
        if (bmi >= 18.5 && bmi <= 24.9) return 100;
        if (bmi >= 17 && bmi < 18.5) return 80;
        if (bmi > 24.9 && bmi <= 29.9) return 70;
        if (bmi >= 16 && bmi < 17) return 60;
        if (bmi > 29.9 && bmi <= 35) return 50;
        return 30;
    }

    getBodyFatScore(fatPercent, gender) {
        const ranges = gender === 'male' 
            ? { excellent: [6, 13], good: [14, 17], fair: [18, 24], poor: [25, 100] }
            : { excellent: [16, 20], good: [21, 24], fair: [25, 31], poor: [32, 100] };
        
        if (fatPercent >= ranges.excellent[0] && fatPercent <= ranges.excellent[1]) return 100;
        if (fatPercent >= ranges.good[0] && fatPercent <= ranges.good[1]) return 85;
        if (fatPercent >= ranges.fair[0] && fatPercent <= ranges.fair[1]) return 70;
        return 50;
    }

    getWaterScore(waterPercent, gender) {
        const ranges = gender === 'male' 
            ? { excellent: [60, 65], good: [55, 59], fair: [50, 54], poor: [0, 49] }
            : { excellent: [55, 60], good: [50, 54], fair: [45, 49], poor: [0, 44] };
        
        if (waterPercent >= ranges.excellent[0] && waterPercent <= ranges.excellent[1]) return 100;
        if (waterPercent >= ranges.good[0] && waterPercent <= ranges.good[1]) return 85;
        if (waterPercent >= ranges.fair[0] && waterPercent <= ranges.fair[1]) return 70;
        return 50;
    }

    getMuscleScore(muscleMass, gender, weight) {
        const musclePercent = (muscleMass / weight) * 100;
        const ranges = gender === 'male' 
            ? { excellent: [45, 55], good: [40, 44], fair: [35, 39], poor: [0, 34] }
            : { excellent: [35, 45], good: [30, 34], fair: [25, 29], poor: [0, 24] };
        
        if (musclePercent >= ranges.excellent[0] && musclePercent <= ranges.excellent[1]) return 100;
        if (musclePercent >= ranges.good[0] && musclePercent <= ranges.good[1]) return 85;
        if (musclePercent >= ranges.fair[0] && musclePercent <= ranges.fair[1]) return 70;
        return 50;
    }

    getVisceralFatScore(visceralFat) {
        if (visceralFat >= 1 && visceralFat <= 9) return 100;
        if (visceralFat >= 10 && visceralFat <= 14) return 70;
        if (visceralFat >= 15 && visceralFat <= 20) return 50;
        return 30;
    }

    getBalanceScore(balanceTime) {
        if (balanceTime >= 30) return 100;
        if (balanceTime >= 20) return 85;
        if (balanceTime >= 10) return 70;
        if (balanceTime >= 5) return 50;
        return 30;
    }

    getHealthScoreColor(score) {
        if (score >= 90) return this.colors.success;
        if (score >= 75) return this.colors.info;
        if (score >= 60) return this.colors.warning;
        return this.colors.danger;
    }

    addCenterText(canvas, score) {
        const ctx = canvas.getContext('2d');
        
        // Lấy kích thước thực tế của canvas
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Clear area ở giữa để vẽ text
        ctx.save();
        ctx.clearRect(centerX - 50, centerY - 30, 100, 60);
        
        // Vẽ điểm số
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillStyle = this.getHealthScoreColor(score);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(score.toString(), centerX, centerY - 8);
        
        // Vẽ label "điểm"
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('điểm', centerX, centerY + 12);
        
        ctx.restore();
    }

    // Tạo radar chart cho tổng quan sức khỏe
    createHealthRadarChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const chartData = {
            labels: ['BMI', 'Tỷ lệ mỡ', 'Tỷ lệ nước', 'Khối lượng cơ', 'Mỡ nội tạng', 'Thăng bằng'],
            datasets: [{
                label: 'Chỉ số hiện tại',
                data: [
                    this.getBMIScore(data.bmi),
                    this.getBodyFatScore(data.fp, data.gender),
                    this.getWaterScore(data.wp, data.gender),
                    this.getMuscleScore(data.ms, data.gender, data.weight),
                    this.getVisceralFatScore(data.vf),
                    this.getBalanceScore(data.ols)
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: this.colors.primary,
                borderWidth: 2,
                pointBackgroundColor: this.colors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: '#e5e7eb'
                        },
                        pointLabels: {
                            font: {
                                size: 11,
                                weight: '500'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    }

    // Tạo comparison chart
    createStandardsComparisonChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const chartData = {
            labels: ['BMI', 'Tỷ lệ mỡ', 'Tỷ lệ nước', 'Khối lượng cơ'],
            datasets: [{
                label: 'Chỉ số của bạn',
                data: [
                    data.bmi,
                    data.fp,
                    data.wp,
                    data.ms
                ],
                backgroundColor: this.colors.primary,
                borderColor: this.colors.primary,
                borderWidth: 2
            }, {
                label: 'Tiêu chuẩn',
                data: [
                    data.gender === 'male' ? 22 : 21, // BMI trung bình
                    data.gender === 'male' ? 15 : 22, // Tỷ lệ mỡ trung bình
                    data.gender === 'male' ? 60 : 55, // Tỷ lệ nước trung bình
                    data.gender === 'male' ? 40 : 30  // Khối lượng cơ trung bình
                ],
                backgroundColor: this.colors.gray,
                borderColor: this.colors.gray,
                borderWidth: 2
            }]
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    }

    // Render tất cả charts
    renderAllCharts(data) {
        this.createBodyCompositionChart('bodyCompositionChart', data);
        this.createHealthScoreChart('healthScoreChart', data);
        this.createHealthRadarChart('healthRadarChart', data);
        this.createStandardsComparisonChart('standardsComparisonChart', data);
    }

    // Destroy tất cả charts
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
        
        // Xóa tất cả text overlays
        document.querySelectorAll('[id$="-overlay"]').forEach(overlay => {
            overlay.remove();
        });
    }
}

// Export cho sử dụng global
window.HealthDataVisualizer = HealthDataVisualizer;
