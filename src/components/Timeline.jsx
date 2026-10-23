import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DATA_AS_OF, DEFAULT_ZOOM, MAX_YEAR, MAX_ZOOM, MIN_YEAR, MIN_ZOOM, STATUSES,
} from '../config.js';
import { getTickYears, isMilestone, yearFractionFromDate } from '../utils/timeline.js';

const AS_OF_YEAR = yearFractionFromDate(DATA_AS_OF);

function ProjectRow({ project, zoom, selectedId, onSelect, viewportRange, moveToYear }) {
  const start = (project.start - MIN_YEAR) * zoom;
  const status = STATUSES[project.status] || STATUSES.unknown;
  const milestone = isMilestone(project);
  const end = project.end == null ? AS_OF_YEAR : project.end;
  const width = Math.max(8, (end - project.start) * zoom);
  const endPos = start + width;
  const active = selectedId === project.id;
  const caption = `${project.name} | ${project.startText}${project.endText ? ` ← ${project.endText}` : ''}`;
  const isShort = width < 140;

  // تحديد أقصى امتداد أفقي للعنصر (المسطرة أو علامة المرحلة المهمة أو النص المجاور)
  const maxPos = milestone ? (start + 180) : (isShort ? (start + width + 180) : endPos);

  // تحديد ما إذا كان المشروع خارج نطاق الرؤية أفقياً (في الماضي أو في المستقبل)
  const isOutOfRight = maxPos < viewportRange.scrollRight - 10;
  const isOutOfLeft = start > viewportRange.scrollRight + viewportRange.clientWidth + 10;

  const handleSelectAndScroll = () => {
    onSelect(project);
    moveToYear(project.start);
  };

  return (
    <div key={`axis-${project.id}`} className={`axis-row${active ? ' active' : ''}`}>
      {/* 1. الشريط المصغر التفاعلي الثابت أقصى اليمين لكل مشروع (قضيب جانبي قابل للنقر) */}
      <button
        type="button"
        className={`row-mini-strip ${project.status}${active ? ' active' : ''}`}
        onClick={handleSelectAndScroll}
        title={`${project.name} (${status.label} - ${project.startText}) - اضغط لعرض التفاصيل والانتقال إليه`}
        aria-label={`شريط المشروع: ${project.name}`}
      >
        <span className="mini-strip-color" style={{ backgroundColor: status.color }} />
      </button>

      {/* 2. شارة مثبتة على الحافة اليمنى للمشاريع التي تقع خارج الشاشة في الماضي */}
      {isOutOfRight && (
        <button
          type="button"
          className={`sticky-oob-pill sticky-right ${project.status}${active ? ' active' : ''}`}
          onClick={handleSelectAndScroll}
          title={`${project.name} (في الماضي: ${project.startText}) - اضغط للانتقال`}
          style={{ borderRightColor: status.color }}
        >
          <span className="oob-arrow" aria-hidden="true">➔</span>
          <span className="oob-name">{project.name}</span>
          <span className="oob-date">({project.startText})</span>
        </button>
      )}

      {/* 3. شارة مثبتة على الحافة اليسرى للمشاريع التي تقع خارج الشاشة في المستقبل */}
      {isOutOfLeft && (
        <button
          type="button"
          className={`sticky-oob-pill sticky-left ${project.status}${active ? ' active' : ''}`}
          onClick={handleSelectAndScroll}
          title={`${project.name} (في المستقبل: ${project.startText}) - اضغط للانتقال`}
          style={{ borderLeftColor: status.color }}
        >
          <span className="oob-name">{project.name}</span>
          <span className="oob-date">({project.startText})</span>
          <span className="oob-arrow" aria-hidden="true">⬅</span>
        </button>
      )}

      {/* 4. عرض المسطرة العادية والنقاط عندما تكون داخل نطاق الرؤية */}
      {!isOutOfRight && !isOutOfLeft && (
        <>
          {milestone ? (
            <div className="milestone-container" style={{ right: start - 4 }}>
              <button
                className="tiny-dot"
                type="button"
                title={caption}
                aria-label={`${project.name}، عرض التفاصيل`}
                onClick={() => onSelect(project)}
                style={{ backgroundColor: status.color }}
              />
              <button
                type="button"
                className={`bar-near-label milestone-near-label${active ? ' active' : ''}`}
                style={{ right: 18 }}
                title={caption}
                aria-label={`${project.name}، عرض التفاصيل`}
                onClick={() => onSelect(project)}
              >
                <span className="near-label-name">{project.name}</span>
                <span className="near-label-date">({project.startText})</span>
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`gantt-bar ${project.status}${active ? ' active' : ''}${width < 26 ? ' thin-bar' : ''}`}
                style={{ right: start, width }}
                title={caption}
                aria-label={`${project.name}، عرض التفاصيل`}
                onClick={() => onSelect(project)}
              >
                {!isShort && <span className="bar-caption">{project.name}</span>}
                {project.end == null && <span className="arrow-tip" aria-hidden="true" />}
                {['stopped', 'ended'].includes(project.status) && <span className="bar-end-dot" aria-hidden="true" />}
              </button>

              {/* عندما تكون المسطرة قصيرة: كتابة الاسم بجوارها بلون ناصع معاكس للخلفية */}
              {isShort && (
                <button
                  type="button"
                  className={`bar-near-label${active ? ' active' : ''}`}
                  style={{ right: start + width + 8 }}
                  title={caption}
                  aria-label={`${project.name}، عرض التفاصيل`}
                  onClick={() => onSelect(project)}
                >
                  <span className="near-label-name">{project.name}</span>
                  <span className="near-label-date">({project.startText})</span>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function Timeline({ rows, selectedId, onSelect, filterKey }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const scrollerRef = useRef(null);
  const focusYearRef = useRef(null);
  const initialMountRef = useRef(true);

  // تتبع مساحة الرؤية الحالية لتحديد العناصر التي خرجت عن حدود الشاشة
  const [viewportRange, setViewportRange] = useState({ scrollRight: 0, clientWidth: 1000 });

  // إضافة مساحة أمان على اليسار للأسماء المكتوبة بجوار المساطر
  const totalWidth = (MAX_YEAR - MIN_YEAR) * zoom + 360;
  const currentPos = (AS_OF_YEAR - MIN_YEAR) * zoom;
  const tickYears = useMemo(() => getTickYears(zoom), [zoom]);

  const moveToYear = useCallback((year, smooth = true) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    focusYearRef.current = year;
    const target = (year - MIN_YEAR) * zoom - (scroller.clientWidth / 2);
    const targetScroll = Math.max(0, target);
    if (smooth) {
      scroller.scrollTo({ left: -targetScroll, behavior: 'smooth' });
    } else {
      scroller.scrollLeft = -targetScroll;
    }
    setViewportRange({ scrollRight: targetScroll, clientWidth: scroller.clientWidth });
  }, [zoom]);

  const moveToRecent = useCallback((smooth = false) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const windowYears = scroller.clientWidth / zoom;
    const firstYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR - windowYears, AS_OF_YEAR + 1.5 - (windowYears / 2)));
    focusYearRef.current = firstYear;
    const targetScroll = Math.max(0, (firstYear - MIN_YEAR) * zoom);
    if (smooth) {
      scroller.scrollTo({ left: -targetScroll, behavior: 'smooth' });
    } else {
      scroller.scrollLeft = -targetScroll;
    }
    setViewportRange({ scrollRight: targetScroll, clientWidth: scroller.clientWidth });
  }, [zoom]);

  useLayoutEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      moveToRecent(false);
    } else if (focusYearRef.current != null) {
      const scroller = scrollerRef.current;
      if (scroller) {
        const targetScroll = Math.max(0, (focusYearRef.current - MIN_YEAR) * zoom);
        scroller.scrollLeft = -targetScroll;
        setViewportRange({ scrollRight: targetScroll, clientWidth: scroller.clientWidth });
      }
    }
  }, [moveToRecent, zoom]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const handleResize = () => {
      setViewportRange({
        scrollRight: Math.abs(scroller.scrollLeft),
        clientWidth: scroller.clientWidth,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, [filterKey]);

  const onScroll = (event) => {
    const scroller = event.currentTarget;
    const scrollRight = Math.abs(scroller.scrollLeft);
    const clientWidth = scroller.clientWidth;
    focusYearRef.current = MIN_YEAR + (scrollRight + (clientWidth / 2)) / zoom;
    setViewportRange({ scrollRight, clientWidth });
  };

  const pan = (pixels) => scrollerRef.current?.scrollBy({ left: pixels, behavior: 'smooth' });
  const zoomBy = (amount) => setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + amount)));

  return (
    <div className="timeline-panel">
      {/* شريط أدوات التكبير والتنقل بين السنوات */}
      <div className="timeline-toolbar">
        <div className="toolbar-legend-group">
          <strong>الخط الزمني للمشاريع</strong>
          <span className="zone-indicator-pill past-zone-pill">الماضي (السنوات السابقة) ←</span>
          <span className="zone-indicator-pill future-zone-pill">→ المستقبل والمشاريع المستهدفة</span>
        </div>

        <div className="zoom-actions" role="group" aria-label="التحكم بالمحور الزمني">
          <button className="smallbtn navbtn" type="button" onClick={() => moveToYear(MIN_YEAR, true)} title="الانتقال إلى أقدم المشاريع">الأقدم →</button>
          <button className="smallbtn navbtn" type="button" aria-label="التحريك إلى سنوات أقدم" onClick={() => pan(490)}>→</button>
          <button className="smallbtn navbtn" type="button" aria-label="التحريك إلى سنوات أحدث" onClick={() => pan(-490)}>←</button>
          <button className="smallbtn navbtn" type="button" onClick={() => moveToRecent(true)} title="الانتقال إلى الحاضر (2026)">📍 الحاضر (2026)</button>
          <button className="smallbtn navbtn" type="button" onClick={() => moveToYear(MAX_YEAR, true)} title="الانتقال إلى أحدث المشاريع والمستقبل">← الأحدث</button>
          <button className="smallbtn" type="button" aria-label="تصغير المقياس" onClick={() => zoomBy(-12)}>−</button>
          <span className="zoomnum">{Math.round(zoom / DEFAULT_ZOOM * 100)}%</span>
          <button className="smallbtn" type="button" aria-label="تكبير المقياس" onClick={() => zoomBy(12)}>+</button>
        </div>
      </div>

      {/* منطقة عرض الخط الزمني - مع إظهار شريط التمرير العمودي بوضوح */}
      <div className="viewport-wrap full-width-viewport">
        <div
          className="axis-scroll with-vertical-bar"
          ref={scrollerRef}
          onScroll={onScroll}
          tabIndex={0}
          aria-label="المحور الزمني القابل للتمرير أفقياً وعمودياً"
        >
          {/* مسطرة السنوات العليا */}
          <div className="ruler" style={{ width: totalWidth }}>
            {/* ترويسة المسار الشريطي الجانبي الأيمن */}
            <div className="ruler-rail-header" title="مسار أشرطة المشاريع السريع">
              <span>📌</span>
            </div>

            {tickYears.map((year) => (
              <div key={year} className="axis-label" style={{ right: (year - MIN_YEAR) * zoom }}>
                <span />{year}
              </div>
            ))}

            {/* شارة الوقت الحالي على مسطرة السنوات */}
            <div className="ruler-current" style={{ right: currentPos }}>
              📍 اليوم (2026)
            </div>
          </div>

          {/* صفوف المشاريع ومساطر الجانت */}
          {rows.length ? (
            <div className="axis-content" style={{ width: totalWidth }}>
              {Array.from({ length: Math.floor((MAX_YEAR - MIN_YEAR) / 5) + 1 }, (_, index) => {
                const year = MIN_YEAR + index * 5;
                return (
                  <div key={year} className={`guide${year % 10 === 0 ? ' major' : ''}`} style={{ right: (year - MIN_YEAR) * zoom }} />
                );
              })}

              {/* خط الوقت الحالي المنقط الفاصل بين الماضي والمستقبل */}
              <div className="current-time-marker" style={{ right: currentPos }}>
                <div className="current-time-badge">
                  <span className="pulse-dot-small" />
                  <span>الوقت الحالي (2026)</span>
                </div>
              </div>

              {rows.map((row) =>
                row.type === 'group' ? (
                  <div className="group-axis" key={`axis-group-${row.group.id}`}>
                    <div className="group-rail-corner" aria-hidden="true" />
                    <div className="group-axis-badge">
                      <span className="group-icon">{row.group.icon}</span>
                      <span className="group-name">{row.group.name}</span>
                      <span className="group-count">{row.count}</span>
                    </div>
                  </div>
                ) : (
                  <ProjectRow
                    key={`row-${row.item.id}`}
                    project={row.item}
                    zoom={zoom}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    viewportRange={viewportRange}
                    moveToYear={moveToYear}
                  />
                )
              )}
            </div>
          ) : (
            <div className="nothing" style={{ width: totalWidth }}>
              لا توجد مشاريع مطابقة للفلاتر الحالية.
            </div>
          )}
        </div>
      </div>

      <div className="board-footer">
        <div className="board-footer-legend">
          <span>الخط المنقط الأخضر يفصل بين <b>الماضي</b> و <b>المشاريع المستقبلية</b>.</span>
          <span>الأشرطة الجانبية على اليمين <b>قابلة للنقر</b> لفتح بطاقة المشروع.</span>
          <span>الأسهم الجانبية (➔ و ⬅) تشير للمشاريع الواقعة خارج حدود الشاشة الحالية وتنقلك إليها بنقرة واحدة.</span>
        </div>
      </div>
    </div>
  );
}
