import { CLOSED_STATUSES, GROUPS, MAX_YEAR, MIN_YEAR } from '../config.js';

export function yearFractionFromDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return year + (date - start) / (end - start);
}

export function getTickYears(zoom) {
  const years = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
    const oldDecade = year < 2000 && year % 10 === 0;
    const modernTick = year >= 2000 && year % (zoom >= 70 ? 2 : 5) === 0;
    if (oldDecade || modernTick) years.push(year);
  }
  return years;
}

export function filterProjects(projects, filters) {
  const query = filters.query.trim().toLocaleLowerCase('ar');
  return projects.filter((project) => {
    if (filters.category !== 'all' && project.group !== filters.category) return false;
    if (filters.status === 'closed') {
      if (!CLOSED_STATUSES.includes(project.status)) return false;
    } else if (filters.status !== 'all' && project.status !== filters.status) {
      return false;
    }
    if (!query) return true;
    return [project.name, project.detail, project.partner, project.share]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('ar')
      .includes(query);
  }).sort((a, b) => a.start - b.start || a.name.localeCompare(b.name, 'ar'));
}

/** Group headings and items share the same visual row order on both sides. */
export function createRows(projects) {
  return GROUPS.flatMap((group) => {
    const members = projects.filter((item) => item.group === group.id);
    return members.length
      ? [{ type: 'group', group, count: members.length }, ...members.map((item) => ({ type: 'item', item }))]
      : [];
  });
}

/** Planned and unknown open-ended entries are point-in-time announcements. */
export function isMilestone(project) {
  return project.end == null && (
    project.status === 'planned' ||
    project.status === 'unknown' ||
    (project.status === 'stopped' && project.start < 2000)
  );
}
