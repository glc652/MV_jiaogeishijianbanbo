import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
const p=JSON.parse(await fs.readFile('projects/time-patina-paper/project.json','utf8'));
const plan=JSON.parse(await fs.readFile('projects/time-patina-paper/location-v7-plan.json','utf8'));
const out='dist/time-patina-paper/v7-location-proof';await fs.mkdir(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),outDir:path.resolve('dist/v7-proof-bundle')});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE});
try{
 const composition=await selectComposition({serveUrl,id:'Paper-Collage',inputProps:p,puppeteerInstance:browser});
 const samples=plan.shots.map(s=>({time:(s.startSeconds+s.endSeconds)/2,label:s.id+' / '+s.asset}));
 for(const i of [0,2,4])for(const dt of [-.1,.2,.5,.9])samples.push({time:plan.shots[i].startSeconds+dt,label:`${plan.shots[i].id} / enter ${dt}`});
 for(let i=0;i<samples.length;i+=2)await Promise.all(samples.slice(i,i+2).map(async(sample,j)=>{
  sample.file=path.join(out,`${String(i+j).padStart(2,'0')}.jpg`);
  await renderStill({serveUrl,composition,inputProps:p,frame:Math.round(sample.time*30),output:sample.file,imageFormat:'jpeg',scale:.5,puppeteerInstance:browser,logLevel:'error'});
 }));
 for(let page=0;page<Math.ceil(samples.length/8);page++){
  const cells=[];for(const [i,s]of samples.slice(page*8,page*8+8).entries()){
   cells.push({input:await sharp(s.file).resize(480,270).toBuffer(),left:(i%2)*480,top:Math.floor(i/2)*296});
   cells.push({input:Buffer.from(`<svg width="480" height="26"><rect width="480" height="26" fill="#28221e"/><text x="10" y="18" fill="#eee2ce" font-size="13" font-family="Arial">${s.label} | ${s.time.toFixed(2)} s</text></svg>`),left:i%2*480,top:Math.floor(i/2)*296+270});
  }
  await sharp({create:{width:960,height:1184,channels:3,background:'#28221e'}}).composite(cells).jpeg({quality:91}).toFile(`${out}/sheet-${page+1}.jpg`);
 }
 await fs.writeFile(`${out}/samples.json`,JSON.stringify(samples,null,2));
 console.log(`Rendered ${samples.length} location and transition proof frames.`);
}finally{await browser.close({silent:true});}
