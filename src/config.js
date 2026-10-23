/**
 * Display configuration lives here; timeline content lives in ../projects.json.
 * The "as-of" marker is fixed because the dataset was researched at that date.
 */
export const DATA_AS_OF = '2026-10-23';
export const MIN_YEAR = 1930;
export const MAX_YEAR = 2035;
export const DEFAULT_ZOOM = 58;
export const MIN_ZOOM = 24;
export const MAX_ZOOM = 140;

export const GROUPS = [
  { id: 'companies', name: 'شركات وشراكات', icon: '◈' },
  { id: 'factories', name: 'مصانع وتوسعات', icon: '▣' },
  { id: 'infrastructure', name: 'نقل وبنية تحتية', icon: '↔' },
  { id: 'water', name: 'مشاريع المياه', icon: '◉' },
  { id: 'environment', name: 'بيئة وتأهيل', icon: '✿' },
  { id: 'historic', name: 'المناجم والمرافق التاريخية', icon: '▥' },
];

export const STATUSES = {
  operating: { name: 'قائم ويعمل', color: '#27caa7' },
  building: { name: 'قيد الإنشاء أو التنفيذ', color: '#65a4fa' },
  planned: { name: 'مخطط أو معلن', color: '#ba91fa' },
  completed: { name: 'مكتمل', color: '#eeb763' },
  stopped: { name: 'متوقف', color: '#e97881' },
  ended: { name: 'انتهت الشراكة / صُفّي', color: '#e97881' },
  unknown: { name: 'النشاط غير مؤكد', color: '#8a94a8' },
};

export const CLOSED_STATUSES = ['ended', 'stopped', 'completed'];
