import { GROUPS, STATUSES } from '../config.js';

const STATUS_FILTERS = [
  { id: 'all', name: 'كل الحالات' },
  { id: 'operating', name: 'يعمل' },
  { id: 'building', name: 'قيد التنفيذ' },
  { id: 'planned', name: 'مخطط' },
  { id: 'closed', name: 'انتهى / توقف' },
];

export default function Filters({ filters, setFilters, visibleCount, totalCount }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <section className="tool-panel" aria-label="تصفية البيانات">
        <input
          className="search"
          type="search"
          value={filters.query}
          placeholder="ابحث عن شركة، شريك، مصنع أو منجم..."
          onChange={(event) => update('query', event.target.value)}
          aria-label="البحث في المشروعات"
        />
        <div className="pill-group" role="group" aria-label="نوع المشروع">
          {[{ id: 'all', name: 'كل الأنواع' }, ...GROUPS].map((group) => (
            <button
              key={group.id}
              type="button"
              className={`chip${filters.category === group.id ? ' active' : ''}`}
              aria-pressed={filters.category === group.id}
              onClick={() => update('category', group.id)}
            >{group.name}</button>
          ))}
        </div>
        <div className="pill-group" role="group" aria-label="حالة المشروع">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.id}
              type="button"
              className={`chip${filters.status === status.id ? ' active' : ''}`}
              aria-pressed={filters.status === status.id}
              onClick={() => update('status', status.id)}
            >{status.name}</button>
          ))}
        </div>
      </section>
      <div className="subrow">
        <div className="legend">
          {Object.entries(STATUSES).map(([id, status]) => (
            <span key={id}><i style={{ background: status.color }} />{status.name}</span>
          ))}
        </div>
        <div className="hint">تظهر <b>{visibleCount}</b> من أصل {totalCount} بنداً · اضغط على الاسم أو المسطرة</div>
      </div>
    </>
  );
}
