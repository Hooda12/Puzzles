// ===================== بنك الألغاز =====================
const PUZZLE_BANK = [
    // 🧮 ألغاز رياضيات
    { type: 'math', title: '🧮 سرعة الرياضيات', question: '7 × 8 = ؟', options: ['48', '56', '64', '72'], answer: 1 },
    { type: 'math', title: '🧮 سرعة الرياضيات', question: '144 ÷ 12 = ؟', options: ['10', '11', '12', '14'], answer: 2 },
    { type: 'math', title: '🧮 سرعة الرياضيات', question: '25 + 37 = ؟', options: ['52', '62', '72', '82'], answer: 1 },
    { type: 'math', title: '🧮 سرعة الرياضيات', question: '9 × 9 = ؟', options: ['72', '81', '88', '99'], answer: 1 },
    // 🧩 ألغاز منطقية
    { type: 'logic', title: '🧩 اللغز المنطقي', question: 'أي رقم هو الغريب؟', options: ['2', '4', '6', '9'], answer: 3 },
    { type: 'logic', title: '🧩 اللغز المنطقي', question: 'أي كلمة مختلفة؟', options: ['تفاحة', 'موز', 'جزر', 'برتقال'], answer: 2 },
    // 📝 ألغاز كلمات
    { type: 'word', title: '📝 أكمل المثل', question: 'الجار قبل ...', options: ['الدار', 'الناس', 'الأقارب', 'الصديق'], answer: 0 },
    { type: 'word', title: '📝 أكمل المثل', question: 'الصبر مفتاح ...', options: ['النجاح', 'الفرج', 'العمل', 'الحياة'], answer: 1 },
    // 🖼️ ألغاز ذاكرة
    { type: 'visual', title: '🖼️ الذاكرة البصرية', question: 'كم عدد المثلثات؟', options: ['3', '5', '7', '9'], answer: 2 },
    { type: 'memory', title: '🔦 تذكر الأضواء', question: '🔴🔵🔴🔵🔴 أي النمط صحيح؟', options: ['🔵🔴🔵🔴🔵', '🔴🔵🔴🔵🔴', '🔴🔴🔵🔵🔴', '🔵🔵🔴🔴🔵'], answer: 1 },
];

function shufflePuzzles() {
    for (let i = PUZZLE_BANK.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [PUZZLE_BANK[i], PUZZLE_BANK[j]] = [PUZZLE_BANK[j], PUZZLE_BANK[i]];
    }
  }
