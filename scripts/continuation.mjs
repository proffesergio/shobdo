import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const statuses = new Set(['pending', 'implemented', 'blocked', 'done']);

export function selectNextPhase(plan) {
  if (!Array.isArray(plan.phases) || plan.phases.length === 0) throw new Error('Plan needs phases');
  let previous = 0;
  for (const phase of plan.phases) {
    if (!Number.isInteger(phase.id) || phase.id <= previous || !phase.name || !phase.tasks?.length) {
      throw new Error('Phases must have ascending integer IDs, names, and tasks');
    }
    previous = phase.id;
    const ids = new Set();
    for (const task of phase.tasks) {
      if (!task.id || ids.has(task.id) || !statuses.has(task.status) || !task.description || !task.acceptance) {
        throw new Error('Every task needs a unique ID, valid status, description, and acceptance checks');
      }
      ids.add(task.id);
    }
  }
  return plan.phases.find(phase => phase.tasks.some(task => task.status !== 'done')) ?? null;
}

export function renderPrompt(plan, memory) {
  const phase = selectNextPhase(plan);
  const lines = [
    '# Shobdo continuation prompt', '',
    'Read AGENTS.md, PROJECT_SYSTEM_PROMPT.md, memory/PROJECT_MEMORY_GRAPH.json, memory/DEVELOPMENT_PLAN.json, and docs/PRODUCTION_ROADMAP.md before editing.', '',
    phase ? `Continue Phase ${phase.id}: ${phase.name}.` : 'All planned phases are marked complete. Review remaining risks and validation evidence before proposing new scope.',
    'Preserve native SSM architecture. Report scaffolding, mocks, and real inference accurately. Do not advance phases until acceptance checks pass.', '',
    `Recorded active feature: ${memory.active_feature ?? 'none'}`,
    `Inference status: ${memory.inference_endpoint_status ?? 'unknown'}`,
  ];
  if (memory.deployment_summary) lines.push(`Deployment state: ${memory.deployment_summary}`);
  if (plan.vision) lines.push('', `Production vision: ${plan.vision}`);
  if (plan.architecture_boundaries?.length) {
    lines.push('', 'Architecture boundaries:', ...plan.architecture_boundaries.map(item => `- ${item}`));
  }
  lines.push('', 'Outstanding tasks and acceptance checks:');
  const tasks = phase?.tasks.filter(task => task.status !== 'done') ?? [];
  lines.push(...(tasks.length ? tasks.flatMap(task => [
    `- [${task.status}] ${task.id}: ${task.description}`,
    `  Acceptance: ${task.acceptance}`,
  ]) : ['- No unfinished planned tasks.']));
  if (memory.immediate_next_steps?.length) {
    lines.push('', 'Concrete next actions:', ...memory.immediate_next_steps.map((item, index) => `${index + 1}. ${item}`));
  }
  const future = phase ? plan.phases.filter(item => item.id > phase.id) : [];
  if (future.length) {
    lines.push('', 'Remaining delivery roadmap (planned; start each phase only after the preceding acceptance gate):');
    for (const item of future) {
      lines.push(`Phase ${item.id}: ${item.name}`,
        ...item.tasks.flatMap(task => [`- [${task.status}] ${task.id}: ${task.description}`, `  Acceptance: ${task.acceptance}`]));
    }
  }
  if (plan.production_acceptance?.length) {
    lines.push('', 'Production readiness requires evidence for every gate:', ...plan.production_acceptance.map(item => `- ${item}`));
  }
  lines.push('', 'Recorded blockers:', ...(memory.blockers?.length ? memory.blockers.map(item => `- ${item}`) : ['- None recorded.']), '', 'Recorded validation:');
  lines.push(...(memory.validation?.length ? memory.validation.map(item => `- ${typeof item === 'string' ? item : JSON.stringify(item)}`) : ['- No validation recorded.']));
  lines.push('', 'Start with the earliest unfinished task that can be progressed. Resolve missing verification before claiming completion. Keep credentials private; use an isolated development database for migrations.', '',
    'Before ending: update the plan and memory with observed results, run npm run continuation, npm test, and npm run continuation:check, then link this prompt in the final response.');
  return lines.join('\n') + '\n';
}

export async function synchronize(directory = root, check = false) {
  const memoryPath = path.join(directory, 'memory/PROJECT_MEMORY_GRAPH.json');
  const plan = JSON.parse(await readFile(path.join(directory, 'memory/DEVELOPMENT_PLAN.json'), 'utf8'));
  const memory = JSON.parse(await readFile(memoryPath, 'utf8'));
  const prompt = renderPrompt(plan, memory);
  const phase = selectNextPhase(plan);
  const currentPhase = phase ? `Phase ${phase.id}: ${phase.name}` : 'All planned phases complete; review pending';
  const promptPath = path.join(directory, 'memory/CONTINUATION_PROMPT.md');
  if (check) {
    const existing = await readFile(promptPath, 'utf8').catch(() => '');
    if (existing !== prompt || memory.next_agent_prompt !== prompt || memory.current_phase !== currentPhase) {
      throw new Error('Continuation is stale. Update plan/memory and run npm run continuation.');
    }
    return;
  }
  memory.current_phase = currentPhase;
  memory.next_agent_prompt = prompt;
  memory.last_updated = new Date().toISOString();
  await writeFile(promptPath, prompt, 'utf8');
  await writeFile(memoryPath, JSON.stringify(memory, null, 2) + '\n', 'utf8');
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  synchronize(root, process.argv.includes('--check')).then(() => {
    console.log(process.argv.includes('--check') ? 'Continuation is current.' : 'Continuation prompt and project memory updated.');
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
