import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projects = JSON.parse(readFileSync(resolve('projects.json'), 'utf8'));
const statuses = new Set(['operating', 'building', 'planned', 'completed', 'stopped', 'ended', 'unknown']);
const groups = new Set(['companies', 'factories', 'infrastructure', 'water', 'environment', 'historic']);
const ids = new Set();
const errors = [];

if (!Array.isArray(projects)) errors.push('projects.json must contain an array.');
else projects.forEach((project, index) => {
  const prefix = `Entry #${index + 1} (${project?.id ?? 'no id'})`;
  if (typeof project.id !== 'string' || !project.id.trim()) errors.push(`${prefix}: missing id`);
  if (ids.has(project.id)) errors.push(`${prefix}: duplicate id`);
  ids.add(project.id);
  if (typeof project.name !== 'string' || !project.name.trim()) errors.push(`${prefix}: missing name`);
  if (!statuses.has(project.status)) errors.push(`${prefix}: invalid status`);
  if (!groups.has(project.group)) errors.push(`${prefix}: invalid group`);
  if (!Number.isFinite(project.start) || project.start < 1930 || project.start > 2035) errors.push(`${prefix}: invalid start`);
  if (project.end !== null && (!Number.isFinite(project.end) || project.end < project.start || project.end > 2035)) errors.push(`${prefix}: invalid end`);
  if (typeof project.startText !== 'string' || !project.startText.trim()) errors.push(`${prefix}: missing startText`);
  if (typeof project.detail !== 'string') errors.push(`${prefix}: detail must be text`);
});

if (errors.length) {
  console.error(`Data validation failed (${errors.length} errors):\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`✓ Validated ${projects.length} timeline records across ${groups.size} categories.`);
}
