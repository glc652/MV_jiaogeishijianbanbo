import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
const dir='projects/time-patina-paper/';
const p=JSON.parse(await fs.readFile(dir+'versions/v2/project.json','utf8'));
const sb=storyboardAuthoringFromCompiled(JSON.parse(await fs.readFile(dir+'versions/v2/storyboard.json','utf8')));
const clamp=x=>Math.max(0,Math.min(1,x)), smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const still={keyframes:[{at:0},{at:1}],idle:{preset:'still',intensity:0,cycleSeconds:8}};
const shots=[], physics=[];
// Real cuts between different framings, on supplied lyric phrase boundaries.
// Eight narrative locations remain continuous; 26 shots replace eight long holds.
const cuts=[[0,8.4],[0,7.1667,14.5333,21.4667],[0,7.1],[0,7.3,15.0,22.3],[0,6.5],[0,7.2,14.5,22],[0,7.6,15.6,23.2],[0,9,18]];
const framing=[
 [[1.01,0,0],[1.20,-70,-12]],
 [[1.06,0,0],[1.34,60,10],[1.23,-88,6],[1.045,0,0]],
 [[1.20,54,5],[1.02,-5,0]],
 [[1.055,0,0],[1.28,-36,-25],[1.14,55,5],[1.045,0,0]],
 [[1.19,-30,6],[1.025,0,0]],
 [[1.05,0,0],[1.30,65,10],[1.22,-75,4],[1.045,0,0]],
 [[1.025,0,0],[1.30,-55,-30],[1.14,-20,-12],[1.025,0,0]],
 [[1.01,0,0],[1.18,35,10],[1.01,0,0]],
];
const types=['page-turn','wipe','dip','wipe','dip','wipe','dip'];
for(let i=0;i<7;i++){
 const type=types[i],t=sb.sceneTransitions[i];
 t.treatment=type==='cut'?{type,motivation:'rhythmic',durationSeconds:0}:{type,edgeStyle:'paper',motivation:'authored',durationSeconds:type==='page-turn'?.55:type==='dip'?.4:.45,...(['wipe','page-turn'].includes(type)?{direction:i===3?'bottom-to-top':'right-to-left'}:{})};
 t.rationale=['只在旧信进入旧照片时保留一次翻页，建立回忆的物质关联。','沿纸片被风带走的方向擦入海岸。','用短暂的纸色落暗连接失落与花开。','向上揭开纸边，让花园转入开阔海面。','原曲第二段主歌起点以短纸色过渡进入照片，不叠加翻页。','顺风揭开纸边，从照片进入人物海岸。','人物释怀后轻落纸色，进入落日尾声。'][i];
}
let global=0;
for(let i=0;i<p.scenes.length;i++){
 const s=p.scenes[i],oldDur=s.narration.durationSeconds+s.tailSeconds;
 s.tailSeconds=sb.sceneTransitions[i]?.treatment.durationSeconds??0;
 const dur=s.narration.durationSeconds+s.tailSeconds,frames=Math.ceil(dur*30-1e-7);
 const ensemble=s.composition.nodes.find(n=>n.id===`animated-ensemble-${i+1}`);
 ensemble.motion={keyframes:[{at:0,offsetX:0},{at:1,offsetX:.006}],idle:structuredClone(still.idle)};
 const keep=n=>{
  const id=n.id,j=Number(id.match(/-(\d+)/)?.[1]??0);
  if(id.startsWith('rain-'))return j<20;
  if(id.startsWith('bird-'))return j<2;
  if(id.startsWith('memory-photo-'))return j<3;
  if(id.startsWith('wave-'))return j<3;
  if(id.startsWith('boat-'))return j===0;
  if(id.startsWith('cloud-'))return j<2;
  if(id.startsWith('plane-'))return j===0;
  if(id.startsWith('butterfly-'))return j<2;
  if(id.startsWith('petal-'))return j<4;
  if(id.startsWith('leaf-'))return j<3;
  if(id.startsWith('letter-'))return j<2;
  if(id.startsWith('garden-leaf-'))return j<3;
  if(id.startsWith('star-'))return false;
  return true;
 };
 ensemble.children=ensemble.children.filter(keep);
 function animate(n,fn,description){
  n.motion={keyframes:Array.from({length:frames+1},(_,f)=>({at:f/frames,ease:'linear',...fn(f/30)})),idle:structuredClone(still.idle)};
  physics.push({scene:s.id,node:n.id,rule:description});
 }
 for(const n of ensemble.children){
  const id=n.id,j=Number(id.match(/-(\d+)/)?.[1]??0);n.depth=0;n.transform.opacity=1;
  if(id.startsWith('rain-')){
   n.transform={...n.transform,x:.07+(j%10)*.05+Math.floor(j/10)*.023,y:-.14,width:.0045,height:.15};
   animate(n,t=>{const q=(t*.33+j*.041)% .92;return{offsetX:-q*.055,offsetY:q,opacity:smooth(q/.1)*smooth((.80-q)/.12)*.4};},'雨线受重力持续向下，轻微同向风偏，离开窗区后才重新出现。');
  }else if(id.startsWith('bird-')){
   const phase=j*1.8,x0=j?.48:.1,y0=.27+j*.065;
   n.transform.x=x0;n.transform.y=y0;n.transform.width=.031+j*.003;n.transform.height=n.transform.width*1.333333;
   animate(n,t=>{const wing=Math.sin(t*5.2+phase),sign=id.endsWith('wing-left')?-1:id.endsWith('wing-right')?1:0;return{offsetX:.010*t,offsetY:-.002*t+.004*Math.sin(t*.8+phase),rotation:sign*(18+22*wing)-10,opacity:smooth(t/.8)*smooth((dur-t)/1)};},'鸟群同向缓慢滑翔，翅膀围绕翼根周期拍动；飞行位置不左右折返。');
  }else if(id.startsWith('boat-')){
   n.transform={...n.transform,x:i===4?.62:.34,y:i===4?.49:.57,width:i===4?.060:.075,height:i===4?.080:.10};
   animate(n,t=>({offsetX:t*.002,offsetY:.006*Math.sin(t*1.35),rotation:2.5*Math.cos(t*1.35)}),'船体缓慢顺流，升沉与倾斜使用同一波相，始终保持水面高度。');
  }else if(id.startsWith('wave-')){
   n.transform={...n.transform,x:.20+j*.23,y:.48+j*.04,width:.12,height:.028,opacity:.45};
   animate(n,t=>({offsetX:.0018*t,offsetY:.003*Math.sin(t*1.35+j),opacity:.18+.12*(1+Math.sin(t*.8+j))/2}),'低矮水纹顺流推进，轻微起伏，不在空中大幅扭动。');
  }else if(id.startsWith('cloud-')){
   n.transform={...n.transform,x:.2+j*.43,y:(i===7?.37:.18)+j*.025,width:.10,height:.066,rotation:0,opacity:.58};
   animate(n,t=>({offsetX:.003*t,offsetY:0,rotation:0}),'云层稳定同向缓移，保持水平，不旋转或上下摆动。');
  }else if(id.startsWith('plane-')){
   n.transform={...n.transform,x:-.12,y:.32,width:.075,height:.10,rotation:9};
   animate(n,t=>({offsetX:.077*t,offsetY:-.018*t+.0009*t*t,rotation:3+t*.4,opacity:smooth(t/.7)*smooth((dur-t)/1)}),'纸飞机单次斜向滑翔，受重力缓慢下沉，不作正弦往返。');
  }else if(id.startsWith('memory-photo-')){
   n.transform={...n.transform,x:[.42,.66,.78][j],y:[.32,.39,.60][j],width:[.24,.20,.145][j],height:[.32,.267,.193][j],rotation:[-8,7,-5][j],anchorY:.12};
   const start=j*2.0;
   animate(n,t=>{const u=Math.max(0,t-start),settle=Math.exp(-u*1.35);return{offsetY:-.008*settle,rotation:2.5*settle*Math.cos(u*4)+.28*Math.sin(t*.75+j),opacity:smooth((t-start+.6)/.9)};},'照片固定上沿，轻轻翻起后阻尼落定；仅保留纸角微动，不互相穿越或悬浮。');
  }else if(id==='clock-face'||id==='clock-pointer'){
   n.transform={...n.transform,x:.84,y:.20,width:.10,height:.1333,rotation:0};
   animate(n,t=>({rotation:id==='clock-pointer'?t*6:0}),'钟面固定，指针绕同一圆心匀速旋转。');
  }else if(id.startsWith('garden-leaf-')){
   n.transform.width=.045;n.transform.height=.06;n.transform.anchorY=.9;
   animate(n,t=>({rotation:3*Math.sin(t*1.1+j)}),'枝叶围绕固定根部轻摆。');
  }else if(id.startsWith('butterfly-')){
   n.transform={...n.transform,x:.26+j*.38,y:.42+j*.02,width:.04,height:.0533};
   animate(n,t=>({offsetX:.035*Math.sin(t*.32+j),offsetY:.023*Math.cos(t*.43+j),rotation:6*Math.sin(t*.32+j),scale:.88+.12*Math.abs(Math.sin(t*8+j))}),'蝶翼快节奏收放，花边慢弧线盘旋；小幅曲线保持轻盈。');
  }else if(/^(leaf|petal|letter)-/.test(id)){
   const letter=id.startsWith('letter-'), petal=id.startsWith('petal-');
   const x=i===6?(j%2?.84:.1+j*.02):.18+j*.23;
   n.transform={...n.transform,x,y:-.12,width:letter?.045:petal?.022:.029,height:letter?.060:petal?.029:.039,rotation:0};
   const velocity=letter?.028:.040,span=.91;
   animate(n,t=>{const q=(t*velocity+j*.21)%span;return{offsetX:.045*Math.sin(q*5+j)+q*.11,offsetY:q,rotation:12*Math.sin(t*.8+j)+q*18,opacity:smooth(q/.14)*smooth((span-q)/.13)*.8};},'纸片持续向下沉降，风只造成缓慢横漂与轻微翻转；淡出后才循环，避开人物脸部。');
  }
 }
 // Reduce competing background accents; preserve the already approved hero action.
 for(const n of s.composition.nodes){if(n.id.startsWith('paper-')&&n.id!=='paper-person'){n.transform.opacity=.30;n.motion.idle={preset:'sway',intensity:.2,cycleSeconds:7};}}
 s.camera.parallax.strength=.05;
 s.camera.keyframes=[];
 const times=cuts[i].map(t=>Math.round(t*30)/30);
 for(let k=0;k<times.length;k++){
  const start=times[k],end=times[k+1]??dur,[zoom,x,y]=framing[i][k];
  const endFrame=Math.min(frames,k===times.length-1?frames:Math.round(end*30)-1);
  s.camera.keyframes.push({at:Math.round(start*30)/frames,x,y,zoom},{at:endFrame/frames,x:x+(k%2?-5:5),y,zoom:zoom+.012});
  shots.push({id:`shot-${String(shots.length+1).padStart(2,'0')}`,sceneId:s.id,fromSeconds:global+start,toSeconds:global+Math.min(end,s.narration.durationSeconds),durationSeconds:Math.min(end,s.narration.durationSeconds)-start,framing:k===0?'空间建立':zoom>1.24?'主体细节':zoom<1.08?'情绪全景':'环境中景',camera:{zoom,x,y},entry:k?'lyric-phrase-cut':'scene-boundary'});
 }
 // Camera treatment already exists through the approved directing grammar; record
 // exact shot plan in the ensemble treatment rationale, without new semantic beats.
 for(const b of sb.scenes[i].beats)for(const t of b.treatments)if(t.targetId===ensemble.id)t.rationale=`本幕 ${times.length} 个不同取景镜头，切点 ${times.join(' / ')} 秒；${ensemble.children.length} 个纸片部件分工，详见 poetic-shot-plan.json、poetic-motion-rules.json。重力下落、同向风场、船体与波相同步、照片固定阻尼落定，避免数量堆叠。`;
 // Existing event lengths cannot extend beyond a shortened outgoing tail.
 for(const e of s.events??[])if(e.visual?.durationSeconds)e.visual.durationSeconds=Math.min(e.visual.durationSeconds,(1-e.at-.001)*dur);
 global+=s.narration.durationSeconds;
}
p.sceneTransitions=sb.sceneTransitions;
await fs.writeFile(dir+'storyboard-poetic-revision.json',JSON.stringify(sb,null,2));
await fs.writeFile(dir+'project-poetic-candidate.json',JSON.stringify(p,null,2));
await fs.writeFile(dir+'poetic-shot-plan.json',JSON.stringify({narrativeLocations:8,shotCount:shots.length,basis:'Manual editorial cuts aligned to supplied lyric phrasing; source song unchanged',shots},null,2));
await fs.writeFile(dir+'poetic-motion-rules.json',JSON.stringify({providerCalls:0,physics,activeParts:physics.length},null,2));
console.log(JSON.stringify({shots:shots.length,parts:physics.length,transitions:types}));




