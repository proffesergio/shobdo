import { readFile } from 'node:fs/promises';

const plan = JSON.parse(await readFile(new URL('../memory/DEVELOPMENT_PLAN.json', import.meta.url), 'utf8'));
const phase = plan.phases.find(item => item.id === 1);
if (!phase?.tasks.length) throw new Error('Phase 1 acceptance plan is missing.');
const unfinished = phase.tasks.filter(task => task.status !== 'done');
if (unfinished.length) {
  console.error(`Deployment blocked: Phase 1 acceptance remains unfinished: ${unfinished.map(task => task.id).join(', ')}. See memory/CONTINUATION_PROMPT.md.`);
  process.exitCode = 1;
} else {
  console.log('Recorded Phase 1 acceptance checks are complete.');
}
