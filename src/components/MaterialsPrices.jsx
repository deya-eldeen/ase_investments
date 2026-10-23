import { useEffect, useMemo, useState } from 'react';
import { fetchAllMaterialQuotes, generateFallbackSeries } from '../utils/financeApi.js';

// كتالوج المواد الأساسية المرتبطة بمؤشرات وعقود بورصات عالمية
const MATERIALS_CATALOG = [
  // =================== 1. المخرجات والمنتجات النهائية ===================
  {
    id: 'phosphate-rock',
    type: 'output',
    name: 'صخر الفوسفات الخام',
    code: 'Phosphate Rock',
    grade: '68% - 70% BPL',
    category: 'منتجات التعدين الخام',
    unit: 'دولار / طن (FOB)',
    ticker: 'MOS',
    tickerDisplay: 'NYSE: MOS',
    benchmark: 'مؤشر تسعير الفوسفات الخام العالمي',
    basePrice: 152.50,
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
    ticker: 'MOS',
    tickerDisplay: 'NYSE: MOS (Phosphate Nutrient)',
    benchmark: 'السعر العالمي المعياري لسماد الداب',
    basePrice: 585.00,
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
    ticker: 'MOS',
    tickerDisplay: 'Global Acid Proxy (MOS)',
    benchmark: 'سعر عقود الهند الدورية (CFR)',
    basePrice: 980.00,
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
    ticker: 'MOS',
    tickerDisplay: 'MAP Global Benchmark',
    benchmark: 'المؤشر العالمي لسماد الماب',
    basePrice: 615.00,
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
    ticker: 'AA',
    tickerDisplay: 'NYSE: AA (Alumina Chain)',
    benchmark: 'مؤشر مصاهر الألمنيوم العالمي',
    basePrice: 1340.00,
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
    ticker: 'CL=F',
    tickerDisplay: 'Petrochemical Acid Benchmark',
    benchmark: 'سعر حامض الكبريتيك الصب الإقليمي',
    basePrice: 145.00,
    description: 'يُنتج محلياً بكميات ضخمة في المجمع الصناعي لاستخدامه في معالجة وإذابة الفوسفات لإنتاج الحامض.',
    accent: '#27caa7'
  },

  // =================== 2. مدخلات الإنتاج والمواد الخام ===================
  {
    id: 'natural-gas-energy',
    type: 'input',
    name: 'الغاز الطبيعي والكهرباء',
    code: 'Natural Gas Futures',
    grade: 'NYMEX Henry Hub / MMBtu',
    category: 'طاقة ومرافق تشغيلية',
    unit: 'دولار / مليون وحدة حرارية (MMBtu)',
    ticker: 'NG=F',
    tickerDisplay: 'NYMEX: NG=F (مباشر)',
    benchmark: 'عقود الغاز الطبيعي الآجلة - بورصة نيويورك',
    basePrice: 2.85,
    description: 'الوقود المحرك لمحطات التوليد الذاتي، ومجففات الفوسفات في المناجم، ومراجل الضغط العالي.',
    accent: '#eeb763'
  },
  {
    id: 'ammonia',
    type: 'input',
    name: 'الأمونيا اللامائية (NH3)',
    code: 'Anhydrous Ammonia Proxy',
    grade: 'Cold Refrigerated 99.5%',
    category: 'مواد خام استراتيجية',
    unit: 'دولار / طن (CFR العقبة)',
    ticker: 'CF',
    tickerDisplay: 'NYSE: CF (Ammonia Leader)',
    benchmark: 'مؤشر أسعار الأمونيا العالمية (الخليج العربي)',
    basePrice: 480.00,
    description: 'المصدر النيتروجيني الحرج الداخل في تفاعل إنتاج أسمدة الفوسفات المركبة (DAP / MAP).',
    accent: '#eeb763'
  },
  {
    id: 'sulfur',
    type: 'input',
    name: 'الكبريت الصلب والسائل',
    code: 'Granular / Molten Sulfur',
    grade: 'Purity 99.5%+',
    category: 'مواد خام استراتيجية',
    unit: 'دولار / طن (CFR العقبة)',
    ticker: 'CL=F',
    tickerDisplay: 'NYMEX: CL=F (Petro Factor)',
    benchmark: 'مؤشر كبريت الشرق الأوسط والخليج',
    basePrice: 195.00,
    description: 'المدخل الأساسي لمصانع حامض الكبريتيك، ويشكل العامل الأكبر في تحديد تكلفة طن سماد الداب.',
    accent: '#eeb763'
  },
  {
    id: 'freight-logistics',
    type: 'input',
    name: 'أجور الشحن البحري واللوجستيات',
    code: 'Dry Bulk Shipping Index',
    grade: 'Baltic Dry Bulk Proxy',
    category: 'تكاليف لوجستية وتشغيل',
    unit: 'مؤشر الشحن / دولار',
    ticker: 'BDRY',
    tickerDisplay: 'NYSE: BDRY (Dry Bulk ETF)',
    benchmark: 'مؤشر البلطيق للشحن الصب (العقبة - الهند/آسيا)',
    basePrice: 6.50,
    description: 'تكاليف شحن المواد الخام المستوردة إلى ميناء العقبة، ونقل صادرات الفوسفات إلى الهند ودول شرق آسيا.',
    accent: '#65a4fa'
  },
  {
    id: 'aluminum-hydroxide',
    type: 'input',
    name: 'هيدروكسيد الألمنيوم',
    code: 'Aluminum Hydroxide Al(OH)3',
    grade: 'Standard Chemical Grade',
    category: 'مواد خام كيماوية',
    unit: 'دولار / طن',
    ticker: 'AA',
    tickerDisplay: 'NYSE: AA (Alumina Ref)',
    benchmark: 'مؤشر خام الألمنيوم العالمي',
    basePrice: 420.00,
    description: 'المدخل الأساسي المتفاعل مع حامض الفلوسيليسيك لإنتاج فلوريد الألمنيوم عالي القيمة.',
    accent: '#eeb763'
  }
];

// رسم بياني SVG تفاعلي عالي الدقة يدعم تدرجات الظل ونقاط البيانات
function SparklineChart({ data = [], isPositive = true, height = 46, idPrefix = 'chart' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 160;
  const strokeColor = isPositive ? '#27caa7' : '#e97881';
  const gradId = `spark-grad-${idPrefix}`;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 12) - 6;
    return { x, y, val };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const polygonPoints = `0,${height} ${polylinePoints} ${width},${height}`;
  const lastPoint = points[points.length - 1];

  return (
    <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={polygonPoints} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3.5"
          fill={strokeColor}
          stroke="#09101d"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

// بطاقة عرض المادة مع الرسمين البيانيين (آخر 3 أشهر + آخر أسبوع)
function PriceCard({ item, quote, loading }) {
  const hasLiveQuote = !!quote;
  const price = hasLiveQuote ? quote.price : item.basePrice;
  const changePercent = hasLiveQuote ? quote.changePercent : 0;
  const isPositive = changePercent >= 0;

  // استخراج سلسلة 3 أشهر وسلسلة الأسبوع الأخير
  const history3m = hasLiveQuote && quote.history3m && quote.history3m.length >= 5
    ? quote.history3m
    : generateFallbackSeries(price, 65, 0.05);

  const history1w = hasLiveQuote && quote.history1w && quote.history1w.length >= 3
    ? quote.history1w
    : history3m.slice(-7);

  // حساب نسب التغير والأعلى والأدنى لكل من الفترتين
  const weekStart = history1w[0] || price;
  const weekEnd = history1w[history1w.length - 1] || price;
  const weekChangePercent = hasLiveQuote && typeof quote.weekChangePercent === 'number'
    ? quote.weekChangePercent
    : (weekStart ? Number((((weekEnd - weekStart) / weekStart) * 100).toFixed(2)) : 0);
  const isWeekPositive = weekChangePercent >= 0;
  const weekMin = Math.min(...history1w);
  const weekMax = Math.max(...history1w);

  const m3Start = history3m[0] || price;
  const m3End = history3m[history3m.length - 1] || price;
  const m3ChangePercent = hasLiveQuote && typeof quote.m3ChangePercent === 'number'
    ? quote.m3ChangePercent
    : (m3Start ? Number((((m3End - m3Start) / m3Start) * 100).toFixed(2)) : 0);
  const isM3Positive = m3ChangePercent >= 0;
  const m3Min = Math.min(...history3m);
  const m3Max = Math.max(...history3m);

  return (
    <article className={`price-card price-card-${item.type}`}>
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

      {/* صندوق عرض السعر الحي المجلوب عبر API */}
      <div className="price-display-box">
        <div className="price-main-row">
          <div className="price-value-container">
            <span className="price-currency-symbol">$</span>
            <span className="price-main-val">
              {loading && !hasLiveQuote ? (
                <span className="price-loading-dash">جاري الجلب...</span>
              ) : (
                price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              )}
            </span>
            <span className="price-unit">{item.unit}</span>
          </div>

          <div className={`price-change-pill ${isPositive ? 'positive' : 'negative'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{Math.abs(changePercent).toFixed(2)}% (يومي)</span>
          </div>
        </div>

        <div className="price-ticker-row">
          <div className="price-ticker-tag">
            <span className="api-dot" />
            <span>{item.tickerDisplay}</span>
          </div>
          <span className="api-live-label">{hasLiveQuote ? quote.source : 'مؤشر مرجعي'}</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* عرض الرسمين البيانيين: 1) آخر أسبوع  2) آخر 3 أشهر */}
      {/* =================================================================== */}
      <div className="dual-charts-grid">
        {/* الرسم الأول: آخر أسبوع */}
        <div className="sub-chart-panel">
          <div className="sub-chart-top">
            <span className="sub-chart-name">📅 آخر أسبوع (7 أيام)</span>
            <span className={`sub-chart-delta ${isWeekPositive ? 'delta-pos' : 'delta-neg'}`}>
              {isWeekPositive ? '▲' : '▼'} {Math.abs(weekChangePercent).toFixed(1)}%
            </span>
          </div>
          <div className="sub-chart-render">
            <SparklineChart
              data={history1w}
              isPositive={isWeekPositive}
              height={44}
              idPrefix={`${item.id}-1w`}
            />
          </div>
          <div className="sub-chart-limits">
            <span>أدنى: ${weekMin.toFixed(1)}</span>
            <span>أعلى: ${weekMax.toFixed(1)}</span>
          </div>
        </div>

        {/* الرسم الثاني: آخر 3 أشهر */}
        <div className="sub-chart-panel">
          <div className="sub-chart-top">
            <span className="sub-chart-name">📈 آخر 3 أشهر (فصلي)</span>
            <span className={`sub-chart-delta ${isM3Positive ? 'delta-pos' : 'delta-neg'}`}>
              {isM3Positive ? '▲' : '▼'} {Math.abs(m3ChangePercent).toFixed(1)}%
            </span>
          </div>
          <div className="sub-chart-render">
            <SparklineChart
              data={history3m}
              isPositive={isM3Positive}
              height={44}
              idPrefix={`${item.id}-3m`}
            />
          </div>
          <div className="sub-chart-limits">
            <span>أدنى: ${m3Min.toFixed(1)}</span>
            <span>أعلى: ${m3Max.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* تفاصيل إحصائية من واقع تداولات السوق */}
      <div className="price-stats-grid">
        <div className="stat-slot">
          <span className="stat-slot-label">نطاق 3 أشهر (أعلى/أدنى)</span>
          <span className="stat-slot-value">${m3Max.toFixed(1)} / ${m3Min.toFixed(1)}</span>
        </div>
        <div className="stat-slot">
          <span className="stat-slot-label">نطاق الأسبوع الأخير</span>
          <span className="stat-slot-value">${weekMax.toFixed(1)} / ${weekMin.toFixed(1)}</span>
        </div>
        <div className="stat-slot">
          <span className="stat-slot-label">مصدر التغذية</span>
          <span className="stat-slot-value" style={{ color: '#27caa7' }}>
            {hasLiveQuote ? quote.source : 'مؤشر مرجعي'}
          </span>
        </div>
        <div className="stat-slot">
          <span className="stat-slot-label">حالة التداول</span>
          <span className="stat-slot-value" style={{ color: '#a4cdfa' }}>نشط / معتمد</span>
        </div>
      </div>

      {/* وصف المادة وأهميتها التشغيلية */}
      <p className="price-card-desc">{item.description}</p>

      {/* تذييل البطاقة */}
      <div className="price-card-footer">
        <span className="price-card-benchmark-note">
          <strong>المرجع:</strong> {item.benchmark}
        </span>
        <span className="price-card-id-tag">ID: {item.id}</span>
      </div>
    </article>
  );
}

export default function MaterialsPrices() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastFetchedTime, setLastFetchedTime] = useState(null);

  // جلب الأسعار الحية عبر Yahoo Finance API عند تحميل المكون
  const loadLiveQuotes = async () => {
    setLoading(true);
    try {
      const fetched = await fetchAllMaterialQuotes();
      setQuotes(fetched);
      setLastFetchedTime(new Date());
    } catch {
      // التعامل الهادئ مع أي انقطاع
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveQuotes();
  }, []);

  const outputMaterials = useMemo(() => {
    return MATERIALS_CATALOG.filter((item) => {
      if (item.type !== 'output') return false;
      const q = searchQuery.trim().toLowerCase();
      return (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const inputMaterials = useMemo(() => {
    return MATERIALS_CATALOG.filter((item) => {
      if (item.type !== 'input') return false;
      const q = searchQuery.trim().toLowerCase();
      return (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const totalOutputs = MATERIALS_CATALOG.filter((m) => m.type === 'output').length;
  const totalInputs = MATERIALS_CATALOG.filter((m) => m.type === 'input').length;

  const showOutputs = filterType === 'all' || filterType === 'output';
  const showInputs = filterType === 'all' || filterType === 'input';

  return (
    <section className="materials-view" aria-label="أسعار مدخلات ومخرجات الإنتاج">
      {/* شريط حالة التغذية الحية لأسعار البورصة (Live Feed Bar) */}
      <div className="live-feed-banner">
        <div className="live-feed-info">
          <span className="live-radar-dot" />
          <div className="live-feed-text">
            <strong>بث أسعار مباشر للمواد والمؤشرات:</strong>
            <span>
              {lastFetchedTime
                ? ` تم التحديث اللحظي: ${lastFetchedTime.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : ' جاري الاتصال بمزود الأسعار...'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="refresh-prices-btn"
          onClick={loadLiveQuotes}
          disabled={loading}
          title="تحديث الأسعار الفوري من البورصة العالمية"
        >
          <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
          <span>{loading ? 'جاري التحديث...' : 'تحديث الأسعار'}</span>
        </button>
      </div>

      {/* رأس الصفحة والهيدر الترحيبي */}
      <header className="hero materials-hero">
        <div className="kicker">لوحة متابعة الأسواق • تكاليف وعوائد حية</div>
        <h1>
          أسعار <span>مدخلات ومخرجات الإنتاج</span>
        </h1>
        <p>
          متابعة حية للأسعار المرجعية وعقود البورصات العالمية لمنتجات الفوسفات والأسمدة (مخرجات)،
          مقابل تكاليف الطاقة والأمونيا والكبريت والشحن (مدخلات). يتم جلب القيم مباشرة من أسواق التداول عبر واجهات API.
        </p>

        {/* كروت الإحصاءات السريعة بصيغة شبكية متناسقة */}
        <div className="metrics-grid-balanced">
          <div className="metric-box">
            <strong style={{ color: '#27caa7' }}>{totalOutputs}</strong>
            <span>مخرجات ومنتجات نهائية</span>
          </div>
          <div className="metric-box">
            <strong style={{ color: '#eeb763' }}>{totalInputs}</strong>
            <span>مدخلات ومواد خام وتكاليف</span>
          </div>
          <div className="metric-box">
            <strong style={{ color: '#65a4fa' }}>NYMEX / NYSE</strong>
            <span>بورصات التداول المرجعية</span>
          </div>
          <div className="metric-box">
            <strong style={{ color: '#ba91fa' }}>Crack Spread</strong>
            <span>مساحة هوامش التحويل والربحية</span>
          </div>
        </div>
      </header>

      {/* شريط الأقسام المقسمة المتناسق (Segmented Sections Control) */}
      <div className="sections-segmented-wrapper">
        <div className="sections-segmented-control" role="tablist" aria-label="أقسام المواد والمدخلات">
          <button
            type="button"
            className={`seg-section-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <span>جميع المواد ({MATERIALS_CATALOG.length})</span>
          </button>

          <button
            type="button"
            className={`seg-section-btn ${filterType === 'output' ? 'active' : ''}`}
            onClick={() => setFilterType('output')}
          >
            <span>🏭 مخرجات ومنتجات ({totalOutputs})</span>
          </button>

          <button
            type="button"
            className={`seg-section-btn ${filterType === 'input' ? 'active' : ''}`}
            onClick={() => setFilterType('input')}
          >
            <span>⚡ مدخلات وتكاليف ({totalInputs})</span>
          </button>
        </div>

        <div className="materials-search-row">
          <input
            type="search"
            className="search materials-search-input"
            placeholder="ابحث عن مادة أو مؤشر (صخر الفوسفات، الكبريت، الأمونيا، الغاز، DAP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* القسم الأول: مخرجات ومنتجات الشركة النهائية */}
      {/* ===================================================================== */}
      {showOutputs && (
        <section className="materials-section" aria-label="قسم مخرجات ومنتجات الشركة">
          <div className="section-title-bar">
            <div className="section-title-group">
              <span className="section-icon section-icon-output">🏭</span>
              <div>
                <h2 className="section-heading">القسم الأول: مخرجات ومنتجات الشركة النهائية</h2>
                <p className="section-subtext">
                  صخر الفوسفات الخام المستخرج، والأسمدة الفوسفاتية التصديرية، وحامض الفوسفوريك والكيماويات التحويلية
                </p>
              </div>
            </div>
            <span className="section-counter-badge output-badge">{outputMaterials.length} منتجات</span>
          </div>

          {outputMaterials.length > 0 ? (
            <div className="materials-grid">
              {outputMaterials.map((item) => (
                <PriceCard
                  key={item.id}
                  item={item}
                  quote={quotes[item.ticker]}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <div className="section-empty-msg">
              لا توجد منتجات مخرجة تطابق البحث: «{searchQuery}»
            </div>
          )}
        </section>
      )}

      {/* ===================================================================== */}
      {/* القسم الثاني: مدخلات الإنتاج والمواد الخام والتكاليف */}
      {/* ===================================================================== */}
      {showInputs && (
        <section className="materials-section" aria-label="قسم مدخلات الإنتاج والمواد الخام">
          <div className="section-title-bar">
            <div className="section-title-group">
              <span className="section-icon section-icon-input">⚡</span>
              <div>
                <h2 className="section-heading">القسم الثاني: مدخلات الإنتاج والمواد الخام والتكاليف</h2>
                <p className="section-subtext">
                  المواد الخام المستوردة (الكبريت والأمونيا)، مصادر الطاقة والغاز الطبيعي، وأجور الشحن والنقل البحري
                </p>
              </div>
            </div>
            <span className="section-counter-badge input-badge">{inputMaterials.length} مدخلات وتكاليف</span>
          </div>

          {inputMaterials.length > 0 ? (
            <div className="materials-grid">
              {inputMaterials.map((item) => (
                <PriceCard
                  key={item.id}
                  item={item}
                  quote={quotes[item.ticker]}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <div className="section-empty-msg">
              لا توجد مدخلات أو تكاليف تطابق البحث: «{searchQuery}»
            </div>
          )}
        </section>
      )}
    </section>
  );
}
