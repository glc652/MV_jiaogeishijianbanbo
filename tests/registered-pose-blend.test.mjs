import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import {validateCompositionStructure} from '../scripts/composition-lib.mjs';
import {resolveSequenceLayers} from '../scripts/state-sequence-lib.mjs';

const project = JSON.parse(await fs.readFile(new URL('../projects/time-patina-paper/project.json', import.meta.url), 'utf8'));
const scene = project.scenes.find(s => s.id === 'balanced-scene-07');
const node = scene.composition.nodes.find(n => n.id === 'paper-person');
const registrationErrors = composition => validateCompositionStructure({composition, video:{width:1920,height:1080}}).issues.filter(i => i.code === 'composition-sequence-registration-bands');
test('registered bands validate complete monotonic source rows', () => {
  assert.deepEqual(registrationErrors(scene.composition), []);
  const bad = structuredClone(scene.composition);
  bad.nodes.find(n=>n.id===node.id).transition.registrationBands.rising[2] = .1;
  assert.equal(registrationErrors(bad).length, 1);
});
test('pose blend has continuous head motion, fixed ground and complete terminal state', () => {
  let previousTop = Infinity;
  for(let frame=0; frame<=18; frame++) {
    const progress = .74 + frame / 30 / 5;
    const layers = resolveSequenceLayers({node,progress,durationSeconds:5});
    const weight = layers.reduce((sum,l)=>sum+l.opacity,0);
    assert.ok(Math.abs(weight-1)<1e-9);
    const top = layers.reduce((sum,l)=>sum+node.transition.registrationBands[l.id][1]*l.opacity,0);
    const ground = layers.reduce((sum,l)=>sum+node.transition.registrationBands[l.id][5]*l.opacity,0);
    assert.ok(top<=previousTop);
    assert.ok(Math.abs(ground-.88)<1e-9);
    previousTop=top;
  }
  assert.deepEqual(resolveSequenceLayers({node,progress:.89,durationSeconds:5}).map(l=>l.id),['upright']);
});
