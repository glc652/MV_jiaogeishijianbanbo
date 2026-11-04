import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {validateStateSheetSpec, createStateFamilyFingerprint} from '../../scripts/state-sheet-lib.mjs';
const spec = JSON.parse(await fs.readFile(new URL('person-sheet-process.json', import.meta.url), 'utf8'));
assert.deepEqual(validateStateSheetSpec(spec), []);
for (const state of spec.states) {
  const file = `${spec.outputDirectory}/${spec.poseFamilyId}-${state.id}.png`;
  const metadata = await sharp(file).metadata();
  assert.equal(metadata.width, 627);
  assert.equal(metadata.height, 627);
  assert.equal(metadata.hasAlpha, true);
  const processing = JSON.parse(await fs.readFile(`${file}.key.json`, 'utf8'));
  const {left, top, width, height} = processing.rasterPlacement;
  const t = state.registrationTransform;
  const anchor = state.anchors.find(a => a.id === t.anchorId);
  assert.ok(Math.abs(left + t.sourceContact.x * width - anchor.x * 627) <= 0.5);
  assert.ok(Math.abs(top + t.sourceContact.y * height - anchor.y * 627) <= 0.5);
  assert.ok(left >= 0 && top >= 0 && left + width <= 627 && top + height <= 627);
}
const invalid = structuredClone(spec);
invalid.states[0].registrationTransform.scale = -1;
assert.ok(validateStateSheetSpec(invalid).length > 0);
const modified = structuredClone(spec);
modified.states[0].registrationTransform.scale = 0.62;
assert.notEqual(createStateFamilyFingerprint({sourceSha256:'a', spec, members:[]}),
  createStateFamilyFingerprint({sourceSha256:'a', spec:modified, members:[]}));
console.log('PASS: three full alpha canvases; measured contact alignment within 0.5 px; invalid scale rejected; normalization fingerprinted.');
