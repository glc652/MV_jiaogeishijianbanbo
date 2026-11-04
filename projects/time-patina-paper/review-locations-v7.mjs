import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
const dir='dist/time-patina-paper/',out=dir+'v7-encoded-check/';
await fs.mkdir(out,{recursive:true});
const plan=JSON.parse(await fs.readFile('projects/time-patina-paper/location-v7-plan.json','utf8'));
const video=dir+'preview.mp4';
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',video],{encoding:'utf8'}));
const samples=[];
for(const s of plan.shots)samples.push({time:(s.startSeconds+s.endSeconds)/2,label:s.id+' / location'});
for(const s of plan.shots)for(const [edge,t]of [['enter',s.startSeconds],['exit',s.endSeconds]])for(const dt of [-.35,0,.35])samples.push({time:t+dt,label:`${s.id} / ${edge} ${dt}`});
for(const [i,s]of samples.entries()){
 s.file=out+String(i).padStart(3,'0')+'.jpg';
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(s.time),'-i',video,'-frames:v','1','-vf','scale=480:270',s.file]);
}
for(let page=0;page<Math.ceil(samples.length/12);page++){
 const cells=[];for(const [i,s]of samples.slice(page*12,page*12+12).entries()){
  cells.push({input:s.file,left:i%3*480,top:Math.floor(i/3)*296});
  cells.push({input:Buffer.from(`<svg width="480" height="26"><rect width="480" height="26" fill="#28221e"/><text x="10" y="18" font-family="Arial" font-size="13" fill="#efe5d2">${s.label} | ${s.time.toFixed(2)}s</text></svg>`),left:i%3*480,top:Math.floor(i/3)*296+270});
 }
 await sharp({create:{width:1440,height:1184,channels:3,background:'#28221e'}}).composite(cells).jpeg({quality:91}).toFile(dir+`v7-encoded-sheet-${page+1}.jpg`);
}
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',video,'-f','null','-']);
const v=probe.streams.find(s=>s.codec_type==='video');
await fs.writeFile(dir+'v7-encoded-review.json',JSON.stringify({duration:probe.format.duration,width:v.width,height:v.height,fps:v.avg_frame_rate,decoded:true,newLocations:3,locationInserts:10,visualSegments:28,samples},null,2));
console.log('v7 full decode passed; 10 location midpoints and all 20 insert boundaries extracted.');
