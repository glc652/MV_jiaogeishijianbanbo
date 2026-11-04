import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='projects/time-patina-paper/';
const p=JSON.parse(await fs.readFile(dir+'project.json'));
const plan=JSON.parse(await fs.readFile(dir+'poetic-shot-plan.json'));
const checks=[];
for(const s of p.scenes){
 const nodes=s.composition.nodes.find(n=>n.id.startsWith('animated-ensemble')).children;
 for(const n of nodes){
  const keys=n.motion.keyframes;
  if(/^(rain|leaf|petal|letter)-/.test(n.id)){
   for(let i=1;i<keys.length;i++)if(keys[i].offsetY<keys[i-1].offsetY){
    assert.ok((keys[i].opacity??1)<.04&&(keys[i-1].opacity??1)<.04,`${n.id} visible wrap`);
   }
   checks.push(`${s.id}/${n.id}: downward travel; reset only while invisible`);
  }
  if(n.id.startsWith('bird-')||n.id.startsWith('boat-')||n.id.startsWith('cloud-')){
   for(let i=1;i<keys.length;i++)assert.ok(keys[i].offsetX>=keys[i-1].offsetX-1e-8,`${n.id} horizontal reversal`);
   checks.push(`${s.id}/${n.id}: continuous one-way travel`);
  }
  if(n.id.startsWith('boat-'))assert.ok(keys.every(k=>Math.abs(k.offsetY)<=.00601&&Math.abs(k.rotation)<=2.501),'boat leaves wave envelope');
  if(n.id.startsWith('memory-photo-'))assert.ok(keys.every(k=>Math.abs(k.offsetY)<=.00801),'photo floating');
 }
}
assert.equal(plan.shots.length,25);
assert.ok(plan.shots.every(s=>s.durationSeconds>5&&s.durationSeconds<11));
for(let i=1;i<plan.shots.length;i++)assert.ok(Math.abs(plan.shots[i].fromSeconds-plan.shots[i-1].toSeconds)<.001,'shot gap');
await fs.writeFile(dir+'poetic-motion-check.json',JSON.stringify({passed:true,checks,shotCount:25,scope:'Numeric trajectory checks; visual judgment remains required.'},null,2));
console.log(`${checks.length} trajectory checks passed; 25 contiguous shots, each 5–11 seconds.`);
