import { useEffect, useRef } from 'react';
import { GROUPS, STATUSES } from '../config.js';

export default function ProjectDetails({ project, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [project, onClose]);

  if (!project) return null;
  const group = GROUPS.find((value) => value.id === project.group);
  const status = STATUSES[project.status] || STATUSES.unknown;
  const facts = [
    ['بداية المشروع / الشراكة', project.startText],
    ['الوضع الحالي', status.name],
    ['تاريخ النهاية / المستهدف', project.endText || (
      ['operating', 'building'].includes(project.status) ? 'لم يُعلن انتهاء' : 'غير محدد'
    )],
    ['حصة الفوسفات', project.share],
    ['الشريك', project.partner],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="detail" role="dialog" aria-modal="true" aria-labelledby="project-detail-title">
        <div className="detail-head">
          <span className="detail-kicker">JPMC / PROJECT DETAILS</span>
          <button ref={closeButtonRef} type="button" className="close" onClick={onClose} aria-label="إغلاق التفاصيل">×</button>
        </div>
        <div className="muted-mark">{group?.icon} {group?.name}</div>
        <h2 id="project-detail-title">{project.name}</h2>
        <span className="status-pill"><i style={{ background: status.color }} />{status.name}</span>
        <p className="detail-description">{project.detail}</p>
        <div className="detail-facts">
          {facts.map(([label, value]) => (
            <div className="fact" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {project.exactness && <p className="detail-description"><strong>دقة التاريخ:</strong> {project.exactness}</p>}
        <div className="detail-note">
          المساطر المستمرة حتى خط تاريخ البيانات لا تعني انتهاء المشروع.
          والنهاية المستقبلية تمثل موعداً مستهدفاً، لا إنجازاً مؤكداً.
          القيم الرقمية للسنوات تقريبية عندما يتوفر شهر أو تاريخ جزئي فقط.
        </div>
      </aside>
    </div>
  );
}
