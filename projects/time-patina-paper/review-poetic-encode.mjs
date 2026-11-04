import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import assert from 'node:assert/strict';
const dir='projects/time-patina-paper/',out='dist/time-patina-paper/';
const plan=JSON.parse(await fs.readFile(dir+'poetic-shot-plan.json'));
const target=out+'poetic-encoded-frames/';await fs.mkdir(target,{recursive:true});
const mids=plan.shots.map(s=>Math.round((s.fromSeconds+s.durationSeconds*.5)*30));
const cuts=plan.shots.filter(s=>s.entry==='lyric-phrase-cut').map(s=>Math.round(s.fromSeconds*30));
const frames=[...new Set([...mids,...cuts.flatMap(n=>[n-2,n,n+2])])].sort((a,b)=>a-b);
const select=frames.map(n=>`eq(n\\,${n})`).join('+');
const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',out+'preview.mp4','-vf',`select=${select},scale=480:270`,'-fps_mode','vfr',target+'frame-%03d.png'],{encoding:'utf8'});
if(result.status!==0)throw new Error(result.stderr||result.error?.message);
const imageFor=n=>target+`frame-${String(frames.indexOf(n)+1).padStart(3,'0')}.png`;
const checks=[];
for(const frame of mids){const stats=await sharp(imageFor(frame)).stats();assert.ok(stats.channels.slice(0,3).some(c=>c.stdev>15),`Possible blank scene at frame ${frame}`);checks.push({frame,seconds:frame/30,channelDeviation:stats.channels.slice(0,3).map(c=>c.stdev)});}
async function sheet(items,columns,file){
 const cols=columns,rows=Math.ceil(items.length/cols),w=480,h=298;
 const overlays=[];
 for(const [i,item]of items.entries()){
  overlays.push({input:await fs.readFile(imageFor(item.frame)),left:(i%cols)*w,top:Math.floor(i/cols)*h});
  const label=Buffer.from(`<svg width="480" height="28"><rect width="480" height="28" fill="#27231e"/><text x="12" y="19" fill="#eee2ca" font-family="Arial" font-size="15">${item.label}</text></svg>`);
  overlays.push({input:label,left:(i%cols)*w,top:Math.floor(i/cols)*h+270});
 }
 await sharp({create:{width:cols*w,height:rows*h,channels:3,background:'#27231e'}}).composite(overlays).jpeg({quality:92}).toFile(out+file);
}
await sheet(mids.map((frame,i)=>({frame,label:`${plan.shots[i].id} | ${(frame/30).toFixed(2)}s`})),5,'poetic-25-shots.jpg');
for(let page=0;page<3;page++)await sheet(cuts.slice(page*6,page*6+6).flatMap(n=>[-2,0,2].map(k=>({frame:n+k,label:`cut ${(n/30).toFixed(2)}s | ${k<0?'before':k===0?'at':'after'}`}))),3,`poetic-cut-check-${page+1}.jpg`);
await fs.writeFile(out+'poetic-encoded-check.json',JSON.stringify({passed:true,midShotFrames:25,internalCuts:cuts.length,checks},null,2));
console.log('Extracted 25 encoded shots and 17 internal-cut triplets; no blank mid-shot frames.');
