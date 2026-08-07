// ===================== حالة اللعبة =====================
let currentPuzzle = 0;
let score = 0;
let stars = 0;
let level = 1;
let hints = 3;
let timer = 10;
let timerInterval = null;
let isPlaying = false;
let isAnswered = false;
let comboCount = 0;
let puzzleHistory = [];

// تهيئة أداة الذكاء الاصطناعي
const aiHelper = new AIHelper();
let aiLoaded = false;

// عناصر DOM
const puzzleTitle = document.getElementById('puzzleTitle');
const puzzleContent = document.getElementById('puzzleContent');
const optionsEl = document.getElementById('options');
const timerFill = document.getElementById('timerFill');
const message = document.getElementById('message');
const scoreDisplay = document.getElementById('scoreDisplay');
const starsDisplay = document.getElementById('starsDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const hintDisplay = document.getElementById('hintDisplay');
const aiStatus = document.getElementById('aiStatus');
const nextBtn = document.getElementById('nextBtn');
const hintBtn = document.getElementById('hintBtn');
const aiHintBtn = document.getElementById('aiHintBtn');
const comboDisplay = document.getElementById('comboDisplay');

// ===================== تحميل الذكاء الاصطناعي =====================
async function loadAI() {
    aiStatus.textContent = '⏳ تحميل...';
    try {
        await aiHelper.loadModel();
        aiLoaded = true;
        aiStatus.textContent = '✅ جاهز';
        aiStatus.style.color = '#00ff88';
    } catch (e) {
        aiStatus.textContent = '❌';
        aiStatus.style.color = '#ff4444';
        console.warn('AI not available');
    }
}

// ===================== المؤثرات الصوتية =====================
function playSound(type) {
    try {
        const ctx = new(window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (type === 'correct') {
            osc.frequency.value = 523;
            gain.gain.value = 0.1;
            osc.start();
            setTimeout(() => { osc.frequency.value = 659; }, 100);
            setTimeout(() => { osc.frequency.value = 784; }, 200);
            setTimeout(() => { gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); }, 250);
            setTimeout(() => { osc.stop(); }, 350);
        } else if (type === 'wrong') {
            osc.frequency.value = 300;
            osc.type = 'sawtooth';
            gain.gain.value = 0.08;
            osc.start();
            setTimeout(() => { gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); }, 200);
            setTimeout(() => { osc.stop(); }, 350);
        } else if (type === 'levelup') {
            [523, 659, 784, 1047].forEach((freq, i) => {
                setTimeout(() => {
                    const o2 = ctx.createOscillator();
                    const g2 = ctx.createGain();
                    o2.connect(g2);
                    g2.connect(ctx.destination);
                    o2.frequency.value = freq;
                    g2.gain.value = 0.08;
                    o2.start();
                    setTimeout(() => { g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); }, 150);
                    setTimeout(() => { o2.stop(); }, 250);
                }, i * 150);
            });
        }
    } catch (e) {}
}

// ===================== عرض الإشعارات =====================
function showCombo(text) {
    comboDisplay.textContent = text;
    comboDisplay.style.opacity = 1;
    comboDisplay.style.transform = 'translateX(-50%) scale(1.3)';
    setTimeout(() => {
        comboDisplay.style.opacity = 0;
        comboDisplay.style.transform = 'translateX(-50%) scale(0.8)';
    }, 500);
}

// ===================== بدء اللغز =====================
function loadPuzzle(index) {
    if (index >= PUZZLE_BANK.length) {
        message.textContent = '🎉 أكملت جميع الألغاز! اضغط "التالي" للعب مجدداً';
        puzzleTitle.textContent = '🏆 مبروك!';
        puzzleContent.textContent = 'أنت عبقري اليوم!';
        optionsEl.innerHTML = '';
        clearInterval(timerInterval);
        return;
    }

    const puzzle = PUZZLE_BANK[index];
    puzzleTitle.textContent = `${puzzle.title} (${index+1}/${PUZZLE_BANK.length})`;
    puzzleContent.textContent = puzzle.question;

    // عرض الخيارات
    showOptions(puzzle.options, puzzle.answer);

    // إعادة المؤقت
    timer = 10 + (level * 2);
    timerFill.style.width = '100%';
    isAnswered = false;
    isPlaying = true;
    startTimer();
    updateUI();
    message.textContent = '⏱️ أجب بسرعة!';

    // تنظيف اقتراحات الذكاء الاصطناعي
    document.querySelectorAll('.option.ai-suggest').forEach(el => el.classList.remove('ai-suggest'));
}

// ===================== عرض الخيارات =====================
function showOptions(options, correctIndex) {
    optionsEl.innerHTML = '';
    options.forEach((opt, i) => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.textContent = opt;
        btn.dataset.index = i;
        btn.addEventListener('click', () => handleAnswer(i, correctIndex, btn));
        optionsEl.appendChild(btn);
    });
}

// ===================== معالجة الإجابة =====================
function handleAnswer(selected, correct, element) {
    if (isAnswered || !isPlaying) return;
    isAnswered = true;
    clearInterval(timerInterval);

    const allOptions = document.querySelectorAll('.option');
    const timeTaken = (10 + level * 2) - timer;

    if (selected === correct) {
        element.classList.add('correct');
        playSound('correct');
        const bonus = Math.ceil(timer / 3);
        const points = 10 + bonus;
        score += points;
        stars += 1;
        comboCount++;
        if (comboCount >= 3) {
            showCombo(`🔥 كومبو x${comboCount}!`);
            score += 5;
        }
        message.textContent = `✅ صحيح! +${points} نقطة (بونس ${bonus})`;

        // تسجيل في التاريخ
        puzzleHistory.push({
            type: PUZZLE_BANK[currentPuzzle].type || 'unknown',
            correct: true,
            time: timeTaken
        });

        if (stars >= 5) {
            levelUp();
        }
    } else {
        element.classList.add('wrong');
        playSound('wrong');
        allOptions[correct].classList.add('correct');
        message.textContent = '❌ خطأ! الإجابة الصحيحة مُظللة';
        comboCount = 0;

        puzzleHistory.push({
            type: PUZZLE_BANK[currentPuzzle].type || 'unknown',
            correct: false,
            time: timeTaken
        });
    }

    allOptions.forEach(opt => opt.style.pointerEvents = 'none');
    updateUI();
    isPlaying = false;
}

// ===================== المستوى الجديد =====================
function levelUp() {
    level++;
    stars = 0;
    hints = Math.min(hints + 2, 10);
    playSound('levelup');
    showCombo(`⭐ مستوى ${level}!`);
    message.textContent = `🎉 مستوى ${level}! تم تحديث الألغاز`;
    shufflePuzzles();
    currentPuzzle = 0;
    loadPuzzle(currentPuzzle);
}

// ===================== المؤقت =====================
function startTimer() {
    clearInterval(timerInterval);
    timer = 10 + (level * 2);
    timerFill.style.width = '100%';
    timerInterval = setInterval(() => {
        timer -= 0.1;
        const percent = (timer / (10 + level * 2)) * 100;
        timerFill.style.width = Math.max(0, percent) + '%';
        if (timer <= 0) {
            clearInterval(timerInterval);
            if (!isAnswered) {
                message.textContent = '⏰ انتهى الوقت! اضغط "التالي"';
                isPlaying = false;
                const puzzle = PUZZLE_BANK[currentPuzzle];
                if (puzzle.options) {
                    document.querySelectorAll('.option')[puzzle.answer]?.classList.add('correct');
                }
                comboCount = 0;
                puzzleHistory.push({
                    type: puzzle.type || 'unknown',
                    correct: false,
                    time: (10 + level * 2)
                });
            }
        }
    }, 100);
}

// ===================== أداة التلميح =====================
document.getElementById('hintBtn').addEventListener('click', () => {
    if (hints <= 0) { message.textContent = '⚠️ لا يوجد تلميحات!'; return; }
    if (isAnswered || !isPlaying) { message.textContent = '⚠️ أجب على اللغز أولاً!'; return; }

    const puzzle = PUZZLE_BANK[currentPuzzle];
    if (!puzzle.options) { message.textContent = '💡 لا يوجد تلميح لهذا اللغز'; return; }

    hints--;
    const options = document.querySelectorAll('.option');
    options[puzzle.answer]?.classList.add('hint');
    setTimeout(() => {
        options[puzzle.answer]?.classList.remove('hint');
    }, 2000);
    message.textContent = '💡 الخيار المضاء هو الإجابة!';
    updateUI();
});

// ===================== أداة الذكاء الاصطناعي =====================
document.getElementById('aiHintBtn').addEventListener('click', async () => {
    if (!aiLoaded) {
        message.textContent = '⏳ جاري تحميل الذكاء الاصطناعي...';
        await loadAI();
        if (!aiLoaded) {
            message.textContent = '❌ فشل تحميل الذكاء الاصطناعي';
            return;
        }
    }

    if (isAnswered || !isPlaying) {
        message.textContent = '⚠️ أجب على اللغز أولاً!';
        return;
    }

    const puzzle = PUZZLE_BANK[currentPuzzle];
    if (!puzzle.options) {
        message.textContent = '❌ لا يمكن للذكاء الاصطناعي تحليل هذا اللغز';
        return;
    }

    // استخدام الذكاء الاصطناعي لاقتراح إجابة
    const suggestion = aiHelper.suggestAnswer(puzzle, puzzleHistory);

    if (!suggestion) {
        message.textContent = '❌ الذكاء الاصطناعي عاجز عن التحليل حالياً';
        return;
    }

    // عرض الاقتراح
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('ai-suggest'));
    options[suggestion.index]?.classList.add('ai-suggest');

    message.textContent = `🤖 ${suggestion.reasoning} (ثقة: ${Math.round(suggestion.confidence*100)}%)`;

    // اهتزاز الخيار المقترح
    const suggestedEl = options[suggestion.index];
    if (suggestedEl) {
        suggestedEl.style.animation = 'none';
        setTimeout(() => {
            suggestedEl.style.animation = 'pulse 0.5s infinite alternate';
        }, 10);
        setTimeout(() => {
            suggestedEl.style.animation = '';
        }, 3000);
    }
});

// ===================== الزر التالي =====================
document.getElementById('nextBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    if (currentPuzzle < PUZZLE_BANK.length - 1) {
        currentPuzzle++;
        loadPuzzle(currentPuzzle);
    } else {
        // عرض إحصائيات الذكاء الاصطناعي
        const analysis = aiHelper.analyzeBehavior(puzzleHistory);
        message.textContent = `📊 ${analysis.message} | القوة: ${analysis.strength}`;
        showCombo('🏁 نهاية الجولة!');

        // إعادة التشغيل
        setTimeout(() => {
            shufflePuzzles();
            currentPuzzle = 0;
            score = 0;
            stars = 0;
            level = 1;
            hints = 3;
            comboCount = 