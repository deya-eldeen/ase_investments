import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DATA_AS_OF, DEFAULT_ZOOM, MAX_YEAR, MAX_ZOOM, MIN_YEAR, MIN_ZOOM, STATUSES,
} from '../config.js';
import { getTickYears, isMilestone, yearFractionFromDate } from '../utils/timeline.js';

const AS_OF_YEAR = yearFractionFromDate(DATA_AS_OF);

function ProjectBar({ project, zoom, selectedId, onSelect }) {
  const start = (project.start - MIN_YEAR) * zoom;
  const status = STATUSES[project.status] || STATUSES.unknown;
  const milestone = isMilestone(project);
  const end = project.end == null ? AS_OF_YEAR : project.end;
  const width = Math.max(8, (end - project.start) * zoom);
  const active = selectedId === project.id;
  const caption = `${project.name} | ${project.startText}${project.endText ? ` ← ${project.endText}` : ''}`;

  if (milestone) {
    return (
      <button
        className="tiny-dot"
        type="button"
        title={caption}
        aria-label={`${project.name}، عرض التفاصيل`}
        onClick={() => onSelect(project)}
        style={{ right: start - 2, backgroundColor: status.color }}
      />
    );
  }
  return (
    <button
      type="button"
      className={`gantt-bar ${project.status}${active ? ' active' : ''}${width < 26 ? ' thin-bar' : ''}`}
      style={{ right: start, width }}
      title={caption}
      aria-label={`${project.name}، عرض التفاصيل`}
      onClick={() => onSelect(project)}
    >
      {width >= 105 && <span className="bar-caption">{project.name}</span>}
      {project.end == null && <span className="arrow-tip" aria-hidden="true" />}
      {['stopped', 'ended'].includes(project.status) && <span className="bar-end-dot" aria-hidden="true" />}
    </button>
  );
}

function NameLabels({ rows, selectedId, onSelect }) {
  return rows.map((row) => {
    if (row.type === 'group') {
      return (
        <div key={`label-group-${row.group.id}`} className="group-row">
          <div className="group-title">{row.group.icon} {row.group.name}<em>{row.count}</em></div>
        </div>
      );
    }
    const project = row.item;
    const status = STATUSES[project.status] || STATUSES.unknown;
    return (
      <button
        key={`label-${project.id}`}
        type="button"
        className={`label-row${selectedId === project.id ? ' active' : ''}`}
        onClick={() => onSelect(project)}
        title={project.name}
      >
        <span className="row-indicator" style={{ background: status.color }} />
        <span className="label-content">
          <span className="label-title">{project.name}</span>
          <span className="label-meta">{project.startText}</span>
        </span>
      </button>
    );
  });
}

export default function Timeline({ rows, selectedId, onSelect, filterKey }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const scrollerRef = useRef(null);
  const namesRef = useRef(null);
  const focusYearRef = useRef(null);
  const initialMountRef = useRef(true);
  const totalWidth = (MAX_YEAR - MIN_YEAR) * zoom;
  const tickYears = useMemo(() => getTickYears(zoom), [zoom]);

  const moveToYear = useCallback((year) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    focusYearRef.current = year;
    scroller.scrollLeft = -Math.max(0, (year - MIN_YEAR) * zoom);
  }, [zoom]);

  const moveToRecent = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const windowYears = scroller.clientWidth / zoom;
    const firstYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR - windowYears, AS_OF_YEAR + 2 - windowYears));
    moveToYear(firstYear);
  }, [moveToYear, zoom]);

  useLayoutEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      moveToRecent();
    } else if (focusYearRef.current != null) {
      moveToYear(focusYearRef.current);
    }
  }, [moveToRecent, moveToYear]);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    if (namesRef.current) namesRef.current.scrollTop = 0;
  }, [filterKey]);

  const onScroll = (event) => {
    const scroller = event.currentTarget;
    if (namesRef.current) namesRef.current.scrollTop = scroller.scrollTop;
    focusYearRef.current = MIN_YEAR + Math.abs(scroller.scrollLeft) / zoom;
  };

  const pan = (pixels) => scrollerRef.current?.scrollBy({ left: pixels, behavior: 'smooth' });
  const zoomBy = (amount) => setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + amount)));

  return (
    <div className="timeline-panel">
      <div className="timeline-toolbar">
        <strong>الخط الزمني · السنوات من اليمين إلى اليسار</strong>
        <div className="zoom-actions" role="group" aria-label="التحكم بالمحور الزمني">
          <button className="smallbtn navbtn" type="button" onClick={() => moveToYear(MIN_YEAR)}>الأقدم →</button>
          <button className="smallbtn navbtn" type="button" aria-label="التحريك إلى سنوات أقدم" onClick={() => pan(490)}>→</button>
          <button className="smallbtn navbtn" type="button" aria-label="التحريك إلى سنوات أحدث" onClick={() => pan(-490)}>←</button>
          <button className="smallbtn navbtn" type="button" onClick={moveToRecent}>← الأحدث</button>
          <button className="smallbtn" type="button" aria-label="تصغير المقياس" onClick={() => zoomBy(-12)}>−</button>
          <span className="zoomnum">{Math.round(zoom / DEFAULT_ZOOM * 100)}%</span>
          <button className="smallbtn" type="button" aria-label="تكبير المقياس" onClick={() => zoomBy(12)}>+</button>
        </div>
      </div>
      <div className="viewport-wrap">
        <div className="name-rail">
          <div className="rail-header">اسم الشركة / المشروع</div>
          <div className="rail-scroll" ref={namesRef}>
            <NameLabels rows={rows} selectedId={selectedId} onSelect={onSelect} />
          </div>
        </div>
        <div className="axis-scroll" ref={scrollerRef} onScroll={onScroll} tabIndex={0} aria-label="المحور الزمني القابل للتمرير أفقياً وعمودياً">
          <div className="ruler" style={{ width: totalWidth }}>
            {tickYears.map((year) => (
              <div key={year} className="axis-label" style={{ right: (year - MIN_YEAR) * zoom }}>
                <span />{year}
              </div>
            ))}
            <div className="ruler-current" style={{ right: (AS_OF_YEAR - MIN_YEAR) * zoom }}>
              مرجع البيانات · 2026
            </div>
          </div>
          {rows.length ? (
            <div className="axis-content" style={{ width: totalWidth }}>
              {Array.from({ length: Math.floor((MAX_YEAR - MIN_YEAR) / 5) + 1 }, (_, index) => {
                const year = MIN_YEAR + index * 5;
                return (
                  <div key={year} className={`guide${year % 10 === 0 ? ' major' : ''}`} style={{ right: (year - MIN_YEAR) * zoom }} />
                );
              })}
              <div className="today-line" style={{ right: (AS_OF_YEAR - MIN_YEAR) * zoom }} />
              {rows.map((row) => row.type === 'group' ? (
                <div className="group-axis" key={`axis-group-${row.group.id}`} />
              ) : (
                <div key={`axis-${row.item.id}`} className={`axis-row${selectedId === row.item.id ? ' active' : ''}`}>
                  <ProjectBar project={row.item} zoom={zoom} selectedId={selectedId} onSelect={onSelect} />
                </div>
              ))}
            </div>
          ) : (
            <div className="nothing" style={{ width: totalWidth }}>
              لا توجد مشاريع مطابقة للفلاتر الحالية.
            </div>
          )}
        </div>
      </div>
      <div className="board-footer">
        <div>المساطر المستمرة حتى <b>خط مرجع البيانات</b> تمثل حالة مستمرة، وليست تاريخ انتهاء.</div>
        <div>المسطرة المنقطة = خطة معلنة · النهاية المستقبلية = موعد مستهدف</div>
      </div>
    </div>
  );
}
