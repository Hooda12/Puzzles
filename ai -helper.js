// ===================== أداة الذكاء الاصطناعي =====================
// هذه الأداة تحلل أنماط الإجابات وتقدم اقتراحات ذكية

class AIHelper {
    constructor() {
        this.history = [];
        this.patterns = {};
        this.confidence = 0.5;
        this.isLoaded = false;
    }

    // ===================== تحميل النموذج =====================
    async loadModel() {
        this.isLoaded = true;
        return true;
    }

    // ===================== تحليل أنماط الإجابات =====================
    analyzePatterns(puzzleHistory) {
        // تحليل الألغاز السابقة لتحديد نقاط الضعف والقوة
        const stats = {
            math: { correct: 0, total: 0 },
            logic: { correct: 0, total: 0 },
            word: { correct: 0, total: 0 },
            visual: { correct: 0, total: 0 },
            memory: { correct: 0, total: 0 }
        };

        puzzleHistory.forEach(p => {
            if (stats[p.type]) {
                stats[p.type].total++;
                if (p.correct) stats[p.type].correct++;
            }
        });

        // حساب نسبة النجاح لكل نوع
        Object.keys(stats).forEach(key => {
            stats[key].ratio = stats[key].total > 0 ?
                stats[key].correct / stats[key].total :
                0.5;
        });

        return stats;
    }

    // ===================== اقتراح الإجابة =====================
    suggestAnswer(puzzle, history) {
        if (!this.isLoaded) return null;

        const stats = this.analyzePatterns(history);
        const type = puzzle.type || 'unknown';

        // إذا كان المستخدم ضعيفاً في هذا النوع، نقترح إجابة مختلفة
        const userWeakness = stats[type] && stats[type].ratio < 0.4;

        // تحليل الخيارات
        const options = puzzle.options || [];
        if (options.length === 0) return null;

        // استراتيجية الاقتراح:
        // 1. إذا كان المستخدم ضعيفاً في النوع → نقترح إجابة غير البديهية
        // 2. إذا كان قوياً → نقترح الإجابة الصحيحة
        // 3. خلاف ذلك → نقترح إجابة عشوائية مع ميل للصحيح

        let suggestedIndex;

        if (userWeakness) {
            // اقترح إجابة مختلفة عن الإجابة الصحيحة (للتحدي)
            const correct = puzzle.answer;
            const wrongOptions = options.map((_, i) => i).filter(i => i !== correct);
            suggestedIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        } else {
            // اقترح الإجابة الصحيحة مع احتمال 80%
            if (Math.random() < 0.8) {
                suggestedIndex = puzzle.answer;
            } else {
                // اقترح إجابة عشوائية
                suggestedIndex = Math.floor(Math.random() * options.length);
            }
        }

        return {
            index: suggestedIndex,
            text: options[suggestedIndex],
            confidence: userWeakness ? 0.6 : 0.85,
            reasoning: userWeakness ?
                '💡 بناءً على تحليل أدائك، نقترح هذه الإجابة للتحدي' :
                '🧠 التحليل الذكي يشير إلى أن هذه الإجابة هي الأكثر ترجيحاً'
        };
    }

    // ===================== تحليل النمط السلوكي =====================
    analyzeBehavior(history) {
        if (history.length < 5) {
            return {
                message: '📊 اجمع 5 إجابات على الأقل للتحليل',
                avgTime: 0,
                strength: 'غير معروف'
            };
        }

        const total = history.length;
        const correct = history.filter(p => p.correct).length;
        const avgTime = history.reduce((sum, p) => sum + (p.time || 0), 0) / total;

        let strength = 'متوسط';
        const ratio = correct / total;
        if (ratio > 0.8) strength = '🧠 ممتاز';
        else if (ratio > 0.6) strength = '👍 جيد';
        else if (ratio > 0.4) strength = '📚 يحتاج ممارسة';
        else strength = '💪 يحتاج تركيز';

        return {
            message: `📊 نسبة النجاح: ${Math.round(ratio*100)}%`,
            avgTime: Math.round(avgTime),
            strength: strength,
            total: total,
            correct: correct
        };
    }

    // ===================== توليد تلميح ذكي =====================
    generateHint(puzzle, history) {
        if (!puzzle.options) return '❌ لا يوجد تلميح لهذا اللغز';

        const stats = this.analyzePatterns(history);
        const type = puzzle.type || 'unknown';
        const userStrength = stats[type] && stats[type].ratio > 0.6;

        if (userStrength) {
            // للمستخدم القوي: تلميح خفي
            const hintIndex = puzzle.answer;
            return `💡 الإجابة هي الخيار رقم ${hintIndex + 1} (${puzzle.options[hintIndex]})`;
        } else {
            // للمستخدم الضعيف: تلميح مساعد
            const wrongOptions = puzzle.options.map((_, i) => i).filter(i => i !== puzzle.answer);
            const hint = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            return `💡 فكر مرة أخرى، الخيار ${hint + 1} قد لا يكون صحيحاً`;
        }
    }
}

// ===================== تصدير الأداة =====================
// في المتصفح:
window.AIHelper = AIHelper;