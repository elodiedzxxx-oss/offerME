// 应用状态管理
const appState = {
    currentStep: 0, // 0: welcome, 1: profile, 2: interview, 3: prediction
    profile: {
        name: '',
        educationLevel: '',
        grade: '',
        majorCategory: '',
        schoolTier: '',
        hasInternship: false,
        internshipCount: 0,
        certCount: 0
    },
    interviews: [],
    predictions: []
};

// 知名公司数据库
const companyDatabase = {
   互联网大厂: [
        { name: '阿里巴巴', difficulty: 0.85, popularity: 0.95, baseChance: 0.15 },
        { name: '腾讯', difficulty: 0.85, popularity: 0.95, baseChance: 0.15 },
        { name: '字节跳动', difficulty: 0.80, popularity: 0.95, baseChance: 0.18 },
        { name: '百度', difficulty: 0.75, popularity: 0.85, baseChance: 0.20 },
        { name: '美团', difficulty: 0.75, popularity: 0.85, baseChance: 0.22 },
        { name: '京东', difficulty: 0.70, popularity: 0.80, baseChance: 0.25 },
        { name: '拼多多', difficulty: 0.80, popularity: 0.90, baseChance: 0.20 },
        { name: '网易', difficulty: 0.75, popularity: 0.85, baseChance: 0.22 }
    ],
    科技公司: [
        { name: '华为', difficulty: 0.80, popularity: 0.90, baseChance: 0.22 },
        { name: '小米', difficulty: 0.70, popularity: 0.80, baseChance: 0.28 },
        { name: 'OPPO', difficulty: 0.70, popularity: 0.75, baseChance: 0.28 },
        { name: 'vivo', difficulty: 0.70, popularity: 0.75, baseChance: 0.28 },
        { name: '大疆创新', difficulty: 0.80, popularity: 0.70, baseChance: 0.25 },
        { name: '海康威视', difficulty: 0.65, popularity: 0.65, baseChance: 0.30 }
    ],
    外企: [
        { name: 'Google', difficulty: 0.95, popularity: 0.90, baseChance: 0.05 },
        { name: 'Microsoft', difficulty: 0.90, popularity: 0.85, baseChance: 0.08 },
        { name: 'Amazon', difficulty: 0.85, popularity: 0.85, baseChance: 0.10 },
        { name: 'Apple', difficulty: 0.90, popularity: 0.90, baseChance: 0.08 },
        { name: 'Meta', difficulty: 0.90, popularity: 0.80, baseChance: 0.07 },
        { name: 'IBM', difficulty: 0.75, popularity: 0.60, baseChance: 0.18 }
    ],
    金融科技: [
        { name: '蚂蚁集团', difficulty: 0.80, popularity: 0.85, baseChance: 0.18 },
        { name: '京东科技', difficulty: 0.75, popularity: 0.75, baseChance: 0.22 },
        { name: '陆金所', difficulty: 0.70, popularity: 0.65, baseChance: 0.25 },
        { name: 'PingPong', difficulty: 0.65, popularity: 0.60, baseChance: 0.28 },
        { name: '同花顺', difficulty: 0.65, popularity: 0.60, baseChance: 0.28 }
    ],
    新兴企业: [
        { name: '商汤科技', difficulty: 0.80, popularity: 0.70, baseChance: 0.20 },
        { name: '旷视科技', difficulty: 0.80, popularity: 0.70, baseChance: 0.20 },
        { name: 'Momenta', difficulty: 0.75, popularity: 0.65, baseChance: 0.22 },
        { name: '地平线机器人', difficulty: 0.75, popularity: 0.65, baseChance: 0.22 },
        { name: '寒武纪', difficulty: 0.75, popularity: 0.65, baseChance: 0.22 }
    ]
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadFromStorage();
});

// 初始化应用
function initializeApp() {
    console.log('offerME - 春招offer预测系统已启动');
    
    // 初始化滑块值显示
    initSliders();
    
    // 如果有保存的数据，显示数据概览
    if (appState.interviews.length > 0) {
        showWelcomeSection();
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 实习经历切换
    document.querySelectorAll('input[name="hasInternship"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const internshipGroup = document.getElementById('internshipGroup');
            if (e.target.value === 'yes') {
                internshipGroup.classList.remove('hidden');
            } else {
                internshipGroup.classList.add('hidden');
            }
        });
    });

    // 模态框点击外部关闭
    const modal = document.getElementById('interviewModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeInterviewModal();
        }
    });

    // 简历按钮
    document.getElementById('historyBtn').addEventListener('click', () => {
        switchTab('dashboard');
    });

    document.getElementById('profileBtn').addEventListener('click', () => {
        switchTab('profile');
    });
}

// 初始化滑块
function initSliders() {
    const sliders = [
        { id: 'certCount', valueId: 'certCountValue' },
        { id: 'questionCount', valueId: 'questionCountValue' }
    ];

    sliders.forEach(({ id, valueId }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(valueId);
        if (slider && valueDisplay) {
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
            });
        }
    });
}

// 切换标签页
function switchTab(tabName) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });

    // 隐藏所有区块
    const sections = ['welcomeSection', 'profileSection', 'interviewSection', 'predictionSection', 'dashboardSection'];
    sections.forEach(section => {
        document.getElementById(section).classList.add('hidden');
    });

    // 显示对应区块
    switch(tabName) {
        case 'predict':
            if (appState.profile.name) {
                showInterviewSection();
            } else {
                showWelcomeSection();
            }
            break;
        case 'dashboard':
            showDashboard();
            break;
        case 'profile':
            showProfileTab();
            break;
    }
}

// 显示欢迎页面
function showWelcomeSection() {
    const sections = ['profileSection', 'interviewSection', 'predictionSection', 'dashboardSection'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById('welcomeSection').classList.remove('hidden');
}

// 显示个人资料设置
function showProfileSetup() {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('profileSection').classList.remove('hidden');
    appState.currentStep = 1;
}

// 保存个人资料
function saveProfile() {
    const name = document.getElementById('userName').value.trim();
    const educationLevel = document.getElementById('educationLevel').value;
    const grade = document.getElementById('grade').value;
    const majorCategory = document.getElementById('majorCategory').value;
    const schoolTier = document.getElementById('schoolTier').value;
    const hasInternship = document.querySelector('input[name="hasInternship"]:checked')?.value === 'yes';
    const internshipCount = parseInt(document.getElementById('internshipCount').value) || 0;
    const certCount = parseInt(document.getElementById('certCount').value);

    // 验证必填项
    if (!name) {
        showToast('请输入姓名', 'error');
        return;
    }
    if (!educationLevel) {
        showToast('请选择学历层次', 'error');
        return;
    }
    if (!majorCategory) {
        showToast('请选择专业类别', 'error');
        return;
    }
    if (!schoolTier) {
        showToast('请选择院校层次', 'error');
        return;
    }

    // 保存资料
    appState.profile = {
        name,
        educationLevel,
        grade,
        majorCategory,
        schoolTier,
        hasInternship,
        internshipCount,
        certCount
    };

    saveToStorage();
    showInterviewSection();
    showToast('资料保存成功！', 'success');
}

// 显示面试录入页面
function showInterviewSection() {
    const sections = ['welcomeSection', 'profileSection', 'predictionSection', 'dashboardSection'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById('interviewSection').classList.remove('hidden');
    appState.currentStep = 2;
    renderInterviewList();
}

// 渲染面试列表
function renderInterviewList() {
    const container = document.getElementById('interviewList');
    
    if (appState.interviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <p>还没有面试记录</p>
                <p style="font-size: 13px; margin-top: 8px;">点击下方按钮添加面试信息</p>
            </div>
        `;
        return;
    }

    // 按公司+岗位分组显示
    const groupedInterviews = {};
    appState.interviews.forEach((interview, index) => {
        const key = `${interview.companyName}|${interview.positionName}`;
        if (!groupedInterviews[key]) {
            groupedInterviews[key] = { interviews: [], indices: [] };
        }
        groupedInterviews[key].interviews.push(interview);
        groupedInterviews[key].indices.push(index);
    });

    let html = '';
    let cardIndex = 0;
    
    Object.values(groupedInterviews).forEach(group => {
        const firstInterview = group.interviews[0];
        const allScores = group.interviews.map(i => calculateInterviewScore(i));
        const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
        const maxRound = Math.max(...group.interviews.map(i => i.round));
        const scoreClass = avgScore >= 70 ? 'positive' : avgScore >= 50 ? '' : 'negative';
        
        html += `
            <div class="interview-card ${scoreClass} fade-in" style="animation-delay: ${cardIndex * 0.1}s">
                <button class="delete-btn" onclick="deleteInterview(${group.indices[0]})">✕</button>
                <div class="interview-card-header">
                    <div>
                        <div class="company-name">${firstInterview.companyName}</div>
                        <div class="position-name">${firstInterview.positionName}</div>
                    </div>
                    <span class="interview-type-badge">共${group.interviews.length}轮面试</span>
                </div>
                <div class="interview-metrics">
                    <div class="metric-item">
                        <span class="icon">🔄</span>
                        <span class="value">最高第${maxRound}轮</span>
                    </div>
                    <div class="metric-item">
                        <span class="icon">⏱️</span>
                        <span class="value">${firstInterview.duration}分钟</span>
                    </div>
                    <div class="metric-item">
                        <span class="icon">❓</span>
                        <span class="value">${firstInterview.questionCount}题</span>
                    </div>
                    <div class="metric-item">
                        <span class="icon">💬</span>
                        <span class="value">${getEmojiRating(firstInterview.coherence)}</span>
                    </div>
                </div>
                <div class="interview-score">
                    <span class="score-label">综合得分</span>
                    <span class="score-value">${avgScore}</span>
                </div>
            </div>
        `;
        cardIndex++;
    });

    container.innerHTML = html;
}

// 计算面试得分
function calculateInterviewScore(interview) {
    const weights = {
        coherence: 0.25,
        technical: 0.30,
        attitude: 0.20,
        difficulty: 0.25
    };

    // 难度与得分的调整
    const difficultyBonus = (5 - interview.difficulty) * 3;
    
    let score = (
        interview.coherence * weights.coherence +
        interview.technical * weights.technical +
        interview.attitude * weights.attitude +
        interview.difficulty * weights.difficulty
    ) * 20 + difficultyBonus;

    // 时长调整（45-75分钟为最佳）
    if (interview.duration >= 45 && interview.duration <= 75) {
        score += 5;
    }

    // 轮次调整（3-4轮为常见）
    if (interview.round >= 2 && interview.round <= 4) {
        score += 3;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
}

// 获取面试类型名称
function getInterviewTypeName(type) {
    const types = {
        'phone': '电话面试',
        'video': '视频面试',
        'onsite': '现场面试',
        'technical': '技术面',
        'hr': 'HR面',
        'final': '终面'
    };
    return types[type] || type;
}

// 获取表情评分
function getEmojiRating(value) {
    const emojis = ['', '😰', '😟', '😐', '🙂', '😊'];
    return emojis[value] || '😐';
}

// 显示添加面试模态框
function showAddInterviewModal() {
    const modal = document.getElementById('interviewModal');
    modal.classList.add('active');
    
    // 重置表单
    document.getElementById('companyName').value = '';
    document.getElementById('positionName').value = '';
    document.getElementById('interviewType').value = 'technical';
    document.getElementById('duration').value = '60';
    document.getElementById('questionCount').value = '8';
    document.getElementById('questionCountValue').textContent = '8';
    document.getElementById('interviewNotes').value = '';
    
    // 重置评分按钮
    resetRatingButtons();
    
    // 默认选中第3轮
    document.querySelectorAll('.round-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.round === '3') {
            btn.classList.add('active');
        }
    });
}

// 关闭面试模态框
function closeInterviewModal() {
    document.getElementById('interviewModal').classList.remove('active');
}

// 重置评分按钮
function resetRatingButtons() {
    document.querySelectorAll('.rating-group').forEach(group => {
        group.querySelectorAll('.rating-btn').forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index === 3) { // 默认选中第4个
                btn.classList.add('selected');
            }
        });
    });
}

// 设置评分按钮点击事件
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.rating-group').forEach(group => {
        group.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    });

    document.querySelectorAll('.round-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.round-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// 保存面试记录
function saveInterview() {
    const companyName = document.getElementById('companyName').value.trim();
    const positionName = document.getElementById('positionName').value.trim();
    const interviewType = document.getElementById('interviewType').value;
    const round = parseInt(document.querySelector('.round-btn.active')?.dataset.round || '3');
    const duration = parseInt(document.getElementById('duration').value) || 60;
    const questionCount = parseInt(document.getElementById('questionCount').value) || 8;
    const notes = document.getElementById('interviewNotes').value.trim();
    const hasTest = document.querySelector('input[name="hasTest"]:checked')?.value === 'yes';

    // 验证必填项
    if (!companyName) {
        showToast('请输入公司名称', 'error');
        return;
    }
    if (!positionName) {
        showToast('请输入岗位名称', 'error');
        return;
    }

    // 获取评分（从选中的按钮获取）
    const getSelectedRating = (group) => {
        const selected = group.querySelector('.rating-btn.selected');
        return selected ? parseInt(selected.dataset.value) : 4;
    };

    const ratingGroups = document.querySelectorAll('.modal-body .rating-group');
    
    const interview = {
        id: Date.now(),
        companyName,
        positionName,
        interviewType,
        round,
        duration,
        questionCount,
        coherence: getSelectedRating(ratingGroups[0]),
        technical: getSelectedRating(ratingGroups[1]),
        attitude: getSelectedRating(ratingGroups[2]),
        difficulty: getSelectedRating(ratingGroups[3]),
        hasTest,
        notes,
        date: new Date().toISOString()
    };

    appState.interviews.push(interview);
    saveToStorage();
    closeInterviewModal();
    renderInterviewList();
    showToast('面试记录添加成功！', 'success');
}

// 删除面试记录
function deleteInterview(index) {
    if (confirm('确定要删除这条面试记录吗？')) {
        appState.interviews.splice(index, 1);
        saveToStorage();
        renderInterviewList();
        showToast('已删除面试记录');
    }
}

// 生成预测结果
function generatePrediction() {
    if (appState.interviews.length === 0) {
        showToast('请先添加至少一条面试记录', 'error');
        return;
    }

    // 计算预测
    const predictions = predictOffers();
    
    // 显示预测结果
    document.getElementById('interviewSection').classList.add('hidden');
    document.getElementById('predictionSection').classList.remove('hidden');
    
    // 动画显示offer数量
    animateOfferCount(predictions.totalOffers);
    
    // 渲染详细预测
    renderDetailedPredictions(predictions.companyPredictions);
    
    // 渲染分析
    renderAnalysis(predictions.analysis);
}

// 预测offer数量和公司
function predictOffers() {
    const profile = appState.profile;
    const interviews = appState.interviews;
    
    // 计算背景分数
    const profileScore = calculateProfileScore(profile);
    
    // 计算面试平均分
    const interviewAvgScore = interviews.reduce((sum, i) => sum + calculateInterviewScore(i), 0) / interviews.length;
    
    // 综合得分
    const compositeScore = profileScore * 0.3 + interviewAvgScore * 0.7;
    
    // 预测offer数量
    const baseOffers = Math.floor(compositeScore / 25);
    const variance = Math.random() * 0.4 - 0.2; // -0.2 到 +0.2
    const predictedOffers = Math.max(1, Math.min(10, Math.round(baseOffers * (1 + variance))));
    
    // 计算各公司offer概率
    const companyPredictions = calculateCompanyPredictions(profile, interviews, compositeScore);
    
    // 生成分析
    const analysis = generateAnalysis(profile, interviews, compositeScore);
    
    return {
        totalOffers: predictedOffers,
        companyPredictions,
        analysis
    };
}

// 计算背景分数
function calculateProfileScore(profile) {
    let score = 50; // 基础分
    
    // 学历加成
    const eduBonus = {
        'bachelor': 5,
        'master': 12,
        'phd': 20
    };
    score += eduBonus[profile.educationLevel] || 0;
    
    // 院校加成
    const schoolBonus = {
        'tier1': 25,
        'tier1_5': 18,
        'tier2': 10,
        'tier3': 0
    };
    score += schoolBonus[profile.schoolTier] || 0;
    
    // 实习加成（按段数计算）
    if (profile.hasInternship && profile.internshipCount > 0) {
        const internBonus = {
            1: 5,
            2: 10,
            3: 15,
            4: 20
        };
        score += internBonus[profile.internshipCount] || 5;
    }
    
    // 证书加成
    score += Math.min(profile.certCount * 2, 10);
    
    return Math.min(100, score);
}

// 计算公司offer概率（按公司+岗位分组）
function calculateCompanyPredictions(profile, interviews, compositeScore) {
    const predictions = [];
    const uniqueKeys = new Set();
    
    // 按公司+岗位分组计算
    interviews.forEach(interview => {
        const key = `${interview.companyName}|${interview.positionName}`;
        
        // 跳过已处理的组合
        if (uniqueKeys.has(key)) return;
        uniqueKeys.add(key);
        
        // 获取同一公司同一岗位的所有面试轮次
        const samePositionInterviews = interviews.filter(
            i => i.companyName === interview.companyName && i.positionName === interview.positionName
        );
        
        // 计算该岗位的综合得分（所有轮次的平均）
        const avgScore = samePositionInterviews.reduce(
            (sum, i) => sum + calculateInterviewScore(i), 0
        ) / samePositionInterviews.length;
        
        // 获取最高轮次
        const maxRound = Math.max(...samePositionInterviews.map(i => i.round));
        
        // 计算概率
        const scoreFactor = avgScore / 100;
        const profileFactor = calculateProfileScore(profile) / 100;
        const combinedFactor = (scoreFactor * 0.6 + profileFactor * 0.4);
        
        // 根据面试轮次调整（进入越后面轮次，概率越高）
        const roundBonus = maxRound >= 4 ? 0.15 : maxRound >= 3 ? 0.1 : maxRound >= 2 ? 0.05 : 0;
        
        // 轮次越多，基础概率越高
        const roundProgressBonus = Math.min(maxRound * 0.03, 0.12);
        
        const probability = Math.min(0.95, Math.max(0.05, 
            combinedFactor + roundBonus + roundProgressBonus - 0.15
        ));
        
        predictions.push({
            companyName: interview.companyName,
            positionName: interview.positionName,
            totalRounds: samePositionInterviews.length,
            maxRound: maxRound,
            avgScore: Math.round(avgScore),
            probability: Math.round(probability * 100),
            status: probability >= 0.6 ? 'high' : probability >= 0.35 ? 'medium' : 'low'
        });
    });
    
    // 排序并返回
    return predictions.sort((a, b) => b.probability - a.probability);
}

// 生成分析内容
function generateAnalysis(profile, interviews, compositeScore) {
    const analysis = [];
    
    // 背景分析
    if (profile.schoolTier === 'tier1') {
        analysis.push({
            icon: '🎓',
            type: 'positive',
            title: '院校优势明显',
            desc: '985/211背景在春招中具有较强竞争力'
        });
    } else if (profile.schoolTier === 'tier3') {
        analysis.push({
            icon: '💪',
            type: 'neutral',
            title: '需要突出项目经验',
            desc: '建议重点展示实习经历和个人项目'
        });
    }
    
    if (profile.hasInternship && profile.internshipCount >= 3) {
        analysis.push({
            icon: '💼',
            type: 'positive',
            title: '实习经历丰富',
            desc: `${profile.internshipCount}段实习经历是重要加分项`
        });
    }
    
    // 面试分析
    const avgCoherence = interviews.reduce((sum, i) => sum + i.coherence, 0) / interviews.length;
    const avgTechnical = interviews.reduce((sum, i) => sum + i.technical, 0) / interviews.length;
    const avgAttitude = interviews.reduce((sum, i) => sum + i.attitude, 0) / interviews.length;
    
    if (avgTechnical >= 4) {
        analysis.push({
            icon: '💻',
            type: 'positive',
            title: '技术表现优秀',
            desc: '技术面试表现稳定，算法和系统设计能力强'
        });
    } else if (avgTechnical < 3) {
        analysis.push({
            icon: '📚',
            type: 'negative',
            title: '技术能力待提升',
            desc: '建议加强算法和核心技术点的复习'
        });
    }
    
    if (avgCoherence >= 4) {
        analysis.push({
            icon: '🗣️',
            type: 'positive',
            title: '表达能力强',
            desc: '回答思路清晰，连贯性好'
        });
    }
    
    if (avgAttitude >= 4) {
        analysis.push({
            icon: '🤝',
            type: 'positive',
            title: '面试印象良好',
            desc: '与面试官互动良好，展现出积极态度'
        });
    }
    
    // 综合建议
    if (compositeScore >= 70) {
        analysis.push({
            icon: '🌟',
            type: 'positive',
            title: '综合竞争力强',
            desc: '预测你有望获得多个优质offer'
        });
    } else if (compositeScore >= 50) {
        analysis.push({
            icon: '📈',
            type: 'neutral',
            title: '具备一定竞争力',
            desc: '建议继续保持面试状态，关注更多机会'
        });
    } else {
        analysis.push({
            icon: '🎯',
            type: 'negative',
            title: '需要更多准备',
            desc: '建议复盘面试表现，针对性提升'
        });
    }
    
    return analysis;
}

// 动画显示offer数量
function animateOfferCount(count) {
    const display = document.getElementById('predictedOfferCount');
    let current = 0;
    const duration = 1500;
    const increment = count / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= count) {
            current = count;
            clearInterval(timer);
        }
        display.textContent = Math.round(current);
    }, 16);
}

// 渲染详细预测
function renderDetailedPredictions(predictions) {
    const container = document.getElementById('detailedPredictions');
    
    if (predictions.length === 0) {
        container.innerHTML = '<p class="empty-state">暂无详细预测</p>';
        return;
    }
    
    container.innerHTML = predictions.map(p => `
        <div class="company-prediction-card ${p.status}-probability fade-in">
            <div class="company-info">
                <h4>${p.companyName}</h4>
                <p class="position-tag">${p.positionName} · ${p.totalRounds}轮面试</p>
                <div class="probability-bar">
                    <div class="probability-fill ${p.status}" style="width: ${p.probability}%"></div>
                </div>
            </div>
            <span class="probability-text ${p.status}">${p.probability}%</span>
        </div>
    `).join('');
}

// 渲染分析内容
function renderAnalysis(analysis) {
    const container = document.getElementById('analysisContent');
    
    container.innerHTML = analysis.map(item => `
        <div class="analysis-item fade-in">
            <div class="analysis-icon ${item.type}">${item.icon}</div>
            <div class="analysis-text">
                <div class="title">${item.title}</div>
                <div class="desc">${item.desc}</div>
            </div>
        </div>
    `).join('');
}

// 编辑面试记录
function editInterviews() {
    document.getElementById('predictionSection').classList.add('hidden');
    document.getElementById('interviewSection').classList.remove('hidden');
}

// 开始新的预测
function startNew() {
    appState.profile = {
        name: '',
        educationLevel: '',
        grade: '',
        majorCategory: '',
        schoolTier: '',
        hasInternship: false,
        internshipCount: 0,
        certCount: 0
    };
    appState.interviews = [];
    appState.predictions = [];
    
    localStorage.removeItem('offerAIState');
    
    switchTab('predict');
}

// 显示数据概览
function showDashboard() {
    const sections = ['welcomeSection', 'profileSection', 'interviewSection', 'predictionSection'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById('dashboardSection').classList.remove('hidden');
    
    updateDashboardStats();
    renderHistoryList();
}

// 更新数据统计
function updateDashboardStats() {
    document.getElementById('totalInterviews').textContent = appState.interviews.length;
    
    const uniqueCompanies = [...new Set(appState.interviews.map(i => i.companyName))];
    document.getElementById('totalCompanies').textContent = uniqueCompanies.length;
    
    if (appState.interviews.length > 0) {
        const avgScore = Math.round(
            appState.interviews.reduce((sum, i) => sum + calculateInterviewScore(i), 0) / appState.interviews.length
        );
        document.getElementById('avgScore').textContent = avgScore;
    } else {
        document.getElementById('avgScore').textContent = '0';
    }
}

// 渲染历史记录
function renderHistoryList() {
    const container = document.getElementById('historyList');
    
    if (appState.interviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📋</div>
                <p>暂无面试记录</p>
            </div>
        `;
        return;
    }
    
    const sortedInterviews = [...appState.interviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedInterviews.map(interview => {
        const score = calculateInterviewScore(interview);
        const date = new Date(interview.date).toLocaleDateString('zh-CN');
        
        return `
            <div class="history-item fade-in">
                <div class="history-info">
                    <h4>${interview.companyName}</h4>
                    <p>${interview.positionName} · ${date}</p>
                </div>
                <span class="history-score">${score}</span>
            </div>
        `;
    }).join('');
}

// 显示个人资料页
function showProfileTab() {
    const sections = ['welcomeSection', 'profileSection', 'interviewSection', 'predictionSection', 'dashboardSection'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
    
    const mainContent = document.getElementById('mainContent');
    
    // 恢复原始HTML结构
    mainContent.innerHTML = `
        <!-- Welcome Section (Step 0) -->
        <section class="welcome-section hidden" id="welcomeSection">
            <div class="welcome-icon">✅</div>
            <h1>欢迎使用 offerME</h1>
            <p class="subtitle">AI驱动的春招offer预测<br>助你知己知彼，决胜春招</p>
            <button class="action-btn primary large" onclick="showProfileSetup()">
                开始预测之旅
            </button>
        </section>

        <!-- Profile Setup Section (Step 1) -->
        <section class="profile-section" id="profileSection">
            <div class="section-header">
                <h2>完善候选人背景</h2>
                <span class="step-badge">1/3</span>
            </div>
            <div class="form-card">
                <div class="form-group">
                    <label>姓名</label>
                    <input type="text" class="form-input" id="userName" placeholder="请输入你的姓名">
                </div>
                <div class="form-group">
                    <label>学历层次</label>
                    <select class="form-input" id="educationLevel">
                        <option value="">请选择学历</option>
                        <option value="bachelor">本科</option>
                        <option value="master">硕士</option>
                        <option value="phd">博士</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>就读年级</label>
                    <select class="form-input" id="grade">
                        <option value="">请选择年级</option>
                        <option value="sophomore">大二</option>
                        <option value="junior">大三</option>
                        <option value="senior">大四</option>
                        <option value="graduated">已毕业</option>
                        <option value="master_year1">研一</option>
                        <option value="master_year2">研二</option>
                        <option value="phd_year1">博一</option>
                        <option value="phd_year2">博二</option>
                        <option value="phd_year3+">博三及以上</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>专业类别</label>
                    <select class="form-input" id="majorCategory">
                        <option value="">请选择专业类别</option>
                        <option value="cs">计算机科学/软件工程</option>
                        <option value="ee">电子信息工程</option>
                        <option value="me">机械工程</option>
                        <option value="business">商科/管理</option>
                        <option value="finance">金融/经济</option>
                        <option value="other">其他专业</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>院校层次</label>
                    <select class="form-input" id="schoolTier">
                        <option value="">请选择院校层次</option>
                        <option value="tier1">985/211顶尖院校</option>
                        <option value="tier1_5">211重点院校</option>
                        <option value="tier2">一本院校</option>
                        <option value="tier3">二本/普通本科</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>是否有实习经历</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="hasInternship" value="yes"> 是
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="hasInternship" value="no"> 否
                        </label>
                    </div>
                </div>
                <div class="form-group internship-duration hidden" id="internshipGroup">
                    <label>实习段数</label>
                    <select class="form-input" id="internshipCount">
                        <option value="">请选择实习段数</option>
                        <option value="0">还没有实习</option>
                        <option value="1">1段实习</option>
                        <option value="2">2段实习</option>
                        <option value="3">3段实习</option>
                        <option value="4">4段及以上</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>已获得的专业证书数量</label>
                    <div class="slider-container">
                        <input type="range" class="slider" id="certCount" min="0" max="10" value="0">
                        <span class="slider-value" id="certCountValue">0</span>
                    </div>
                </div>
                <button class="action-btn primary large" onclick="saveProfile()">
                    保存并继续
                </button>
            </div>
        </section>

        <!-- Interview Input Section (Step 2) -->
        <section class="interview-section hidden" id="interviewSection">
            <div class="section-header">
                <h2>录入面试信息</h2>
                <span class="step-badge">2/3</span>
            </div>
            
            <!-- Interview List -->
            <div class="interview-list" id="interviewList">
                <!-- Interview cards will be added here -->
            </div>
            
            <!-- Add Interview Card -->
            <div class="add-interview-card" id="addInterviewCard">
                <button class="add-interview-btn" onclick="showAddInterviewModal()">
                    <span class="add-icon">+</span>
                    <span>添加新面试</span>
                </button>
            </div>

            <button class="action-btn primary gradient-btn" onclick="generatePrediction()">
                ✨ 生成预测结果
            </button>
        </section>

        <!-- Prediction Results Section (Step 3) -->
        <section class="prediction-section hidden" id="predictionSection">
            <div class="section-header">
                <h2>AI预测结果</h2>
                <span class="step-badge">3/3</span>
            </div>
            
            <!-- Main Prediction Card -->
            <div class="prediction-main-card">
                <div class="prediction-header">
                    <span class="ai-badge">✨ AI Powered</span>
                </div>
                <div class="prediction-summary">
                    <div class="offer-count-display">
                        <span class="offer-count" id="predictedOfferCount">0</span>
                        <span class="offer-unit">个offer</span>
                    </div>
                    <p class="prediction-text" id="predictionText">基于你的背景和面试表现，预测结果如下</p>
                </div>
            </div>

            <!-- Detailed Predictions -->
            <div class="detailed-predictions" id="detailedPredictions">
                <!-- Company predictions will be added here -->
            </div>

            <!-- Interview Analysis -->
            <div class="analysis-card">
                <h3>📈 面试表现分析</h3>
                <div class="analysis-content" id="analysisContent">
                    <!-- Analysis will be added here -->
                </div>
            </div>

            <div class="action-buttons">
                <button class="action-btn secondary" onclick="editInterviews()">
                    编辑面试记录
                </button>
                <button class="action-btn primary" onclick="startNew()">
                    开始新的预测
                </button>
            </div>
        </section>

        <!-- Dashboard View (Tab) -->
        <section class="dashboard-section hidden" id="dashboardSection">
            <div class="section-header">
                <h2>数据概览</h2>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-section">
                <div class="stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-info">
                        <span class="stat-value" id="totalInterviews">0</span>
                        <span class="stat-label">面试总数</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏢</div>
                    <div class="stat-info">
                        <span class="stat-value" id="totalCompanies">0</span>
                        <span class="stat-label">投递公司</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-info">
                        <span class="stat-value" id="avgScore">0</span>
                        <span class="stat-label">平均得分</span>
                    </div>
                </div>
            </div>

            <!-- Interview History -->
            <div class="history-section">
                <h3>面试记录</h3>
                <div class="history-list" id="historyList">
                    <!-- History items will be added here -->
                </div>
            </div>
        </section>
    `;
    
    // 填充已有数据
    populateProfileForm();
    
    // 重新设置事件监听器
    setupEventListeners();
    
    // 初始化滑块
    initSliders();
    
    // 渲染面试列表
    if (appState.interviews.length > 0) {
        renderInterviewList();
    }
}

// 填充个人资料表单
function populateProfileForm() {
    const profile = appState.profile;
    
    document.getElementById('userName').value = profile.name || '';
    document.getElementById('educationLevel').value = profile.educationLevel || '';
    document.getElementById('grade').value = profile.grade || '';
    document.getElementById('majorCategory').value = profile.majorCategory || '';
    document.getElementById('schoolTier').value = profile.schoolTier || '';
    document.getElementById('certCount').value = profile.certCount || 0;
    document.getElementById('certCountValue').textContent = profile.certCount || 0;
    
    // 设置实习单选框
    if (profile.hasInternship) {
        document.querySelector('input[name="hasInternship"][value="yes"]').checked = true;
        document.getElementById('internshipGroup').classList.remove('hidden');
        document.getElementById('internshipCount').value = profile.internshipCount || '';
    } else {
        document.querySelector('input[name="hasInternship"][value="no"]').checked = true;
    }
}

// 获取学历文本
function getEducationText(level) {
    const texts = {
        'bachelor': '本科',
        'master': '硕士',
        'phd': '博士'
    };
    return texts[level] || '未设置';
}

// 获取院校层次文本
function getSchoolTierText(tier) {
    const texts = {
        'tier1': '985/211顶尖',
        'tier1_5': '211重点',
        'tier2': '一本',
        'tier3': '普通本科'
    };
    return texts[tier] || '未设置';
}

// 保存到本地存储
function saveToStorage() {
    localStorage.setItem('offerAIState', JSON.stringify({
        profile: appState.profile,
        interviews: appState.interviews
    }));
}

// 从本地存储加载
function loadFromStorage() {
    const saved = localStorage.getItem('offerAIState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appState.profile = data.profile || appState.profile;
            appState.interviews = data.interviews || [];
        } catch (e) {
            console.error('加载数据失败:', e);
        }
    }
}

// 显示提示消息
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    if (type) {
        toast.classList.add(type);
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 导出功能供其他模块使用
window.OfferAIApp = {
    appState,
    showProfileSetup,
    saveProfile,
    showAddInterviewModal,
    saveInterview,
    deleteInterview,
    generatePrediction,
    switchTab,
    showDashboard,
    startNew
};

console.log('offerME - 春招offer预测系统已就绪');
console.log('功能: 候选人背景收集 · 面试记录录入 · AI offer预测');
