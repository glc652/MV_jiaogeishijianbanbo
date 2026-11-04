import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
const d='projects/time-patina-paper/',a='public/projects/time-patina-paper/assets/story-props/';
const p=JSON.parse(await fs.readFile(d+'project.json'));
const sb=storyboardAuthoringFromCompiled(JSON.parse(await fs.readFile(d+'storyboard.json')));
// Objects rest beside the protagonist, with a larger album only for the collecting shot.
const layouts=[[.77,.74,.15],[.78,.74,.15],[.26,.74,.15],[.77,.73,.15],[.74,.785,.17],[.76,.73,.25],[.80,.74,.15],[.65,.785,.16]];
for(let i=0;i<8;i++){
 const s=p.scenes[i], [x,y,w]=layouts[i], album=s.composition.nodes.find(n=>n.id==='memory-album');
 album.transform={...album.transform,x,y,width:w,height:w*1.185185};
 const bookmark=s.composition.nodes.find(n=>n.id==='memory-bookmark');
 bookmark.transform={...bookmark.transform,x:x+w*.23,y:y-.024,width:.022,height:.026};
 const letter=s.composition.nodes.find(n=>n.id==='kept-letter');
 if(letter)letter.transform={...letter.transform,x:x-w*.34,y:y-.020,width:i===5?.105:.085,height:(i===5?.105:.085)*1920/1080};
 for(const beat of sb.scenes[i].beats)for(const t of beat.treatments)if(['memory-album','kept-letter','memory-bookmark'].includes(t.targetId))t.rationale+=' 道具缩小并移至人物侧边；相册以纸纹和照片装饰，主体无遮挡。';
 if(i===5){
  const g=s.composition.nodes.find(n=>n.id==='animated-ensemble-6');
  for(const n of g.children.filter(n=>n.id.startsWith('memory-photo-'))){
   const j=Number(n.id.match(/-(\d+)/)[1]),duration=s.narration.durationSeconds+s.tailSeconds;
   n.z=14+j; // Keep the arriving picture visible on the book, below its binder edge.
   const targetX=x+[-.047,.048,-.046][j],targetY=y-.12+(j===2?.036:0);
   n.motion.keyframes=Array.from({length:Math.ceil(duration*30)+1},(_,f)=>{const t=f/30,q=Math.max(0,Math.min(1,(t-6-j*5)/2.4)),u=q*q*(3-2*q);return{at:Math.min(1,t/duration),offsetX:(targetX-n.transform.x-.006*t/duration)*u,offsetY:(targetY-n.transform.y)*u,scale:1-(1-.075/n.transform.width)*u,rotation:-n.transform.rotation*u,opacity:1,ease:'linear'};});
  }
  // The ensemble has its own stacking context: above the album, below the letter.
  g.z=14;album.z=12;bookmark.z=16;letter.z=17;
 }
}
// Paper objects are code-native SVG assets. Add tactile grain and irregular seams.
let book=await fs.readFile(a+'album.svg','utf8');
if(!book.includes('id="fibres"')){
 const image=(await fs.readFile('public/projects/time-patina-paper/assets/wind-memory.png')).toString('base64');
 book=book.replace('</defs>','<filter id="fibres"><feTurbulence baseFrequency=".18" numOctaves="3" seed="5" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="soft-light"/></filter><clipPath id="page-photo"><path d="M84 97L250 88 254 220 86 231Z"/></clipPath></defs>');
 book=book.replace('<g filter="url(#s)">','<g><g filter="url(#fibres)">');
 book=book.replace('</g></svg>',`<image href="data:image/png;base64,${image}" x="72" y="60" width="206" height="190" preserveAspectRatio="xMidYMid slice" clip-path="url(#page-photo)"/><path d="M84 97L250 88 254 220 86 231Z" fill="none" stroke="#f0e5ce" stroke-width="9"/><path d="M340 117L498 129M340 130L471 140M341 150L491 163M341 174L464 181" stroke="#9a8969" stroke-width="2" opacity=".6"/><path d="M400 270Q398 233 427 210M407 250Q366 226 385 207Q407 220 407 250M415 230Q458 218 450 195Q428 202 415 230" fill="#9b9a6e" stroke="#746f50" stroke-width="2"/></g></g></svg>`);
 await fs.writeFile(a+'album.svg',book);
}
for(const name of ['bookmark','ground-strip']){
 const file=a+name+'.svg';await fs.writeFile(file,(await fs.readFile(file,'utf8')).replace('<g filter="url(#s)">','<g>'));
}
await fs.writeFile(d+'storyboard-story-layout.json',JSON.stringify(sb,null,2));
await fs.writeFile(d+'project-story-layout.json',JSON.stringify(p,null,2));
console.log('Refined album scale, side placement, paper texture and photo collection landing points.');

