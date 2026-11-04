import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
import {deriveSceneTimeline} from '../../src/sceneTimeline.mjs';
const dir='projects/time-patina-paper/';
await fs.mkdir(dir+'versions/v5',{recursive:true});
for(const file of ['project.json','storyboard.json','production.json']) {
  try {await fs.copyFile(dir+file,dir+'versions/v5/'+file,fs.constants.COPYFILE_EXCL);} catch(e){if(e.code!=='EEXIST')throw e;}
}
const p=JSON.parse(await fs.readFile(dir+'versions/v5/project.json','utf8'));
const sb=storyboardAuthoringFromCompiled(JSON.parse(await fs.readFile(dir+'versions/v5/storyboard.json','utf8')));
const cuts=[[0,6.5,13.6],[0,6.6,13.8,21.1],[0,6.5],[0,6.5,14.2,22.5],[0,6.2],
  [0,6.6,13.7,21.7],[0,6.7,14.1,22.5],[0,7.8,17.3]];
// Continuous dolly waypoints: a new framing every phrase, never a one-frame zoom.
const frames=[
  [[1.06,18,-8],[1.30,125,-38],[1.22,-105,-26]],
  [[1.22,-105,-26],[1.31,100,-32],[1.25,-90,-26],[1.09,-22,-8]],
  [[1.09,-22,-8],[1.27,-125,-32]],
  [[1.09,-25,-8],[1.28,85,-28],[1.20,-80,-22],[1.08,-18,-8]],
  [[1.08,-18,-8],[1.24,-96,-24]],
  [[1.24,-96,-24],[1.32,112,-32],[1.24,-90,-24],[1.09,-20,-8]],
  [[1.09,-20,-8],[1.30,-45,-26],[1.20,-32,-18],[1.10,-28,-10]],
  [[1.10,-28,-10],[1.24,-60,-26],[1.055,0,-4]],
];
const smooth=t=>t*t*t*(t*(t*6-15)+10);
const lerp=(a,b,t)=>a+(b-a)*t;
const duration=[1.2,1.15,1.2,1.15,1.2,1.15,1.2];
const types=['page-turn','wipe','wipe','wipe','page-turn','wipe','dissolve'];
const reasons=[
  '旧信的纸边以 1.2 秒连续翻入相册；进出镜头保持同一运动方向，无单帧取景跳变。',
  '视线从照片里的海推向真实海岸，纸页沿右向左揭开；镜头保留出场取景继续移动。',
  '沿同一阵风把海岸纸页揭入花园，取消落空的纸色闪切，前后景持续运动。',
  '花园随风向左揭开为海面，保留波浪与风的运动方向，出入场全程都有实景。',
  '把海面翻回收藏的相片，纸页运动先加速后收势，原曲时间轴不变。',
  '相册纸页向左打开成海岸，人物由收好回忆转入起身；前景先行、镜头随后。',
  '站起后的角色在相同屏幕位置进入尾声；保持镜头尺度、海风相位和夕阳方向，以连续实景叠化完成时间过渡。',
];
sb.sceneTransitions.forEach((tr,i)=>{
  tr.rationale=reasons[i];
  tr.treatment={type:types[i],edgeStyle:types[i]==='dissolve'?'clean':'paper',motivation:'authored',durationSeconds:duration[i],
    ...(types[i]!=='dissolve'?{direction:'right-to-left'}:{})};
});
p.sceneTransitions=structuredClone(sb.sceneTransitions);
const changes=[];
for(const [i,s] of p.scenes.entries()){
  s.tailSeconds=duration[i]??0;
  const d=s.narration.durationSeconds+s.tailSeconds;
  const authored=sb.scenes[i];
  const oldBeats=authored.beats.map(b=>b.at);
  authored.beats.forEach((b,k)=>{b.at=[0,.36,.74][k]??b.at;
    for(const t of b.treatments){
      if(t.targetId==='scene-camera')t.rationale='v6：采用有加减速的连续推移镜头，每个乐句改变观察重点，不再用单帧跳变取景。';
      if(t.targetId.startsWith('animated-ensemble'))t.rationale='v6：全景连续运动，遵循风向与波浪；相邻段落保留速度趋势。相机、人物、环境共同构成动画，不能只有贴纸局部变化。';
      if(t.targetId==='paper-person'&&t.motion.kind==='state-sequence')t.rationale='v6：完整纹理网格连续演出，肩颈前后错时，脚底/座面固定；动作状态以 1 秒注册补间连接，画面间保持动作余势。';
    }
  });
  authored.proofTimes.forEach((proof,k)=>proof.at=[.10,.55,.90][k]);
  s.motion.proofTimes=structuredClone(authored.proofTimes);
  for(const e of s.events){const beat=authored.beats.find(b=>b.id===e.beatId);if(beat)e.at=beat.at;
    const proof=authored.proofTimes.find(f=>f.id===e.proofTimeId);
    if(proof&&e.visual)e.visual.durationSeconds=(proof.at-e.at)*d+.15;
  }
  const knots=frames[i];
  const points=cuts[i];
  const samples=Math.ceil(d*6);
  s.camera.keyframes=Array.from({length:samples+1},(_,j)=>{
    const time=j/samples*d;
    let k=0;for(let n=1;n<points.length;n++)if(time>=points[n]-1.5)k=n;
    let pose;
    if(k===0)pose=knots[0];
    else {const u=smooth(Math.max(0,Math.min(1,(time-(points[k]-1.5))/3.2)));
      pose=knots[k].map((v,n)=>lerp(knots[k-1][n],v,u));}
    // Retain a small forward drift through the framing holds; no mechanical freeze.
    const drift=Math.sin(time*.23)*3;
    return {at:j/samples,zoom:pose[0],x:pose[1]+drift,y:pose[2]};
  });
  // Exact entry camera equals the previous scene's final pose for every boundary.
  if(i>0){const prev=p.scenes[i-1].camera.keyframes.at(-1);const first=s.camera.keyframes[0];
    const dx=prev.x-first.x,dy=prev.y-first.y,dz=prev.zoom-first.zoom;
    s.camera.keyframes.forEach(k=>{const w=1-smooth(Math.min(1,k.at*d/3));k.x+=dx*w;k.y+=dy*w;k.zoom+=dz*w;});}
  s.camera.parallax.strength=.075;
  const walk=nodes=>{for(const n of nodes){
    if(n.kind==='state-sequence'){
      for(const st of n.states){const beat=authored.beats.find(b=>b.treatments.some(t=>t.targetId===n.id&&t.motion.stateId===st.id));if(beat)st.at=beat.at;}
      n.transition.durationSeconds=n.id==='paper-person'?Math.min(1.15,d*.06):Math.min(.85,d*.05);
      if(n.poseFamilyId==='human-letter')n.transition.registrationBands={
        'letter-low':[0,.355,.51,.69,.76,.88,1],
        'letter-read':[0,.355,.51,.616,.76,.88,1],
        'letter-rest':[0,.355,.51,.69,.76,.88,1],
      };
      if(['human-album','human-seaward'].includes(n.poseFamilyId))n.transition.durationSeconds=.40;
      if(n.poseFamilyId==='letter-open')n.transition.durationSeconds=.28;
    }
    if(n.id==='paper-person'){
      const standing=n.poseFamilyId==='human-seaward';
      // Release sequence changes height dramatically; retain its registered landmarks,
      // add the shared body performance only after the final upright pose via phase.
      n.motion.performance={kind:'character',supportY:standing?.815:.77,neckY:standing?.265:.50,standing,phase:i*.9};
      if(n.poseFamilyId==='human-release')n.motion.performance={kind:'character',supportY:.84,neckY:.175,standing:true,phase:i*.9,registrationNeckRow:2};
    }
    if(n.children)walk(n.children);
  }};walk(s.composition.nodes);
  if(i===3){const flower=s.composition.nodes.find(n=>n.id==='flower');
    flower.motion.pivot={x:.5,y:.88};
    flower.motion.idle={preset:'still',intensity:0,cycleSeconds:8};
    flower.motion.keyframes=Array.from({length:Math.ceil(d*8)+1},(_,k)=>({at:k/Math.ceil(d*8),rotation:2.8*Math.sin(k/Math.ceil(d*8)*d*1.1),offsetX:0,offsetY:0,ease:'linear'}));
  }
  // Wind acts on complete foreground sheets; solid ground does not oscillate vertically.
  const world=s.composition.nodes.find(n=>n.id.startsWith('world-'));
  if(world){for(const n of world.children){
    if(n.id==='subject')n.motion.keyframes=[{at:0,offsetX:0,offsetY:0},{at:1,offsetX:0,offsetY:0}];
    if(n.id==='front')n.motion.keyframes=Array.from({length:Math.ceil(d*5)+1},(_,k)=>({at:k/Math.ceil(d*5),offsetX:.008*Math.sin(k/Math.ceil(d*5)*d*.8),offsetY:0,rotation:0,ease:'linear'}));
  }}
  changes.push({scene:s.id,cameraWaypoints:points,performance:s.composition.nodes.find(n=>n.id==='paper-person')?.motion.performance??'registered-rise',transition:sb.sceneTransitions[i]?.treatment??null});
}
// Water deformation is confined to already visible water; rocks, paper, horizon stay rigid.
const water=(node,region,phase=0)=>node.motion.performance={kind:'water',region,phase};
water(p.scenes[2].composition.nodes[0],{left:.29,right:.58,top:.43,bottom:.57},48);
water(p.scenes[4].composition.nodes[0],{left:.34,right:.93,top:.43,bottom:.68},92);
water(p.scenes[6].composition.nodes[0].children[0],{left:.43,right:.96,top:.34,bottom:.67},135);
water(p.scenes[7].composition.nodes[0],{left:.34,right:.95,top:.46,bottom:.73},167);
// Match the standing character's contact location across the final boundary.
const last=p.scenes[7];
const shore=structuredClone(p.scenes[6].composition.nodes[0].children.find(n=>n.id==='subject'));
shore.id='continuity-shore';delete shore.slot;delete shore.registrationId;
shore.transform=structuredClone(p.scenes[6].composition.nodes[0].transform);
shore.motion={keyframes:[{at:0,offsetX:0},{at:1,offsetX:0}]};shore.z=2;shore.depth=0;
last.composition.nodes.push(shore);
sb.scenes[7].beats[0].treatments.push({id:'v6-persistent-shore',targetId:'continuity-shore',importance:'supporting',necessity:'required',
  changeClass:'static-hold',motion:{kind:'static'},composition:{pattern:'free'},graphic:null,semanticRisk:'decorative',proofTimeId:'established',
  rationale:'沿用上一幕完整礁石平台，固定人物脚下地面，海面和夕阳在后方连续变化；不得让角色悬在海水上。'});
const person=last.composition.nodes.find(n=>n.id==='paper-person');
person.transform.x=.57;person.transform.y=.71;person.transform.width=.34;person.transform.height=.34*16/9;
const ground=last.composition.nodes.find(n=>n.id==='story-ground');ground.transform.x=.57;ground.transform.y=.711;ground.transform.width=.255;
for(const id of ['memory-album','memory-bookmark','kept-letter']){
  last.composition.nodes.find(n=>n.id===id).transform=structuredClone(p.scenes[6].composition.nodes.find(n=>n.id===id).transform);
}
let globalTime=0;
for(const scene of p.scenes){
  const hero=scene.composition.nodes.find(n=>n.id==='paper-person');
  if(hero?.motion.performance)hero.motion.performance.phase=globalTime;
  globalTime+=scene.narration.durationSeconds;
}
for(const id of ['opening-title','opening-caption']){
  const title=p.scenes[0].composition.nodes.find(n=>n.id===id);
  const d=p.scenes[0].narration.durationSeconds+p.scenes[0].tailSeconds;
  title.motion.keyframes=[{at:0,opacity:0,offsetY:.015},{at:1/d,opacity:1,offsetY:0},
    {at:3.6/d,opacity:1,offsetY:0},{at:4.6/d,opacity:0,offsetY:-.008},{at:1,opacity:0,offsetY:-.008}];
}
// Restore the eye line after standing, then let the camera release toward the sunset.
const timeline=deriveSceneTimeline(p);
await fs.writeFile(dir+'project-continuous-v6.json',JSON.stringify(p,null,2));
await fs.writeFile(dir+'storyboard-continuous-v6.json',JSON.stringify(sb,null,2));
await fs.writeFile(dir+'continuous-v6-plan.json',JSON.stringify({version:6,changes,timeline:timeline.scenes.map(s=>({id:s.id,from:s.from,durationInFrames:s.durationInFrames})),durationSeconds:timeline.durationSeconds,notes:'No new generated images. 26 connected framing waypoints; full-texture character deformation, bounded ocean motion, fixed support surfaces; no blank dips.'},null,2));
console.log('v6 authored:',timeline.durationSeconds,'seconds');
