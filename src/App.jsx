import { useCallback, useMemo, useState } from 'react';
import projects from '../projects.json';
import { DATA_AS_OF } from './config.js';
import { createRows, filterProjects } from './utils/timeline.js';
import Filters from './components/Filters.jsx';
import Timeline from './components/Timeline.jsx';
import ProjectDetails from './components/ProjectDetails.jsx';
import MaterialsPrices from './components/MaterialsPrices.jsx';

const INITIAL_FILTERS = { query: '', category: 'all', status: 'all' };

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
      {/* الشريط العلوي المشترك والتبويبات الرئيسية */}
      <div className="topline">
        <button
          type="button"
          className="brand brand-btn"
          onClick={() => setActiveTab('materials')}
          title="الرئيسية: شاشة أسعار المواد والمدخلات والمخرجات"
        >
          <div className="brand-symbol">P</div>
          <div className="brand-text">
            <div className="brand-name">مناجم الفوسفات الأردنية</div>
            <small>JPMC · INVESTMENT PORTAL</small>
          </div>
        </button>

        {/* ألسنة التبويب العلوية (Top Tabs) */}
        <nav className="main-tabs" aria-label="أقسام البوابة الرئيسية">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
            aria-current={activeTab === 'materials' ? 'page' : undefined}
          >
            <span className="tab-home-badge">الرئيسية 🏠</span>
            <span className="tab-label">أسعار المدخلات والمخرجات</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
            aria-current={activeTab === 'projects' ? 'page' : undefined}
          >
            <span className="tab-icon">🗺️</span>
            <span className="tab-label">خارطة المشاريع والاستثمارات</span>
            <span className="tab-badge">{projects.length}</span>
          </button>
        </nav>

        <div className="update">آخر تحديث للبيانات: {DATA_AS_OF}</div>
      </div>

      {/* عرض شاشة أسعار المواد (الرئيسية) */}
      {activeTab === 'materials' && <MaterialsPrices />}

      {/* عرض شاشة خط المشاريع الزمني */}
      {activeTab === 'projects' && (
        <section className="projects-view" aria-label="خارطة المشاريع والاستثمارات">
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
    </main>
  );
}
