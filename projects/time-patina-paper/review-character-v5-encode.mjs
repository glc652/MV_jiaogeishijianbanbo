import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const out='dist/time-patina-paper/',dir=out+'character-v5-motion-frames/';
await fs.mkdir(dir,{recursive:true});
const report=JSON.parse(await fs.readFile(out+'validation-report.json','utf8'));
const fps=30,scenes=report.timeline.scenes;
const groups=[0,1,2,5,7].map(index=>{
 const scene=scenes[index],node=scene.composition.nodes.find(n=>n.id==='paper-person');
 const start=Math.round(scene.from+.44*(scene.durationInFrames-1));
 const span=Math.max(6,Math.ceil(node.transition.durationSeconds*fps));
 return {sceneId:scene.id,start,frames:[-2,0,.2,.4,.6,.8,1,1.3].map(v=>v===-2?start-2:start+Math.round(span*v))};
});
const all=[...new Set(groups.flatMap(g=>g.frames))].sort((a,b)=>a-b);
const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',out+'preview.mp4','-vf',`select=${all.map(n=>`eq(n\\,${n})`).join('+')},scale=640:360`,'-fps_mode','vfr',dir+'frame-%03d.png'],{encoding:'utf8'});
if(result.status!==0)throw new Error(result.stderr||result.error?.message);
for(const [gindex,g]of groups.entries()){
 const overlays=[];for(const[i,n]of g.frames.entries()){
  const src=dir+`frame-${String(all.indexOf(n)+1).padStart(3,'0')}.png`;
  overlays.push({input:await fs.readFile(src),left:(i%2)*640,top:Math.floor(i/2)*390});
  overlays.push({input:Buffer.from(`<svg width="640" height="30"><rect width="640" height="30" fill="#25221e"/><text x="14" y="21" fill="#efe3c8" font-size="18">${g.sceneId} | ${(n/fps).toFixed(3)}s | frame ${n}</text></svg>`),left:(i%2)*640,top:Math.floor(i/2)*390+360});
 }
 await sharp({create:{width:1280,height:1560,channels:3,background:'#25221e'}}).composite(overlays).jpeg({quality:93}).toFile(out+`character-v5-motion-${gindex+1}.jpg`);
}
await fs.writeFile(out+'character-v5-motion-samples.json',JSON.stringify({source:'preview.mp4',groups,frameCount:all.length,visualReview:'pending'},null,2));
console.log(`Extracted ${all.length} encoded frames over 5 character transitions; visual review required.`);
