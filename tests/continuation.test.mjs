import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { selectNextPhase, renderPrompt, synchronize } from '../scripts/continuation.mjs';

const task = status => ({ id: 'build', status, description: 'Build the service', acceptance: 'Run integration checks' });
const plan = () => ({ phases: [
  { id: 1, name: 'Foundation', tasks: [task('implemented')] },
  { id: 2, name: 'Engine', tasks: [task('pending')] },
] });

test('implemented and blocked tasks keep the current phase open', () => {
  const input = plan();
  assert.equal(selectNextPhase(input).id, 1);
  input.phases[0].tasks[0].status = 'blocked';
  assert.equal(selectNextPhase(input).id, 1);
  input.phases[0].tasks[0].status = 'done';
  assert.equal(selectNextPhase(input).id, 2);
});

test('all done yields a review directive rather than an invented phase', () => {
  const input = plan();
  input.phases.forEach(phase => phase.tasks.forEach(item => { item.status = 'done'; }));
  assert.equal(selectNextPhase(input), null);
  assert.match(renderPrompt(input, {}), /Review remaining risks/);
});

test('invalid statuses and phase ordering fail instead of skipping work', () => {
  const input = plan();
  input.phases[0].tasks[0].status = 'finished';
  assert.throws(() => selectNextPhase(input), /valid status/);
  const unordered = plan();
  unordered.phases.reverse();
  assert.throws(() => selectNextPhase(unordered), /ascending/);
});

test('handoff includes outstanding checks, blockers, and validation evidence', () => {
  const output = renderPrompt(plan(), { blockers: ['No database'], validation: ['Build pending'], inference_endpoint_status: 'not_implemented' });
  assert.match(output, /Run integration checks/);
  assert.match(output, /No database/);
  assert.match(output, /Build pending/);
  assert.match(output, /not_implemented/);
  assert.doesNotMatch(output, /Continue Phase 2/);
});

test('production vision and later roadmap do not advance the current phase', () => {
  const input = plan();
  input.vision = 'Native Bangla creator platform';
  input.architecture_boundaries = ['Keep inference behind the API'];
  input.production_acceptance = ['Prove owner isolation'];
  const output = renderPrompt(input, {
    deployment_summary: 'UI live by user report; API unverified',
    immediate_next_steps: ['Verify the isolated development branch'],
  });
  for (const expected of ['Continue Phase 1', 'Native Bangla creator platform',
    'Keep inference behind the API', 'Prove owner isolation', 'Phase 2: Engine',
    'Verify the isolated development branch', 'UI live by user report']) {
    assert.ok(output.includes(expected));
  }
  assert.doesNotMatch(output, /Continue Phase 2/);
  assert.equal(selectNextPhase(input).id, 1);
});

test('generation synchronizes both outputs and check detects subsequent drift', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'shobdo-continuation-'));
  try {
    await mkdir(path.join(directory, 'memory'));
    const planPath = path.join(directory, 'memory/DEVELOPMENT_PLAN.json');
    const memoryPath = path.join(directory, 'memory/PROJECT_MEMORY_GRAPH.json');
    const input = plan();
    await writeFile(planPath, JSON.stringify(input));
    await writeFile(memoryPath, JSON.stringify({ blockers: [], validation: [] }));
    await assert.rejects(synchronize(directory, true), /stale/);
    await synchronize(directory);
    await synchronize(directory, true);
    const memory = JSON.parse(await readFile(memoryPath, 'utf8'));
    assert.equal(memory.next_agent_prompt, await readFile(path.join(directory, 'memory/CONTINUATION_PROMPT.md'), 'utf8'));
    input.phases[0].tasks[0].status = 'done';
    await writeFile(planPath, JSON.stringify(input));
    await assert.rejects(synchronize(directory, true), /stale/);
    await synchronize(directory);
    await synchronize(directory, true);
    assert.match(JSON.parse(await readFile(memoryPath, 'utf8')).current_phase, /^Phase 2/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
