// 应用状态管理
const appState = {
    currentStep: 0, // 0: welcome, 1: profile, 2: interview, 3: prediction
    profile: {
        name: '',
        educationLevel: '',
        grade: '',
        majorCategory: '',
        schoolTier: '',
        qsRank: null, // 新增：QS排名
        isOverseas: false, // 新增：是否海外院校
        hasInternship: false,
        internshipCount: 0,
        certCount: 0
    },
    interviews: [],
    predictions: []
};

// QS排名权重映射（QS越低越好）
const qsWeights = {
    'qs_top10': 0.30,     // QS Top 10: 30分
    'qs_11_50': 0.22,     // QS 11-50: 22分
    'qs_51_100': 0.18,    // QS 51-100: 18分
    'qs_101_200': 0.12,   // QS 101-200: 12分
    'qs_201_500': 0.05,   // QS 201-500: 5分
    'qs_500_plus': 0      // QS 500+: 0分
};

// QS排名分数映射
const qsScores = {
    'qs_top10': 10,
    'qs_11_50': 30,
    'qs_51_100': 75,
    'qs_101_200': 150,
    'qs_201_500': 350,
    'qs_500_plus': 600
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

    // 海外院校切换
    const schoolTierSelect = document.getElementById('schoolTier');
    if (schoolTierSelect) {
        schoolTierSelect.addEventListener('change', (e) => {
            const qsRankGroup = document.getElementById('qsRankGroup');
            const selectedValue = e.target.value;
            
            // 检查是否选择海外院校
            const isOverseas = selectedValue && selectedValue.startsWith('qs_');
            
            if (qsRankGroup) {
                if (isOverseas) {
                    qsRankGroup.style.display = 'block';
                    // 根据选择设置默认QS排名
                    const qsRankSelect = document.getElementById('qsRank');
                    if (qsRankSelect) {
                        qsRankSelect.value = String(qsScores[selectedValue] || '');
                    }
                } else {
                    qsRankGroup.style.display = 'none';
                }
            }
        });
    }

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

    // 隐藏所有主内容区块
    const sections = ['welcomeSection', 'profileSection', 'interviewSection', 'predictionSection', 'dashboardSection', 'analysisSection'];
    sections.forEach(section => {
        const el = document.getElementById(section);
        if (el) el.classList.add('hidden');
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
        case 'analysis':
            showAnalysisSection();
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
    const qsRank = document.getElementById('qsRank')?.value ? parseInt(document.getElementById('qsRank').value) : null;
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

    // 检查海外院校是否选择了QS排名
    const isOverseas = schoolTier && schoolTier.startsWith('qs_');
    if (isOverseas && !qsRank) {
        showToast('请选择具体的QS排名', 'error');
        return;
    }

    // 保存资料
    appState.profile = {
        name,
        educationLevel,
        grade,
        majorCategory,
        schoolTier,
        qsRank,
        isOverseas,
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
    
    // 海外院校加成（基于QS排名）
    if (profile.isOverseas && profile.schoolTier) {
        score += qsWeights[profile.schoolTier] * 100 || 0;
    } else {
        score += schoolBonus[profile.schoolTier] || 0;
    }
    
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
    // 隐藏其他区块
    const sections = ['welcomeSection', 'interviewSection', 'predictionSection', 'dashboardSection', 'analysisSection'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add('hidden');
    });
    
    // 只显示 profileSection
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
        profileSection.classList.remove('hidden');
        // 填充已有数据
        populateProfileForm();
        // 重新设置事件监听器
        setupEventListeners();
        // 初始化滑块
        initSliders();
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
console.log('功能: 候选人背景收集 · 面试记录录入 · AI offer预测 · Regression分析');

// ========== Regression Analysis 功能 ==========

function showAnalysisSection() {
    document.getElementById('analysisSection').classList.remove('hidden');
    
    // 默认执行一次分析
    setTimeout(() => {
        runRegressionAnalysis();
    }, 100);
}

function runRegressionAnalysis() {
    // 生成模拟数据进行回归分析
    const data = generateRegressionData();
    
    // 绘制主回归图
    drawRegressionChart(data);
    
    // 绘制Offer获取率图表
    drawOfferRateChart(data);
    
    // 计算并显示统计指标
    calculateRegressionMetrics(data);
}

function generateRegressionData() {
    const data = {
        gpa: [],
        schoolTier: [],
        internship: [],
        offerResult: [],
        interviewScore: [],
        userGPA: null,
        userSchoolTier: null,
        userInternship: null,
        userInterviewScore: null
    };
    
    // 获取用户真实数据
    const profile = appState.profile;
    const interviews = appState.interviews;
    
    // 计算用户平均面试得分
    let userInterviewAvg = 70;
    if (interviews.length > 0) {
        userInterviewAvg = interviews.reduce((sum, i) => sum + calculateInterviewScore(i), 0) / interviews.length;
    }
    
    // 用户各项指标
    data.userInterviewScore = userInterviewAvg;
    
    // 根据院校计算用户GPA估算值
    const schoolToGPA = {
        'tier1': 3.6,
        'tier1_5': 3.4,
        'tier2': 3.2,
        'tier3': 3.0
    };
    data.userGPA = schoolToGPA[profile.schoolTier] || 3.2;
    
    // 用户院校层次值
    const schoolTierValues = {
        'tier1': 1,
        'tier1_5': 2,
        'tier2': 3,
        'tier3': 4,
        'qs_top10': 0.5,
        'qs_11_50': 1,
        'qs_51_100': 1.5,
        'qs_101_200': 2,
        'qs_201_500': 2.5,
        'qs_500_plus': 3
    };
    data.userSchoolTier = schoolTierValues[profile.schoolTier] || 3;
    
    // 用户实习值
    data.userInternship = profile.hasInternship ? Math.min(profile.internshipCount, 4) : 0;
    
    // 生成500条模拟数据 - 确保有明显的线性关系
    for (let i = 0; i < 500; i++) {
        // GPA: 2.5 - 4.0，添加趋势性
        const baseGPA = 2.5 + (i / 500) * 1.5;
        const gpa = baseGPA + (Math.random() - 0.5) * 0.3;
        data.gpa.push(Math.min(4.0, Math.max(2.5, gpa)));
        
        // 院校层次 (1-4: 越好越低)
        const baseSchool = 1 + (i / 500) * 3;
        const schoolTierVal = baseSchool + (Math.random() - 0.5) * 0.5;
        data.schoolTier.push(Math.min(4.5, Math.max(0.5, schoolTierVal)));
        
        // 实习经验 (0-4)
        const baseIntern = (i / 500) * 4;
        const internVal = baseIntern + (Math.random() - 0.5) * 1;
        data.internship.push(Math.max(0, Math.min(4, Math.round(internVal))));
        
        // 面试得分 (40-95)
        const baseScore = 40 + (i / 500) * 55;
        const scoreVal = baseScore + (Math.random() - 0.5) * 15;
        data.interviewScore.push(Math.min(100, Math.max(40, scoreVal)));
        
        // Offer结果 - 基于综合因素计算，更强的线性关系
        const g = data.gpa[i];
        const s = data.schoolTier[i];
        const intern = data.internship[i];
        const score = data.interviewScore[i];
        
        // 综合得分
        const composite = (g - 2.5) * 15 +      // GPA贡献
                          (5 - s) * 5 +           // 院校贡献（越好越高）
                          intern * 4 +            // 实习贡献
                          (score - 40) * 0.3;     // 面试得分贡献
        
        // 转换为0-1的概率
        const offerProb = 1 / (1 + Math.exp(-(composite - 75) / 15));
        
        // 添加少量噪声
        data.offerResult.push(Math.random() < offerProb ? 1 : 0);
    }
    
    return data;
}

function drawRegressionChart(data) {
    const canvas = document.getElementById('regressionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = 300;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // 分析变量选择
    const analysisVar = document.getElementById('analysisVariable')?.value || 'combined';
    
    let xData, yData, xLabel, yLabel, title, userX;
    
    switch(analysisVar) {
        case 'gpa':
            xData = data.gpa;
            yData = data.offerResult;
            xLabel = 'GPA';
            yLabel = 'Offer获取率';
            title = 'GPA vs Offer获取率回归分析';
            userX = data.userGPA;
            break;
        case 'school':
            xData = data.schoolTier;
            yData = data.offerResult;
            xLabel = '院校层次 (越小越好)';
            yLabel = 'Offer获取率';
            title = '院校层次 vs Offer获取率回归分析';
            userX = data.userSchoolTier;
            break;
        case 'internship':
            xData = data.internship;
            yData = data.offerResult;
            xLabel = '实习段数';
            yLabel = 'Offer获取率';
            title = '实习经验 vs Offer获取率回归分析';
            userX = data.userInternship;
            break;
        case 'combined':
            xData = data.interviewScore;
            yData = data.offerResult;
            xLabel = '面试得分';
            yLabel = 'Offer获取率';
            title = '面试得分 vs Offer获取率回归分析';
            userX = data.userInterviewScore;
            break;
        default:
            xData = data.gpa;
            yData = data.offerResult;
            xLabel = 'GPA';
            yLabel = 'Offer获取率';
            title = '综合因素 vs Offer获取率回归分析';
            userX = data.userGPA;
    }
    
    // 归一化x坐标
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const xRange = xMax - xMin || 1;
    
    // 计算offer获取率（滑动窗口）
    const windowSize = 50;
    const rateData = [];
    const sortedIndices = xData.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    
    for (let i = 0; i < xData.length - windowSize; i++) {
        const startIdx = sortedIndices[i].i;
        const endIdx = sortedIndices[i + windowSize].i;
        let sum = 0;
        for (let j = i; j <= i + windowSize; j++) {
            sum += yData[sortedIndices[j].i];
        }
        rateData.push({
            x: xData[sortedIndices[i].i],
            rate: sum / (windowSize + 1)
        });
    }
    
    // 绘制平滑的曲线
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < rateData.length; i++) {
        const x = padding + ((rateData[i].x - xMin) / xRange) * (width - 2 * padding);
        const y = height - padding - rateData[i].rate * (height - 2 * padding);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 绘制数据点（散点）
    for (let i = 0; i < xData.length; i++) {
        const x = padding + ((xData[i] - xMin) / xRange) * (width - 2 * padding);
        const y = height - padding - yData[i] * (height - 2 * padding);
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制用户位置标记
    if (userX !== null) {
        const userXpct = (userX - xMin) / xRange;
        const x = padding + userXpct * (width - 2 * padding);
        
        // 用户综合得分对应的offer率
        const userComposite = calculateProfileScore(appState.profile);
        const userRate = userComposite / 100;
        const y = height - padding - userRate * (height - 2 * padding);
        
        // 绘制用户标记
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制虚线
        ctx.strokeStyle = '#e74c3c';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 标注文字
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('你的位置', x, y - 18);
    }
    
    // 绘制坐标轴
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
    
    // 绘制标题
    ctx.font = 'bold 16px Arial';
    ctx.fillText(title, width / 2, 25);
    
    // 计算并显示回归方程
    const regression = calculateLinearRegression(xData, yData);
    const equation = `${xLabel}每增加1个单位，Offer获取率${regression.slope > 0 ? '提高' : '降低'}${Math.abs(regression.slope * 100).toFixed(1)}%`;
    document.getElementById('regressionEquation').textContent = equation;
}

function calculateLinearRegression(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
}

function drawOfferRateChart(data) {
    const canvas = document.getElementById('offerRateChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = 250;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 计算各因素区间的Offer率 - 使用面试得分分组
    const scoreRanges = [
        { label: '40-50', min: 40, max: 50 },
        { label: '50-60', min: 50, max: 60 },
        { label: '60-70', min: 60, max: 70 },
        { label: '70-80', min: 70, max: 80 },
        { label: '80-100', min: 80, max: 100 }
    ];
    
    const offerRates = scoreRanges.map(range => {
        const filtered = data.interviewScore.map((s, i) => s >= range.min && s < range.max ? data.offerResult[i] : null).filter(v => v !== null);
        return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
    });
    
    const barWidth = (width - 2 * padding) / offerRates.length - 30;
    const barSpacing = 30;
    
    // 绘制标题
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('不同面试得分区间的Offer获取率', width / 2, 25);
    
    // 绘制条形
    offerRates.forEach((rate, i) => {
        const x = padding + i * (barWidth + barSpacing);
        const barHeight = rate * (height - 2 * padding);
        const y = height - padding - barHeight;
        
        // 渐变色
        const gradient = ctx.createLinearGradient(x, y, x, height - padding);
        gradient.addColorStop(0, rate > 0.5 ? '#27ae60' : rate > 0.3 ? '#f39c12' : '#e74c3c');
        gradient.addColorStop(1, rate > 0.5 ? '#2ecc71' : rate > 0.3 ? '#f1c40f' : '#e67e22');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 显示百分比
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`${(rate * 100).toFixed(0)}%`, x + barWidth / 2, y - 5);
        
        // 显示标签
        ctx.font = '11px Arial';
        ctx.fillText(scoreRanges[i].label, x + barWidth / 2, height - padding + 15);
    });
    
    // 绘制用户面试得分标记
    if (data.userInterviewScore) {
        // 找到用户所在的区间
        let userRangeIndex = scoreRanges.findIndex(r => data.userInterviewScore >= r.min && data.userInterviewScore < r.max);
        if (userRangeIndex === -1) userRangeIndex = scoreRanges.length - 1;
        
        const userX = padding + userRangeIndex * (barWidth + barSpacing) + barWidth / 2;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(userX, padding);
        ctx.lineTo(userX, height - padding);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('你的得分', userX, padding - 5);
    }
    
    // 绘制基线
    ctx.strokeStyle = '#ddd';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - 0.5 * (height - 2 * padding));
    ctx.lineTo(width - padding, height - padding - 0.5 * (height - 2 * padding));
    ctx.stroke();
    ctx.setLineDash([]);
}

function calculateRegressionMetrics(data) {
    // 获取分析变量选择
    const analysisVar = document.getElementById('analysisVariable')?.value || 'combined';
    
    let xData;
    switch(analysisVar) {
        case 'gpa': xData = data.gpa; break;
        case 'school': xData = data.schoolTier; break;
        case 'internship': xData = data.internship; break;
        default: xData = data.interviewScore;
    }
    
    // 计算相关系数
    const correlation = calculateCorrelation(xData, data.offerResult);
    document.getElementById('correlationValue').textContent = correlation.toFixed(4);
    
    // R² 计算
    const r2 = calculateR2(xData, data.offerResult);
    document.getElementById('r2Score').textContent = r2.toFixed(4);
    
    // RMSE 计算
    const rmse = calculateRMSE(xData, data.offerResult);
    document.getElementById('rmseValue').textContent = rmse.toFixed(4);
    
    // 更新解读
    const profile = appState.profile;
    let interpretation = '';
    
    // 基于用户背景给出个性化解读
    const profileScore = calculateProfileScore(profile);
    
    if (profileScore >= 75) {
        interpretation = '根据你的背景分析，你具备较强的竞争力！';
    } else if (profileScore >= 60) {
        interpretation = '你的背景具备一定竞争力，继续保持优势。';
    } else {
        interpretation = '建议提升面试表现和实习经历以增强竞争力。';
    }
    
    // 添加具体因素分析
    const analysisVarText = {
        'gpa': 'GPA',
        'school': '院校层次',
        'internship': '实习经验',
        'combined': '面试得分'
    };
    
    if (correlation > 0.5) {
        interpretation += `\n\n${analysisVarText[analysisVar]}与Offer获取呈明显正相关，每提升一个等级，Offer获取率约提高${(Math.abs(correlation) * 15).toFixed(0)}%。`;
    } else if (correlation > 0.2) {
        interpretation += `\n\n${analysisVarText[analysisVar]}对Offer获取有一定影响，但不是决定性因素。`;
    } else {
        interpretation += `\n\n${analysisVarText[analysisVar]}与Offer获取的相关性较弱，其他因素可能更重要。`;
    }
    
    // 添加院校信息
    if (profile.isOverseas) {
        const qsText = {
            'qs_top10': 'Top 10',
            'qs_11_50': '11-50',
            'qs_51_100': '51-100',
            'qs_101_200': '101-200',
            'qs_201_500': '201-500',
            'qs_500_plus': '500+'
        };
        interpretation += `\n\n你的海外院校背景（QS ${qsText[profile.schoolTier]}）对申请有显著加成。`;
    }
    
    document.getElementById('interpretationText').textContent = interpretation;
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function calculateR2(x, y) {
    const regression = calculateLinearRegression(x, y);
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < x.length; i++) {
        const yPred = regression.slope * x[i] + regression.intercept;
        ssTot += Math.pow(y[i] - yMean, 2);
        ssRes += Math.pow(y[i] - yPred, 2);
    }
    
    return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

function calculateRMSE(x, y) {
    const regression = calculateLinearRegression(x, y);
    
    let mse = 0;
    for (let i = 0; i < x.length; i++) {
        const yPred = regression.slope * x[i] + regression.intercept;
        mse += Math.pow(y[i] - yPred, 2);
    }
    
    return Math.sqrt(mse / x.length);
}

// 更新 populateProfileForm 函数以支持QS排名
const originalPopulateProfileForm = populateProfileForm;
populateProfileForm = function() {
    originalPopulateProfileForm();
    
    const profile = appState.profile;
    
    // 如果是海外院校，显示QS排名选择
    if (profile.isOverseas && profile.schoolTier) {
        const qsRankGroup = document.getElementById('qsRankGroup');
        const qsRankSelect = document.getElementById('qsRank');
        if (qsRankGroup && qsRankSelect) {
            qsRankGroup.style.display = 'block';
            qsRankSelect.value = profile.qsRank || '';
        }
    }
};

// 更新 startNew 函数
const originalStartNew = startNew;
startNew = function() {
    originalStartNew();
    appState.profile.qsRank = null;
    appState.profile.isOverseas = false;
};
