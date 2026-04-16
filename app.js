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

    // 隐藏所有区块
    const sections = ['welcomeSection', 'profileSection', 'interviewSection', 'predictionSection', 'dashboardSection', 'analysisSection'];
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
                        <optgroup label="🇨🇳 国内院校">
                            <option value="tier1">985/211顶尖院校</option>
                            <option value="tier1_5">211重点院校</option>
                            <option value="tier2">一本院校</option>
                            <option value="tier3">二本/普通本科</option>
                        </optgroup>
                        <optgroup label="🌍 海外院校">
                            <option value="qs_top10">海外 QS Top 10</option>
                            <option value="qs_11_50">海外 QS 11-50</option>
                            <option value="qs_51_100">海外 QS 51-100</option>
                            <option value="qs_101_200">海外 QS 101-200</option>
                            <option value="qs_201_500">海外 QS 201-500</option>
                            <option value="qs_500_plus">海外 QS 500+</option>
                        </optgroup>
                    </select>
                </div>
                <div class="form-group" id="qsRankGroup" style="display: none;">
                    <label>QS排名</label>
                    <select class="form-input" id="qsRank">
                        <option value="">请选择具体QS排名</option>
                        <option value="5">QS 1-10</option>
                        <option value="30">QS 11-50</option>
                        <option value="75">QS 51-100</option>
                        <option value="150">QS 101-200</option>
                        <option value="350">QS 201-500</option>
                        <option value="600">QS 500+</option>
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
        qsRank: []
    };
    
    // 基于用户数据生成相关数据点
    const profile = appState.profile;
    
    // 生成200条模拟数据
    for (let i = 0; i < 200; i++) {
        // GPA: 2.5 - 4.0
        const gpa = 2.5 + Math.random() * 1.5;
        data.gpa.push(gpa);
        
        // 院校层次 (0-3: 国内, 4-9: 海外)
        const schoolTierVal = profile.isOverseas ? 4 + Math.random() * 5 : Math.random() * 3;
        data.schoolTier.push(schoolTierVal);
        
        // 实习经验 (0-4)
        const internshipVal = profile.hasInternship ? 
            Math.min(profile.internshipCount, 4) + (Math.random() - 0.5) * 2 : 
            Math.random() * 2;
        data.internship.push(Math.max(0, Math.min(4, Math.round(internshipVal))));
        
        // QS排名
        const qsVal = profile.qsRank || 200;
        data.qsRank.push(qsVal + (Math.random() - 0.5) * 100);
        
        // Offer结果 (基于因素计算)
        let offerProb = 0;
        offerProb += (gpa - 2.5) * 0.2; // GPA影响
        offerProb += data.schoolTier[i] * 0.05; // 院校影响
        offerProb += data.internship[i] * 0.1; // 实习影响
        offerProb -= data.qsRank[i] * 0.0003; // QS排名影响
        
        offerProb += Math.random() * 0.3 - 0.15; // 随机噪声
        
        data.offerResult.push(offerProb > 0.5 ? 1 : 0);
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
    
    // 绘制数据点
    const analysisVar = document.getElementById('analysisVariable')?.value || 'gpa';
    
    let xData, yData, xLabel, yLabel, title;
    
    switch(analysisVar) {
        case 'gpa':
            xData = data.gpa;
            yData = data.offerResult;
            xLabel = 'GPA';
            yLabel = 'Offer获取';
            title = 'GPA vs Offer获取率回归分析';
            break;
        case 'school':
            xData = data.schoolTier;
            yData = data.offerResult;
            xLabel = '院校层次';
            yLabel = 'Offer获取';
            title = '院校层次 vs Offer获取率回归分析';
            break;
        case 'internship':
            xData = data.internship;
            yData = data.offerResult;
            xLabel = '实习经验';
            yLabel = 'Offer获取';
            title = '实习经验 vs Offer获取率回归分析';
            break;
        default:
            xData = data.gpa;
            yData = data.offerResult;
            xLabel = '综合评分';
            yLabel = 'Offer获取';
            title = '综合因素 vs Offer获取率回归分析';
    }
    
    // 归一化x坐标
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const xRange = xMax - xMin || 1;
    
    // 绘制散点
    ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
    for (let i = 0; i < xData.length; i++) {
        const x = padding + ((xData[i] - xMin) / xRange) * (width - 2 * padding);
        const y = height - padding - yData[i] * (height - 2 * padding);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 计算线性回归
    const regression = calculateLinearRegression(xData, yData);
    
    // 绘制回归线
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const x1 = padding;
    const y1 = height - padding - regression.slope * ((xMin) * (height - 2 * padding) / xRange) - regression.intercept * (height - 2 * padding);
    const x2 = width - padding;
    const y2 = height - padding - regression.slope * ((xMax) * (height - 2 * padding) / xRange) - regression.intercept * (height - 2 * padding);
    
    ctx.moveTo(padding, height - padding - ((regression.slope * xMin + regression.intercept) * (height - 2 * padding)));
    ctx.lineTo(width - padding, height - padding - ((regression.slope * xMax + regression.intercept) * (height - 2 * padding)));
    ctx.stroke();
    
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
    
    // 更新回归方程显示
    const equation = `Offer = ${regression.slope.toFixed(4)} × ${xLabel} + ${regression.intercept.toFixed(4)}`;
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
    
    // 计算各因素区间的Offer率
    const gpaRanges = [
        { label: '2.5-2.8', min: 2.5, max: 2.8 },
        { label: '2.8-3.2', min: 2.8, max: 3.2 },
        { label: '3.2-3.5', min: 3.2, max: 3.5 },
        { label: '3.5-3.8', min: 3.5, max: 3.8 },
        { label: '3.8-4.0', min: 3.8, max: 4.0 }
    ];
    
    const offerRates = gpaRanges.map(range => {
        const filtered = data.gpa.map((g, i) => g >= range.min && g < range.max ? data.offerResult[i] : null).filter(v => v !== null);
        return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
    });
    
    const barWidth = (width - 2 * padding) / offerRates.length - 20;
    const barSpacing = 20;
    
    // 绘制标题
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('不同GPA区间的Offer获取率', width / 2, 25);
    
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
        ctx.fillText(`${(rate * 100).toFixed(1)}%`, x + barWidth / 2, y - 5);
        
        // 显示标签
        ctx.font = '11px Arial';
        ctx.fillText(gpaRanges[i].label, x + barWidth / 2, height - padding + 15);
    });
    
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
    // 计算相关系数
    const n = data.gpa.length;
    
    // GPA vs Offer 相关系数
    const gpaCorrelation = calculateCorrelation(data.gpa, data.offerResult);
    document.getElementById('correlationValue').textContent = gpaCorrelation.toFixed(4);
    
    // R² 计算
    const gpaR2 = calculateR2(data.gpa, data.offerResult);
    document.getElementById('r2Score').textContent = gpaR2.toFixed(4);
    
    // RMSE 计算
    const rmse = calculateRMSE(data.gpa, data.offerResult);
    document.getElementById('rmseValue').textContent = rmse.toFixed(4);
    
    // 更新解读
    let interpretation = '';
    
    if (gpaCorrelation > 0.5) {
        interpretation = `GPA与Offer获取呈正相关（r=${gpaCorrelation.toFixed(2)}），GPA越高获得Offer的概率越大。建议保持良好成绩。`;
    } else if (gpaCorrelation > 0.2) {
        interpretation = `GPA对Offer有一定正向影响，但不是决定性因素。除GPA外，实习经验、面试表现等也很重要。`;
    } else {
        interpretation = `GPA与Offer获取的相关性较弱。院校背景、实习经历、面试表现等因素可能更重要。`;
    }
    
    if (appState.profile.isOverseas) {
        interpretation += `你的海外院校背景（QS ${appState.profile.qsRank}）对申请有一定加成。`;
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
