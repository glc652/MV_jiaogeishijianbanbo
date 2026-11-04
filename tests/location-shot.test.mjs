import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveLocationShot} from '../src/locationShot.mjs';
const shot={startSeconds:5,endSeconds:12,transitionSeconds:.7,transition:'dissolve',camera:{from:{x:-12,y:-3,zoom:1.04},to:{x:18,y:-10,zoom:1.095}}};
test('cutaway is confined to its song interval with continuous entrances and exits',()=>{
 assert.equal(resolveLocationShot(shot,4.99).active,false);
 assert.equal(resolveLocationShot(shot,12).active,false);
 assert.equal(resolveLocationShot(shot,5).opacity,0);
 assert.equal(resolveLocationShot(shot,8).opacity,1);
 assert.ok(resolveLocationShot(shot,11.99).opacity<.001);
 for(let f=151;f<360;f++){
  const a=resolveLocationShot(shot,(f-1)/30),b=resolveLocationShot(shot,f/30);
  assert.ok(Math.abs(a.x-b.x)<.22);assert.ok(Math.abs(a.zoom-b.zoom)<.001);
 }
});
test('wipe always retains a real incoming/outgoing image without a blank cover',()=>{
 for(const transition of ['wipe-left','wipe-up']){
  const s={...shot,transition};assert.equal(resolveLocationShot(s,8).clipPath,transition==='wipe-left'?'inset(0 0% 0 0%)':'inset(0% 0 0% 0)');
  assert.equal(resolveLocationShot(s,5).opacity,1);
 }
});
test('all authored location inserts preserve the main action windows and chapter bounds',()=>{
 const p=JSON.parse(fs.readFileSync('projects/time-patina-paper/project.json','utf8'));
 for(const scene of p.scenes){
  const duration=scene.narration.durationSeconds+scene.tailSeconds;
  const inserts=scene.composition.nodes.filter(n=>n.locationShot).map(n=>n.locationShot).sort((a,b)=>a.startSeconds-b.startSeconds);
  for(const [i,s]of inserts.entries()){
   assert.ok(s.endSeconds<duration,`${scene.id} chapter bounds`);
   if(i)assert.ok(inserts[i-1].endSeconds<s.startSeconds);
   for(const node of scene.composition.nodes.filter(n=>n.kind==='state-sequence'))for(const state of node.states.slice(1)){
    const start=state.at*duration,end=start+node.transition.durationSeconds;
    assert.ok(s.endSeconds<=start || s.startSeconds>=end,`${scene.id}: ${s.label} conceals ${node.id}/${state.id}`);
   }
  }
 }
});
