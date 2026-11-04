import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import {deriveSceneTimeline} from '../../src/sceneTimeline.mjs';
const dir='dist/time-patina-paper/';
const p=JSON.parse(await fs.readFile('projects/time-patina-paper/project.json','utf8'));
const plan=JSON.parse(await fs.readFile('projects/time-patina-paper/continuous-v6-plan.json','utf8'));
const timeline=deriveSceneTimeline(p);
const target=dir+'v6-encoded-check';await fs.mkdir(target,{recursive:true});
const video=dir+'preview.mp4';
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',video],{encoding:'utf8'}));
let count=0;
async function sheet(samples,name,cols=4){
  const images=[];
  for(const sample of samples){
    const file=path.join(target,`${String(count++).padStart(3,'0')}.jpg`);
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(sample.time),'-i',video,'-frames:v','1','-vf','scale=480:270',file]);
    const i=images.length;images.push({input:file,left:i%cols*480,top:Math.floor(i/cols)*296});
    const label=Buffer.from(`<svg width="480" height="26"><rect width="480" height="26" fill="#26211b"/><text x="10" y="18" font-family="Arial" font-size="13" fill="#e9dfc8">${sample.label} | ${sample.time.toFixed(2)}s</text></svg>`);
    sample.labelImage={input:label,left:i%cols*480,top:Math.floor(i/cols)*296+270};
  }
  await sharp({create:{width:cols*480,height:Math.ceil(samples.length/cols)*296,channels:3,background:'#26211b'}})
    .composite([...images,...samples.map(s=>s.labelImage)]).jpeg({quality:89}).toFile(dir+name+'.jpg');
  return samples.map(({labelImage,...s})=>s);
}
const shots=[];
for(const [i,s] of timeline.scenes.entries()){
  const positions=plan.changes[i].cameraWaypoints;
  positions.forEach((t,j)=>shots.push({time:s.from/30+(t+(positions[j+1]??s.narration.durationSeconds))/2,label:`chapter ${i+1} / framing ${j+1}`}));
}
const shotSamples=await sheet(shots,'v6-26-framings',4);
const boundarySamples=[];
for(const [i,t] of timeline.transitions.entries())for(const u of [0,.33,.66,1])boundarySamples.push({time:(t.from+Math.round((t.durationInFrames-1)*u))/30,label:`boundary ${i+1} / ${t.treatment.type} / ${Math.round(u*100)}%`});
await sheet(boundarySamples.slice(0,16),'v6-boundaries-1',4);
await sheet(boundarySamples.slice(16),'v6-boundaries-2',4);
const actions=[];
for(const index of [0,2,6]){
  const s=timeline.scenes[index];const hero=s.composition.nodes.find(n=>n.id==='paper-person');
  const at=hero.states[1].at*s.durationInFrames/30;
  for(const dt of [-.2,0,.25,.5,.8,1.1,1.5,2])actions.push({time:s.from/30+at+dt,label:`chapter ${index+1} / action ${dt.toFixed(2)}`});
}
await sheet(actions.slice(0,16),'v6-actions-1',4);
await sheet(actions.slice(16),'v6-actions-2',4);
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',video,'-f','null','-']);
const v=probe.streams.find(s=>s.codec_type==='video');
await fs.writeFile(dir+'v6-encoded-review.json',JSON.stringify({duration:probe.format.duration,width:v.width,height:v.height,fps:v.avg_frame_rate,decoded:true,shotSamples,boundaries:boundarySamples.map(({labelImage,...s})=>s),actions:actions.map(({labelImage,...s})=>s)},null,2));
console.log('v6 encoded QA: 26 framings, all 7 boundaries, 3 action progressions; full decode passed.');
