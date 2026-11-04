import fs from 'node:fs/promises';
const dir = new URL('./', import.meta.url);
const read = async name => JSON.parse(await fs.readFile(new URL(name, dir), 'utf8'));
const write = (name, data) => fs.writeFile(new URL(name, dir), JSON.stringify(data, null, 2));
const spec = await read('person-sheet-process.json');
const measured = [[0.63, 332, 568], [0.63, 300, 568], [0.90, 343, 602]];
spec.states.forEach((state, i) => {
  const [scale, x, y] = measured[i];
  state.registrationTransform = {scale, anchorId: 'contact', sourceContact: {x: x / 627, y: y / 627}};
});
await write('person-sheet-process.json', spec);
const storyboard = await read('storyboard.json');
for (const beat of storyboard.scenes.find(s => s.id === 'balanced-scene-07').beats) {
  for (const t of beat.treatments) {
    if (t.motion.kind === 'state-sequence') t.motion.transition = 'crossfade';
  }
}
await write('storyboard-motion-revision.json', storyboard);
