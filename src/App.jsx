import { useCallback, useMemo, useState } from 'react';
import projects from '../projects.json';
import { DATA_AS_OF } from './config.js';
import { createRows, filterProjects } from './utils/timeline.js';
import Filters from './components/Filters.jsx';
import Timeline from './components/Timeline.jsx';
import ProjectDetails from './components/ProjectDetails.jsx';
import MaterialsPrices from './components/MaterialsPrices.jsx';

const INITIAL_FILTERS = { query: '', category: 'all', status: 'all' };

function DisclaimerBanner({ position = 'top' }) {
  return (
    <aside
      className={`disclaimer-banner ${position === 'bottom' ? 'disclaimer-banner-bottom' : ''}`}
      role="alert"
      aria-label="إخلاء مسؤولية"
    >
      <div className="disclaimer-badge">
        <span aria-hidden="true">⚠️</span>
        <span>تنويه وإخلاء مسؤولية</span>
      </div>
      <p className="disclaimer-text">
        <strong>موقع غير رسمي:</strong> هذا الموقع مستقل تماماً ولا يتبع لشركة مناجم الفوسفات الأردنية الرسمية.
        البيانات المعروضة قد تكون غير دقيقة أو تحتوي على أخطاء ناتجة عن استخدام أدوات الذكاء الاصطناعي (AI) في المعالجة والتلخيص.
        المحتوى لأغراض استرشادية فقط <strong>ولا يُمثل أي نصيحة مالية أو استثمارية</strong>، والقائم على الموقع غير مسؤول قانونياً أو مالياً عن صحة البيانات أو أي قرارات تُتخذ بناءً عليها.
      </p>
    </aside>
  );
}

export default function App() {
  // شاشة الأسعار هي الشاشة الرئيسية الافتراضية للزر الرئيسي
  const [activeTab, setActiveTab] = useState('materials');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selected, setSelected] = useState(null);

  const closeDetails = useCallback(() => setSelected(null), []);
  const filtered = useMemo(() => filterProjects(projects, filters), [filters]);
  const rows = useMemo(() => createRows(filtered), [filtered]);
  const working = projects.filter((project) => project.status === 'operating').length;
  const building = projects.filter((project) => project.status === 'building').length;

  return (
    <main className="shell" dir="rtl">
      {/* شريط التنبيه وإخلاء المسؤولية العلوي */}
      <DisclaimerBanner position="top" />

      {/* الترويسة الرئيسية والتبويبات المقسمة المتناسقة */}
      <header className="site-header">
        <div className="topline">
          <button
            type="button"
            className="brand brand-btn"
            onClick={() => setActiveTab('materials')}
            title="الرئيسية: شاشة أسعار المواد والمدخلات والمخرجات"
          >
            <div className="brand-symbol">P</div>
            <div className="brand-text">
              <div className="brand-name">محبوا سهم مناجم الفوسفات الأردنية</div>
              <small>بوابة استثمارية غير رسمية · JPMC INVESTORS</small>
            </div>
          </button>

          <div className="header-status-pill">
            {activeTab === 'materials' ? (
              <span className="live-api-tag">
                <span className="pulse-dot" />
                مباشر: مؤشرات الأسواق
              </span>
            ) : (
              <span className="dataset-tag">
                سجل المشاريع والاستثمارات
              </span>
            )}
          </div>
        </div>

        {/* أشرطة التبويب المقسمة المتجاوبة (Segmented Tabs Control) */}
        <nav className="segmented-control" aria-label="أقسام البوابة الرئيسية">
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
            aria-current={activeTab === 'materials' ? 'page' : undefined}
          >
            <span className="seg-icon">📊</span>
            <span className="seg-label-full">أسعار المواد والمدخلات</span>
            <span className="seg-label-short">أسعار المواد</span>
            <span className="seg-home-badge">الرئيسية 🏠</span>
          </button>

          <button
            type="button"
            className={`segmented-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
            aria-current={activeTab === 'projects' ? 'page' : undefined}
          >
            <span className="seg-icon">🗺️</span>
            <span className="seg-label-full">خارطة المشاريع والاستثمارات</span>
            <span className="seg-label-short">خارطة المشاريع</span>
            <span className="seg-count-badge">{projects.length}</span>
          </button>
        </nav>
      </header>

      {/* عرض شاشة أسعار المواد (الرئيسية) */}
      {activeTab === 'materials' && <MaterialsPrices />}

      {/* عرض شاشة خط المشاريع الزمني */}
      {activeTab === 'projects' && (
        <section className="projects-view" aria-label="خارطة المشاريع والاستثمارات">
          {/* شريط تاريخ تحديث بيانات المشاريع - خاص بجدول المشاريع فقط */}
          <div className="projects-update-banner">
            <span className="projects-update-icon">📅</span>
            <span>آخر تدقيق لبيانات مشروعات وشركات الفوسفات: <strong>{DATA_AS_OF}</strong></span>
          </div>

          <header className="hero">
            <div className="kicker">مشاريع • شركات • شراكات • توسعات</div>
            <h1>خارطة توسّع <span>الفوسفات الأردنية</span></h1>
            <p>
              خط زمني تفاعلي يجمع الشركات التابعة والشراكات والمصانع والتوسعات والمشروعات التاريخية.
              تحرّك أفقياً بين السنوات، واضغط على أي مسطرة لقراءة تفاصيل المشروع وحالته.
            </p>
            <div className="metrics">
              <div className="metric"><strong>{projects.length}</strong><span>شركة ومشروعاً ومرفقاً</span></div>
              <div className="metric"><strong>{working}</strong><span>بنود موصوفة بأنها عاملة</span></div>
              <div className="metric"><strong>{building}</strong><span>مشروعات قيد التنفيذ</span></div>
              <div className="metric"><strong>1935–2030</strong><span>بدايات تاريخية وأهداف مستقبلية</span></div>
            </div>
          </header>

          <Filters
            filters={filters}
            setFilters={setFilters}
            visibleCount={filtered.length}
            totalCount={projects.length}
          />

          <Timeline
            rows={rows}
            selectedId={selected?.id}
            onSelect={setSelected}
            filterKey={`${filters.query}|${filters.category}|${filters.status}`}
          />

          <p className="footer-note">
            ملاحظة بيانات: هذا التصوير مبني على القائمة البحثية السابقة في المحادثة.
            تختلف «بداية» البنود بين تأسيس الشركة وتاريخ الاتفاق وأول توثيق للتشغيل.
            وقد تظهر الشركة ومصنعها كبندين مرتبطين؛ لذلك لا يُعد المجموع عدّاً لشركات قانونية مستقلة.
            يُنصح بالعودة إلى إفصاحات الشركة للتحقق من المعلومات الاستثمارية.
          </p>

          <ProjectDetails project={selected} onClose={closeDetails} />
        </section>
      )}

      {/* شريط التنبيه وإخلاء المسؤولية في أسفل الشاشة أيضاً */}
      <DisclaimerBanner position="bottom" />
    </main>
  );
}
