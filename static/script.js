// AgriTech Pro Enhanced JavaScript

// Initialize Socket.IO
const socket = io();

// Global variables
let sensorCharts = {};
let currentUser = 'default_user';
let weatherData = [];
let cropImageFile = null;

// Chart.js default configuration
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 AgriTech Pro Initializing...');
    
    initializeDashboard();
    setupEventListeners();
    loadWeatherData();
    loadUserProgress();
    setupSocketListeners();
    startAnimations();
    
    console.log('✅ AgriTech Pro Ready!');
});

// Dashboard Initialization
function initializeDashboard() {
    console.log('📊 Initializing dashboard charts...');
    
    // Soil Moisture Chart
    const soilCtx = document.getElementById('soilMoistureChart')?.getContext('2d');
    if (soilCtx) {
        sensorCharts.soilMoisture = new Chart(soilCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Soil Moisture (%)',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Temperature Chart
    const tempCtx = document.getElementById('temperatureChart')?.getContext('2d');
    if (tempCtx) {
        sensorCharts.temperature = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Ambient Temp (°C)',
                    data: [],
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Soil Temp (°C)',
                    data: [],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 45
                    }
                }
            }
        });
    }

    // Nutrient Chart (pH and NPK)
    const nutrientCtx = document.getElementById('nutrientChart')?.getContext('2d');
    if (nutrientCtx) {
        sensorCharts.nutrients = new Chart(nutrientCtx, {
            type: 'bar',
            data: {
                labels: ['pH', 'Nitrogen', 'Phosphorus', 'Potassium'],
                datasets: [{
                    label: 'Current Levels',
                    data: [6.8, 35, 25, 30],
                    backgroundColor: [
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(156, 39, 176, 0.8)'
                    ],
                    borderColor: [
                        '#FFC107',
                        '#4CAF50',
                        '#2196F3',
                        '#9C27B0'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50
                    }
                }
            }
        });
    }

    // Environmental Chart
    const envCtx = document.getElementById('environmentChart')?.getContext('2d');
    if (envCtx) {
        sensorCharts.environment = new Chart(envCtx, {
            type: 'doughnut',
            data: {
                labels: ['Humidity', 'Light Intensity', 'Wind Speed'],
                datasets: [{
                    data: [70, 850, 12],
                    backgroundColor: [
                        '#2196F3',
                        '#FFC107',
                        '#4CAF50'
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Event Listeners Setup
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Form submissions
    setupFormHandlers();
    
    // Image upload handlers
    setupImageUpload();
    
    // Chat functionality
    setupChat();
    
    // Navigation
    setupNavigation();
    
    // Utility functions
    setupUtilityHandlers();
}

function setupFormHandlers() {
    // Yield Prediction Form
    const yieldForm = document.getElementById('yieldForm');
    if (yieldForm) {
        yieldForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleYieldPrediction(e);
        });
    }

    // Crop Recommendation Form
    const cropForm = document.getElementById('cropForm');
    if (cropForm) {
        cropForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleCropRecommendation(e);
        });
    }

    // Climate Risk Form
    const climateForm = document.getElementById('climateRiskForm');
    if (climateForm) {
        climateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleClimateRisk(e);
        });
    }

    // Crop Record Form
    const recordForm = document.getElementById('cropRecordForm');
    if (recordForm) {
        recordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleCropRecord(e);
        });
    }
}

// Handle Yield Prediction
async function handleYieldPrediction(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<span class="loading"></span> Predicting...';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('/predict_yield', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        displayYieldResults(result);
        
        // Award points for prediction
        await awardPoints('first_prediction');
        
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification('Error making prediction. Please try again.', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function displayYieldResults(data) {
    const container = document.getElementById('yieldResult');
    if (!container) return;

    if (data.error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${data.error}
            </div>
        `;
    } else {
        const categoryClass = data.yield_category === 'High' ? 'success' : 
                           data.yield_category === 'Medium' ? 'warning' : 'info';
        
        container.innerHTML = `
            <div class="alert alert-${categoryClass}">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-chart-line me-2"></i>Prediction Results</h5>
                        <p class="mb-1"><strong>Predicted Yield:</strong> ${data.predicted_yield}</p>
                        <p class="mb-1"><strong>Yield Category:</strong> ${data.yield_category}</p>
                        <p class="mb-0"><strong>Confidence:</strong> ${data.confidence_score?.toFixed(1) || 'N/A'}%</p>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-lightbulb me-2"></i>Smart Recommendations</h6>
                        <div class="recommendations">
                            ${formatAdviceList(data.smart_advice)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Smooth scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handle Crop Recommendation
async function handleCropRecommendation(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<span class="loading"></span> Analyzing...';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('/recommend_crop', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        displayCropResults(result);
        
    } catch (error) {
        console.error('Recommendation error:', error);
        showNotification('Error getting recommendations. Please try again.', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function displayCropResults(data) {
    const container = document.getElementById('cropResult');
    if (!container) return;

    if (data.error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${data.error}
            </div>
        `;
    } else {
        const cropsHTML = data.recommendations
            .map(([crop, confidence]) => 
                `<div class="crop-recommendation">
                    <span class="crop-name">${crop}</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${(confidence * 100).toFixed(1)}%"></div>
                        <span class="confidence-text">${(confidence * 100).toFixed(1)}%</span>
                    </div>
                </div>`
            ).join('');
        
        container.innerHTML = `
            <div class="alert alert-info">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-seedling me-2"></i>Recommended Crops</h5>
                        <div class="crops-list">
                            ${cropsHTML}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-lightbulb me-2"></i>Selection Advice</h6>
                        <div class="recommendations">
                            ${formatAdviceList(data.smart_advice)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handle Climate Risk Assessment
async function handleClimateRisk(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<span class="loading"></span> Assessing Risks...';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('/climate-risk-assessment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        displayClimateResults(result);
        
        // Award points for climate assessment
        await awardPoints('climate_warrior');
        
    } catch (error) {
        console.error('Climate assessment error:', error);
        showNotification('Error assessing climate risks. Please try again.', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function displayClimateResults(result) {
    const resultsDiv = document.getElementById('climate-results');
    if (!resultsDiv) return;
    
    const riskLevel = result.risk_level;
    const riskClass = riskLevel === 'High' ? 'danger' : riskLevel === 'Medium' ? 'warning' : 'success';
    
    const riskIndicators = [
        { name: 'Drought Risk', value: result.climate_risks.drought_risk, icon: 'fas fa-sun', color: '#FF9800' },
        { name: 'Heat Stress', value: result.climate_risks.heat_stress_risk, icon: 'fas fa-thermometer-full', color: '#F44336' },
        { name: 'Flood Risk', value: result.climate_risks.flood_risk, icon: 'fas fa-tint', color: '#2196F3' },
        { name: 'Pest/Disease', value: result.climate_risks.pest_disease_risk, icon: 'fas fa-bug', color: '#4CAF50' }
    ];
    
    const riskHTML = riskIndicators.map(risk => 
        `<div class="risk-indicator">
            <i class="${risk.icon}" style="color: ${risk.color}"></i>
            <span class="risk-name">${risk.name}</span>
            <div class="risk-bar">
                <div class="risk-fill" style="width: ${risk.value.toFixed(1)}%; background-color: ${risk.color}"></div>
                <span class="risk-value">${risk.value.toFixed(1)}%</span>
            </div>
        </div>`
    ).join('');
    
    resultsDiv.innerHTML = `
        <div class="climate-assessment-result">
            <div class="row mb-4">
                <div class="col-12">
                    <div class="alert alert-${riskClass} text-center">
                        <h4><i class="fas fa-shield-alt me-2"></i>Overall Risk Level: ${riskLevel}</h4>
                        <p class="mb-0">Risk Score: ${result.climate_risks.overall_risk_score.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="fas fa-chart-bar me-2"></i>Risk Breakdown</h5>
                    <div class="risk-indicators">
                        ${riskHTML}
                    </div>
                </div>
                
                <div class="col-md-6">
                    <h5><i class="fas fa-lightbulb me-2"></i>AI Adaptation Strategies</h5>
                    <div class="adaptation-strategies">
                        ${formatAdviceList(result.ai_recommendations)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Image Upload Setup
function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('cropImageInput');
    
    if (uploadArea && imageInput) {
        // Drag and drop events
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageFile(files[0]);
            }
        });
        
        // File input change
        imageInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleImageFile(e.target.files[0]);
            }
        });
    }
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'warning');
        return;
    }
    
    if (file.size > 16 * 1024 * 1024) { // 16MB limit
        showNotification('Image file is too large. Please select a file under 16MB.', 'warning');
        return;
    }
    
    cropImageFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (preview && previewImg) {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('uploadArea').style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// Analyze Crop Health
async function analyzeCropHealth() {
    if (!cropImageFile) {
        showNotification('Please select an image first.', 'warning');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('image', cropImageFile);
        
        showNotification('Analyzing crop health...', 'info');
        
        const response = await fetch('/crop-health-analysis', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        displayHealthResults(result);
        
        // Award points for using computer vision
        await awardPoints('tech_pioneer');
        
    } catch (error) {
        console.error('Health analysis error:', error);
        showNotification('Error analyzing image. Please try again.', 'danger');
    }
}

function displayHealthResults(data) {
    const container = document.getElementById('healthResults');
    if (!container) return;
    
    if (data.error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${data.error}
            </div>
        `;
    } else {
        const healthClass = data.health_score >= 80 ? 'success' : 
                          data.health_score >= 60 ? 'warning' : 'danger';
        
        const diseaseClass = data.disease_detected ? 'danger' : 'success';
        
        container.innerHTML = `
            <div class="health-analysis-result">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="health-score-card alert alert-${healthClass}">
                            <h5><i class="fas fa-heart me-2"></i>Health Score</h5>
                            <div class="score-display">
                                <span class="score-value">${data.health_score}%</span>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${data.health_score}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="disease-detection alert alert-${diseaseClass}">
                            <h5><i class="fas fa-microscope me-2"></i>Disease Detection</h5>
                            <p class="mb-1">
                                <strong>Status:</strong> 
                                ${data.disease_detected ? 'Disease Detected' : 'Healthy'}
                            </p>
                            <p class="mb-1">
                                <strong>Confidence:</strong> ${data.disease_confidence.toFixed(1)}%
                            </p>
                            <p class="mb-0">
                                <strong>Type:</strong> ${data.disease_type || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <h6><i class="fas fa-palette me-2"></i>Color Analysis</h6>
                        <div class="color-stats">
                            <div class="stat-item">
                                <span class="stat-label">Green Coverage:</span>
                                <span class="stat-value">${data.color_analysis.green_percentage.toFixed(1)}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Yellowing:</span>
                                <span class="stat-value">${data.color_analysis.yellow_percentage.toFixed(1)}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Brown Spots:</span>
                                <span class="stat-value">${data.color_analysis.brown_percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>Stress Indicators</h6>
                        <div class="stress-indicators">
                            ${data.stress_indicators.map(indicator => 
                                `<div class="stress-item">
                                    <i class="fas fa-dot-circle text-warning"></i>
                                    ${indicator}
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h6><i class="fas fa-prescription-bottle me-2"></i>Treatment</h6>
                        <div class="treatment-suggestions">
                            ${formatAdviceList(data.treatment_suggestions.join('\n'))}
                        </div>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-12">
                        <h6><i class="fas fa-lightbulb me-2"></i>Recommendations</h6>
                        <div class="recommendations">
                            ${formatAdviceList(data.recommendations.join('\n'))}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handle Crop Record Creation
async function handleCropRecord(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<span class="loading"></span> Creating Record...';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('/api/create-crop-record', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        displayBlockchainResult(result);
        
        // Award points for blockchain usage
        await awardPoints('blockchain_farmer');
        
    } catch (error) {
        console.error('Record creation error:', error);
        showNotification('Error creating blockchain record. Please try again.', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function displayBlockchainResult(data) {
    const container = document.getElementById('blockchainResult');
    if (!container) return;

    if (data.error) {
        container.innerHTML = `
            <div class="alert alert-danger mt-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${data.error}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="alert alert-success mt-3">
                <h5><i class="fas fa-check-circle me-2"></i>Blockchain Record Created</h5>
                <div class="record-info">
                    <p><strong>Record ID:</strong> ${data.record_id}</p>
                    <p><strong>Blockchain Hash:</strong> <code>${data.hash.substring(0, 16)}...</code></p>
                    <p><strong>QR Code:</strong> ${data.qr_code_data}</p>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-success" onclick="traceCrop(${data.record_id})">
                            <i class="fas fa-search me-1"></i>View Traceability
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Crop Tracing
async function traceCrop(recordId) {
    if (!recordId) {
        recordId = document.getElementById('traceInput')?.value;
        if (!recordId) {
            showNotification('Please enter a record ID to trace.', 'warning');
            return;
        }
    }
    
    try {
        const response = await fetch(`/api/trace-crop/${recordId}`);
        const result = await response.json();
        displayTraceResults(result);
    } catch (error) {
        console.error('Tracing error:', error);
        showNotification('Error tracing crop record. Please try again.', 'danger');
    }
}

function displayTraceResults(data) {
    const container = document.getElementById('traceResults');
    if (!container) return;

    if (data.error) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${data.error}
            </div>
        `;
    } else {
        const journeyHTML = data.supply_chain_journey.map((stage, index) => 
            `<div class="journey-stage ${stage.status.toLowerCase()}">
                <div class="stage-icon">
                    <i class="fas fa-${getStageIcon(stage.stage)}"></i>
                </div>
                <div class="stage-content">
                    <h6>${stage.stage}</h6>
                    <p class="stage-date">${stage.date}</p>
                    <p class="stage-details">${stage.details}</p>
                    <span class="stage-status badge bg-${getStatusColor(stage.status)}">${stage.status}</span>
                </div>
            </div>`
        ).join('');
        
        container.innerHTML = `
            <div class="trace-result">
                <div class="record-header">
                    <h5><i class="fas fa-info-circle me-2"></i>Crop Record Details</h5>
                    <div class="record-basic-info">
                        <p><strong>Farmer:</strong> ${data.crop_record.farmer_name}</p>
                        <p><strong>Crop:</strong> ${data.crop_record.crop_type}</p>
                        <p><strong>Location:</strong> ${data.crop_record.location}</p>
                        <p><strong>Area:</strong> ${data.crop_record.area_hectares.toFixed(2)} hectares</p>
                    </div>
                </div>
                
                <div class="sustainability-metrics mb-3">
                    <h6><i class="fas fa-leaf me-2"></i>Sustainability Metrics</h6>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Carbon Footprint</span>
                            <span class="metric-value">${data.sustainability_metrics.carbon_footprint} kg CO₂/kg</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Water Usage</span>
                            <span class="metric-value">${data.sustainability_metrics.water_usage} L/kg</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Sustainability Score</span>
                            <span class="metric-value">${data.sustainability_metrics.sustainability_score}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="supply-chain-journey">
                    <h6><i class="fas fa-route me-2"></i>Supply Chain Journey</h6>
                    <div class="journey-timeline">
                        ${journeyHTML}
                    </div>
                </div>
            </div>
        `;
    }
    
    container.style.display = 'block';
}

function getStageIcon(stage) {
    const icons = {
        'Seed Preparation': 'seedling',
        'Planting': 'leaf',
        'Growing Phase': 'tree',
        'Pre-Harvest Inspection': 'search',
        'Harvest': 'cut',
        'Post-Harvest Processing': 'cogs',
        'Quality Certification': 'certificate',
        'Distribution': 'truck'
    };
    return icons[stage] || 'circle';
}

function getStatusColor(status) {
    const colors = {
        'completed': 'success',
        'in progress': 'primary',
        'pending': 'warning',
        'in transit': 'info'
    };
    return colors[status.toLowerCase()] || 'secondary';
}

// Chat Setup
function setupChat() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch('/smart_advice', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt: message})
        });
        
        const data = await response.json();
        addMessageToChat(data.advice || data.error, 'ai');
        
    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'ai' ? 'fas fa-robot' : 'fas fa-user';
    const senderName = sender === 'ai' ? 'AI Assistant' : 'You';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatar}"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <strong>${senderName}</strong>
                <small>${new Date().toLocaleTimeString()}</small>
            </div>
            <div class="message-text">
                ${formatAdviceList(message)}
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Socket.IO Event Handlers
function setupSocketListeners() {
    console.log('🔌 Setting up Socket.IO listeners...');
    
    socket.on('connect', function() {
        console.log('✅ Connected to IoT monitoring system');
        showNotification('Connected to real-time monitoring', 'success');
    });
    
    socket.on('disconnect', function() {
        console.log('❌ Disconnected from IoT system');
        showNotification('Disconnected from real-time monitoring', 'warning');
    });
    
    socket.on('sensor_update', function(data) {
        updateSensorData(data);
        updateMetricCards(data);
        checkAlerts(data);
    });
}

function updateSensorData(data) {
    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    
    // Update charts
    Object.keys(sensorCharts).forEach(chartKey => {
        const chart = sensorCharts[chartKey];
        if (!chart) return;
        
        if (chartKey === 'soilMoisture') {
            chart.data.labels.push(timestamp);
            chart.data.datasets[0].data.push(data.soil_moisture);
        } else if (chartKey === 'temperature') {
            chart.data.labels.push(timestamp);
            chart.data.datasets[0].data.push(data.ambient_temperature);
            chart.data.datasets[1].data.push(data.soil_temperature);
        } else if (chartKey === 'nutrients') {
            chart.data.datasets[0].data = [
                data.soil_ph,
                data.npk_levels.nitrogen,
                data.npk_levels.phosphorus,
                data.npk_levels.potassium
            ];
        } else if (chartKey === 'environment') {
            chart.data.datasets[0].data = [
                data.humidity,
                data.light_intensity / 20, // Scale down for display
                data.wind_speed
            ];
        }
        
        // Keep only last 20 data points for line charts
        if (['soilMoisture', 'temperature'].includes(chartKey)) {
            if (chart.data.labels.length > 20) {
                chart.data.labels.shift();
                chart.data.datasets.forEach(dataset => dataset.data.shift());
            }
        }
        
        chart.update('none');
    });
}

function updateMetricCards(data) {
    // Update metric card values
    const tempElement = document.getElementById('current-temp');
    if (tempElement) {
        tempElement.textContent = `${data.ambient_temperature.toFixed(1)}°C`;
    }
    
    const moistureElement = document.getElementById('soil-moisture');
    if (moistureElement) {
        moistureElement.textContent = `${data.soil_moisture.toFixed(1)}%`;
    }
    
    const phElement = document.getElementById('soil-ph');
    if (phElement) {
        phElement.textContent = data.soil_ph.toFixed(1);
    }
}

function checkAlerts(data) {
    const alerts = [];
    
    if (data.soil_moisture < 30) {
        alerts.push({
            type: 'warning',
            title: 'Low Soil Moisture',
            message: `Soil moisture is at ${data.soil_moisture.toFixed(1)}%. Irrigation recommended.`,
            icon: 'fas fa-tint'
        });
    }
    
    if (data.ambient_temperature > 35) {
        alerts.push({
            type: 'danger',
            title: 'High Temperature Alert',
            message: `Temperature is ${data.ambient_temperature.toFixed(1)}°C. Monitor crop stress levels.`,
            icon: 'fas fa-thermometer-full'
        });
    }
    
    if (data.soil_ph < 6.0 || data.soil_ph > 7.5) {
        alerts.push({
            type: 'info',
            title: 'pH Alert',
            message: `Soil pH is ${data.soil_ph.toFixed(1)}. Consider soil amendment.`,
            icon: 'fas fa-flask'
        });
    }
    
    if (data.humidity > 90) {
        alerts.push({
            type: 'warning',
            title: 'High Humidity',
            message: `Humidity is ${data.humidity.toFixed(1)}%. Risk of fungal diseases.`,
            icon: 'fas fa-cloud'
        });
    }
    
    displayAlerts(alerts);
}

function displayAlerts(alerts) {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;
    
    // Update alert count
    const alertCountElement = document.getElementById('alert-count');
    if (alertCountElement) {
        alertCountElement.textContent = alerts.length;
    }
    
    if (alerts.length === 0) {
        alertsContainer.innerHTML = '';
        return;
    }
    
    const alertsHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type} alert-dismissible fade show" role="alert">
            <i class="${alert.icon} me-2"></i>
            <strong>${alert.title}</strong>
            <div>${alert.message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `).join('');
    
    alertsContainer.innerHTML = alertsHTML;
    
    // Auto-dismiss alerts after 15 seconds
    setTimeout(() => {
        const alertElements = alertsContainer.querySelectorAll('.alert');
        alertElements.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 15000);
}

// Weather Data Loading
async function loadWeatherData() {
    try {
        const response = await fetch('/api/weather-forecast');
        const data = await response.json();
        displayWeatherForecast(data.forecast);
        weatherData = data.forecast;
    } catch (error) {
        console.error('Weather loading error:', error);
    }
}

function displayWeatherForecast(forecast) {
    const container = document.getElementById('weather-forecast');
    if (!container) return;
    
    const forecastHTML = forecast.map(day => {
        const icon = getWeatherIcon(day.weather_condition);
        return `
            <div class="weather-day">
                <div class="weather-date">${day.day_name}</div>
                <div class="weather-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="weather-temps">
                    <span class="temp-max">${day.temperature_max}°</span>
                    <span class="temp-min">${day.temperature_min}°</span>
                </div>
                <div class="weather-details">
                    <small>Rain: ${day.rainfall_probability}%</small>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = forecastHTML;
}

function getWeatherIcon(condition) {
    const icons = {
        'sunny': 'fas fa-sun text-warning',
        'partly_cloudy': 'fas fa-cloud-sun text-info',
        'cloudy': 'fas fa-cloud text-secondary',
        'rainy': 'fas fa-cloud-rain text-primary',
        'thunderstorm': 'fas fa-bolt text-danger'
    };
    return icons[condition] || 'fas fa-cloud text-secondary';
}

function refreshWeather() {
    loadWeatherData();
    showNotification('Weather data refreshed', 'info');
}

// Gamification Functions
async function loadUserProgress() {
    try {
        const response = await fetch(`/api/user-progress?user=${currentUser}`);
        const data = await response.json();
        updateProgressDisplay(data);
    } catch (error) {
        console.error('Progress loading error:', error);
    }
}

function updateProgressDisplay(data) {
    // Update level display
    const levelElement = document.getElementById('user-level');
    const levelTitleElement = document.getElementById('level-title');
    if (levelElement) levelElement.textContent = data.level;
    if (levelTitleElement) levelTitleElement.textContent = data.level_title;
    
    // Update progress circle
    const progressCircle = document.getElementById('progress-circle');
    if (progressCircle) {
        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (data.progress_percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }
    
    // Update XP progress
    const xpProgress = document.getElementById('xp-progress');
    const progressPoints = document.getElementById('progress-points');
    if (xpProgress) xpProgress.style.width = `${data.progress_percentage}%`;
    if (progressPoints) progressPoints.textContent = `${data.points}/${data.next_level_points} XP`;
    
    // Update achievements
    displayAchievements(data.achievements_earned, data.badges);
}

function displayAchievements(achievements, badges) {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    const achievementsHTML = achievements.map(achievement => `
        <div class="achievement-badge">
            <i class="${achievement.icon}"></i>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} XP</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = achievementsHTML;
}

async function awardPoints(action) {
    try {
        const response = await fetch('/api/award-points', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: action, user: currentUser})
        });
        
        const result = await response.json();
        if (result.success) {
            showAchievementNotification(result.achievement, result.points_awarded);
            if (result.level_up) {
                showLevelUpNotification();
            }
            // Refresh progress display
            setTimeout(() => loadUserProgress(), 1000);
        }
    } catch (error) {
        console.error('Points award error:', error);
    }
}

function showAchievementNotification(achievement, points) {
    const notification = `
        <div class="toast achievement-toast" role="alert">
            <div class="toast-header bg-success text-white">
                <i class="fas fa-trophy me-2"></i>
                <strong class="me-auto">Achievement Unlocked!</strong>
            </div>
            <div class="toast-body">
                <div class="d-flex align-items-center">
                    <i class="${achievement.icon} fa-2x text-success me-3"></i>
                    <div>
                        <strong>${achievement.title}</strong><br>
                        <small>${achievement.description}</small><br>
                        <span class="badge bg-success">+${points} XP</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showToastNotification(notification);
}

function showLevelUpNotification() {
    const notification = `
        <div class="toast level-up-toast" role="alert">
            <div class="toast-header bg-warning text-dark">
                <i class="fas fa-star me-2"></i>
                <strong class="me-auto">Level Up!</strong>
            </div>
            <div class="toast-body text-center">
                <i class="fas fa-medal fa-3x text-warning mb-2"></i>
                <div><strong>Congratulations!</strong></div>
                <div>You've reached a new farmer level!</div>
            </div>
        </div>
    `;
    
    showToastNotification(notification);
}

// Navigation and Utility Functions
function setupNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupUtilityHandlers() {
    // Add click handlers for various buttons
    window.scrollToSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    window.traceCrop = traceCrop;
    window.analyzeCropHealth = analyzeCropHealth;
    window.refreshWeather = refreshWeather;
}

// Animation and UI Enhancement Functions
function startAnimations() {
    // Counter animations for hero stats
    animateCounters();
    
    // Intersection Observer for fade-in animations
    setupIntersectionObserver();
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
}

// Utility Functions
function formatAdviceList(advice) {
    if (!advice) return '';
    
    return advice.split('\n')
        .filter(line => line.trim())
        .map(line => `<div class="advice-item"><i class="fas fa-lightbulb text-warning me-2"></i>${line.trim()}</div>`)
        .join('');
}

function showNotification(message, type = 'info') {
    const notification = `
        <div class="toast notification-toast" role="alert">
            <div class="toast-header bg-${type} text-white">
                <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
                <strong class="me-auto">Notification</strong>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    showToastNotification(notification);
}

function showToastNotification(html) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', html);
    
    // Initialize and show the toast
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Remove from DOM after hiding
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'danger': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'danger');
});

// Performance monitoring
window.addEventListener('load', function() {
    console.log(`🚀 AgriTech Pro loaded in ${performance.now().toFixed(2)}ms`);
});

console.log('📜 AgriTech Pro JavaScript loaded successfully!');
