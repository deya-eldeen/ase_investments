import { useMemo, useState } from 'react';

const MATERIALS_CATALOG = [
  // =================== المخرجات والمنتجات النهائية ===================
  {
    id: 'phosphate-rock',
    type: 'output',
    name: 'صخر الفوسفات الخام',
    code: 'Phosphate Rock',
    grade: '68% - 70% BPL',
    category: 'منتجات التعدين الخام',
    unit: 'دولار / طن (FOB)',
    benchmark: 'سعر الفوسفات المعياري (عالمي)',
    description: 'المنتج التعديني الأساسي المستخرج من مناجم الشيدية والحسا والأبيض، والمغذي لكافة مصانع الأسمدة.',
    accent: '#27caa7'
  },
  {
    id: 'dap-fertilizer',
    type: 'output',
    name: 'سماد الداب (DAP)',
    code: 'Diammonium Phosphate',
    grade: '18-46-0 NPK',
    category: 'أسمدة فوسفاتية نهائية',
    unit: 'دولار / طن (FOB)',
    benchmark: 'السعر العالمي لسماد الداب',
    description: 'أهم منتج سمادي تصديري للشركة والمجمعات الصناعية والشراكات المشتركة في العقبة والجنوب.',
    accent: '#27caa7'
  },
  {
    id: 'phosphoric-acid',
    type: 'output',
    name: 'حامض الفوسفوريك',
    code: 'Phosphoric Acid',
    grade: 'Merchant Grade (54% P2O5)',
    category: 'صناعات وسيطة وتحويلية',
    unit: 'دولار / طن P2O5',
    benchmark: 'سعر عقود الهند الدورية (CFR)',
    description: 'المادة الاستراتيجية الأعلى قيمة، ومحور اتفاقيات التزويد طويلة الأجل للشراكات مع الهند واليابان.',
    accent: '#27caa7'
  },
  {
    id: 'map-fertilizer',
    type: 'output',
    name: 'سماد الماب (MAP)',
    code: 'Monoammonium Phosphate',
    grade: '11-52-0 NPK',
    category: 'أسمدة فوسفاتية نهائية',
    unit: 'دولار / طن (FOB)',
    benchmark: 'المؤشر العالمي لسماد الماب',
    description: 'سماد عالي النقاء وسريع الامتصاص مطلوب في الأسواق الزراعية المتطورة ونظم الري الحديثة.',
    accent: '#27caa7'
  },
  {
    id: 'aluminum-fluoride',
    type: 'output',
    name: 'فلوريد الألمنيوم (AlF3)',
    code: 'Aluminum Fluoride',
    grade: 'Industrial Grade (90%+)',
    category: 'كيماويات متخصصة',
    unit: 'دولار / طن',
    benchmark: 'أسعار مصاهر الألمنيوم الإقليمية',
    description: 'يُنتج باستغلال غازات الفلور المنبعثة من مصانع الحامض بالتعاون مع مصانع تدوير الفلورين.',
    accent: '#27caa7'
  },
  {
    id: 'sulfuric-acid',
    type: 'output',
    name: 'حامض الكبريتيك',
    code: 'Sulfuric Acid',
    grade: 'Industrial 98.5% H2SO4',
    category: 'صناعات وسيطة',
    unit: 'دولار / طن',
    benchmark: 'سعر حامض الكبريتيك الصب',
    description: 'يُنتج محلياً بكميات ضخمة في المجمع الصناعي لاستخدامه في معالجة وإذابة الفوسفات لإنتاج الحامض.',
    accent: '#27caa7'
  },

  // =================== مدخلات الإنتاج والمواد الخام ===================
  {
    id: 'sulfur',
    type: 'input',
    name: 'الكبريت الصلب والسائل',
    code: 'Granular / Molten Sulfur',
    grade: 'Purity 99.5%+',
    category: 'مواد خام استراتيجية',
    unit: 'دولار / طن (CFR العقبة)',
    benchmark: 'مؤشر كبريت الشرق الأوسط',
    description: 'المدخل الأساسي لمصانع حامض الكبريتيك، ويشكل العامل الأكبر في تحديد تكلفة طن سماد الداب.',
    accent: '#eeb763'
  },
  {
    id: 'ammonia',
    type: 'input',
    name: 'الأمونيا اللامائية (NH3)',
    code: 'Anhydrous Ammonia',
    grade: 'Cold Refrigerated 99.5%',
    category: 'مواد خام استراتيجية',
    unit: 'دولار / طن (CFR العقبة)',
    benchmark: 'سعر الأمونيا - الخليج العربي',
    description: 'المصدر النيتروجيني الحرج الداخل في تفاعل إنتاج أسمدة الفوسفات المركبة (DAP / MAP).',
    accent: '#eeb763'
  },
  {
    id: 'natural-gas-energy',
    type: 'input',
    name: 'الغاز الطبيعي والطاقة',
    code: 'Natural Gas & Power',
    grade: 'Industrial Tariffs / MMBtu',
    category: 'طاقة ومرافق تشغيلية',
    unit: 'دولار / مليون وحدة حرارية',
    benchmark: 'تعرفة الغاز الصناعي والكهرباء',
    description: 'الوقود المحرك لمحطات التوليد الذاتي، ومجففات الفوسفات في المناجم، ومراجل الضغط العالي.',
    accent: '#eeb763'
  },
  {
    id: 'aluminum-hydroxide',
    type: 'input',
    name: 'هيدروكسيد الألمنيوم',
    code: 'Aluminum Hydroxide Al(OH)3',
    grade: 'Standard Chemical Grade',
    category: 'مواد خام كيماوية',
    unit: 'دولار / طن',
    benchmark: 'مؤشر خام الألمنيوم العالمي',
    description: 'المدخل الأساسي المتفاعل مع حامض الفلوسيليسيك لإنتاج فلوريد الألمنيوم عالي القيمة.',
    accent: '#eeb763'
  },
  {
    id: 'freight-logistics',
    type: 'input',
    name: 'أجور الشحن البحري واللوجستيات',
    grade: 'Supramax / Panamax Bulk',
    category: 'تكاليف لوجستية وتشغيل',
    unit: 'دولار / طن مشحون',
    benchmark: 'مؤشر البلطيق للشحن الصب (العقبة - آسيا)',
    description: 'تكاليف شحن المواد الخام المستوردة إلى ميناء العقبة، ونقل صادرات الفوسفات إلى الهند ودول شرق آسيا.',
    accent: '#65a4fa'
  }
];

export default function MaterialsPrices() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMaterials = useMemo(() => {
    return MATERIALS_CATALOG.filter((item) => {
      const matchType = filterType === 'all' || item.type === filterType;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }, [filterType, searchQuery]);

  const outputCount = MATERIALS_CATALOG.filter((m) => m.type === 'output').length;
  const inputCount = MATERIALS_CATALOG.filter((m) => m.type === 'input').length;

  return (
    <section className="materials-view" aria-label="أسعار مدخلات ومخرجات الإنتاج">
      {/* رأس الصفحة والهيدر الترحيبي */}
      <header className="hero materials-hero">
        <div className="kicker">لوحة متابعة الأسواق • تكاليف وعوائد</div>
        <h1>
          أسعار <span>مدخلات ومخرجات الإنتاج</span>
        </h1>
        <p>
          لوحة المؤشرات والأسعار المرجعية لمنتجات مناجم الفوسفات الأردنية النهائية (الفوسفات الخام، الأسمدة، وحامض الفوسفوريك)
          مقابل أسعار المدخلات والمواد الخام الرئيسية (الكبريت، الأمونيا، والطاقة، وأجور الشحن).
          تم تجهيز المساحات أدناه بصناديق جاهزة ومخصصة لاستقبال وتغذية البيانات والرسوم البيانية المباشرة لاحقاً.
        </p>

        {/* كروت الإحصاءات السريعة */}
        <div className="metrics">
          <div className="metric">
            <strong>{outputCount}</strong>
            <span>سلع ومخرجات نهائية</span>
          </div>
          <div className="metric">
            <strong>{inputCount}</strong>
            <span>مدخلات ومواد خام وتكاليف</span>
          </div>
          <div className="metric">
            <strong style={{ color: '#27caa7' }}>FOB / CFR</strong>
            <span>مؤشرات العقبة والأسواق العالمية</span>
          </div>
          <div className="metric">
            <strong style={{ color: '#eeb763' }}>Crack Spread</strong>
            <span>مساحة هوامش التحويل والربحية</span>
          </div>
        </div>
      </header>

      {/* شريط أدوات الفلترة والبحث */}
      <div className="tool-panel materials-toolbar">
        <input
          type="search"
          className="search"
          placeholder="ابحث عن مادة (مثل: صخر الفوسفات، الكبريت، الأمونيا، DAP)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="pill-group" role="tablist" aria-label="تصفية حسب نوع المادة">
          <button
            type="button"
            className={`chip ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            جميع المواد ({MATERIALS_CATALOG.length})
          </button>
          <button
            type="button"
            className={`chip ${filterType === 'output' ? 'active' : ''}`}
            onClick={() => setFilterType('output')}
          >
            مخرجات ومنتجات نهائية ({outputCount})
          </button>
          <button
            type="button"
            className={`chip ${filterType === 'input' ? 'active' : ''}`}
            onClick={() => setFilterType('input')}
          >
            مدخلات إنتاج ومواد خام ({inputCount})
          </button>
        </div>
      </div>

      {/* تنبيه حالة الصناديق الفارغة */}
      <div className="placeholder-banner">
        <div className="placeholder-banner-icon">ℹ️</div>
        <div>
          <strong>صناديق بيانات الأسعار (قيد التجهيز):</strong>
          <span>
            {' '}هذه البطاقات تمثل الهيكلية المعتمدة لمدخلات ومخرجات شركة مناجم الفوسفات. الخانات المخصصة للأسعار والمخططات البيانية
            جاهزة لتوصيل مصادر البيانات والجداول الدورية.
          </span>
        </div>
      </div>

      {/* شبكة صناديق وبطاقات الأسعار */}
      <div className="materials-grid">
        {filteredMaterials.map((item) => (
          <article key={item.id} className={`price-card price-card-${item.type}`}>
            {/* رأس البطاقة */}
            <div className="price-card-header">
              <div className="price-card-titles">
                <span className={`price-badge price-badge-${item.type}`}>
                  {item.type === 'output' ? 'مخرج / منتج نهائي' : 'مدخل إنتاج خام'}
                </span>
                <h3 className="price-card-title">{item.name}</h3>
                <div className="price-card-code">
                  <span>{item.code}</span>
                  {item.grade && <span className="price-card-grade">• {item.grade}</span>}
                </div>
              </div>
              <div className="price-card-category">{item.category}</div>
            </div>

            {/* صندوق عرض السعر الفارغ / Placeholder */}
            <div className="price-display-box">
              <div className="price-main-row">
                <div className="price-value-placeholder">
                  <span className="price-dash">--.--</span>
                  <span className="price-unit">{item.unit}</span>
                </div>
                <div className="price-status-tag">بانتظار البيانات</div>
              </div>
              <div className="price-benchmark-label">
                <strong>المؤشر المرجعي:</strong> {item.benchmark}
              </div>
            </div>

            {/* مساحة المخطط البياني الفارغة / Chart Placeholder Box */}
            <div className="chart-placeholder-box">
              <div className="chart-placeholder-grid">
                <div className="chart-grid-line" />
                <div className="chart-grid-line" />
                <div className="chart-grid-line" />
              </div>
              <div className="chart-placeholder-content">
                <svg
                  className="chart-placeholder-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                <div className="chart-placeholder-text">
                  <strong>مساحة المخطط البياني التاريخي</strong>
                  <small>(سيتم تفعيل حركة الأسعار والمخططات الزمنية هنا)</small>
                </div>
              </div>
            </div>

            {/* تفاصيل وخانات إحصائية فارغة */}
            <div className="price-stats-grid">
              <div className="stat-slot">
                <span className="stat-slot-label">أعلى سعر (12 شهر)</span>
                <span className="stat-slot-value">--</span>
              </div>
              <div className="stat-slot">
                <span className="stat-slot-label">أدنى سعر (12 شهر)</span>
                <span className="stat-slot-value">--</span>
              </div>
              <div className="stat-slot">
                <span className="stat-slot-label">التغير الشهري</span>
                <span className="stat-slot-value">-- %</span>
              </div>
              <div className="stat-slot">
                <span className="stat-slot-label">حالة التحديث</span>
                <span className="stat-slot-value" style={{ color: '#8a94a8' }}>مجدول</span>
              </div>
            </div>

            {/* وصف المادة وأهميتها التشغيلية */}
            <p className="price-card-desc">{item.description}</p>

            {/* تذييل البطاقة وإجراءات الإضافة */}
            <div className="price-card-footer">
              <button type="button" className="price-action-btn" title="سيتاح ربط البيانات وتعيين القيم لاحقاً">
                <span>⚙️ إعداد مؤشر الأسعار</span>
              </button>
              <span className="price-card-id-tag">ID: {item.id}</span>
            </div>
          </article>
        ))}

        {/* بطاقة صندوق فارغ لإضافة مادة أو مؤشر مستقبلي */}
        <article className="price-card price-card-add">
          <div className="add-box-content">
            <div className="add-box-icon">＋</div>
            <h3>إضافة مادة أو تكلفة جديدة</h3>
            <p>
              صندوق فارغ مخصص لإضافة أي منتج ثانوي، حامض إضافي، أو تكلفة لوجستية مستجدة لشركة الفوسفات.
            </p>
            <button type="button" className="add-box-btn">
              حجز صندوق مادة جديدة
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

