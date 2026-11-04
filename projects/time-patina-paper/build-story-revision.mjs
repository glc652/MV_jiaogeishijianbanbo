import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
const dir='projects/time-patina-paper/',pub='public/projects/time-patina-paper/assets/story-props/';
await fs.mkdir(pub,{recursive:true});
const p=JSON.parse(await fs.readFile(dir+'versions/v3/project.json'));
const sb=storyboardAuthoringFromCompiled(JSON.parse(await fs.readFile(dir+'versions/v3/storyboard.json')));
const plan=JSON.parse(await fs.readFile(dir+'poetic-shot-plan.json'));
const beats=[
 ['雨夜守信','雨停不下来，主人公仍守着未寄出的信。','主人公在雨窗前低坐；信封封闭，照片扣在相册旁。','镜头转向旧信，封口慢慢打开，露出压在信里的海边照片。','开着的信没有答案；一片干花把视线引到相册。'],
 ['翻阅昨日','反复翻看照片，是为了替离别找一个答案。','主人公与打开的相册同框，桌上是同一封旧信。','三张照片按先后进入视线：海岸、花坡、落日；时钟缓慢走动。','镜头停在海边那张照片，照片里的地点成为下一幕真实空间。'],
 ['重返海岸','主人公回到照片里的海边，发现风景仍在，陪伴的人却已不在。','从海边照片切到同构图海岸，主人公已经站在岸上，旧信仍在身边。','纸飞机掠过，小船顺流远去；人物停留，形成去留对照。','视线落向岸边的花，下一幕接花苞而非任意换风景。'],
 ['等待花开','花需要时间开放，人也需要时间愈合。','主人公在花旁坐下，旧信收在身侧，花仍是花苞。','花瓣逐渐展开，蝴蝶接近；人物保持安静，让时间有可见变化。','花完全开放；干花书签与鲜花形成前后对照。'],
 ['让风经过','不再追赶远去的事物，第一次允许风和时间经过自己。','信封与照片压在岸边相册下，纸角被风轻轻掀动。','纸船在水面顺流，小鸟继续向前；相册和信留在岸上，不在空中乱飞。','一枚花瓣落在相册上，带出重新整理回忆的动作。'],
 ['收好回忆','释怀不是抹掉过去，而是把过去收好。','相册摊开，旧照片散在旁边，主人公坐在近处。','三张照片依次向相册聚拢、落定；信封合上，成为收藏的一部分。','相册被书签标记，纸片停止争抢视线，为人物站起留出节奏。'],
 ['终于站起','主人公终于从蜷缩到起身，把注意力从旧信转向眼前的海。','同一个人坐在岸边，合起的信与相册放在身侧。','人物由蜷缩过渡到起身；小鸟经过远处，落叶避开人物面部。','人物站稳，信与相册留在原处，远景打开。'],
 ['带着记忆向前','回忆被安放，主人公重新面对生活。','站立的人物与合上的相册同框，呼应开场守信的姿态。','镜头转向收好的信和花瓣书签，再拉回海与落日。','标题出现，纸鸟飞向远处；最后保留安静、持续流动的海面。'],
];
const shotActions=[
 '雨窗、低坐人物和未寄旧信同框，建立等待。','旧信由封闭到打开；信中的海岸照片引出回忆。',
 '相册打开，主人公再次寻找答案。','海岸旧照细节与时钟同框。','花坡旧照进入视线，干花书签连接过去。','海岸照片留在画面中心，准备进入同一地点。',
 '切到照片里的海岸，主人公已经到达岸边。','纸飞机和远去的船穿过画面，人物留在原地。',
 '人物在花苞旁坐下，信被收在身侧。','花苞开始展开，蝶在花边盘旋。','花开过程与干花书签构成时间对照。','完整花朵停留，人物仍然安静，情绪开始松动。',
 '相册压住旧信，风只翻动纸角。','小船和鸟继续向前；一片花瓣落在相册旁。',
 '主人公面对摊开的相册和散落照片。','第一、第二张照片依次收拢。','第三张照片落定，旧信合上。','花瓣书签留下；回忆被收好。',
 '同一人物蜷坐，相册和信在身侧。','人物准备站起，镜头贴近。','动作从起身过渡到站立。','人物站稳，画面拉开，留出眼前的海。',
 '站立人物、相册和旧信同框，与开场低坐呼应。','旧信与花瓣书签的细节，说明记忆被保留。','回到开阔落日，片名出现，留白结束。',
];
const still={keyframes:[{at:0,offsetX:0},{at:1,offsetX:0}],idle:{preset:'still',intensity:0,cycleSeconds:8}};
const hero=p.scenes[6].composition.nodes.find(n=>n.id==='paper-person');
const letter=p.scenes[0].composition.nodes.find(n=>n.id==='memory-letter');
const paper=(body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><filter id="s"><feDropShadow dx="3" dy="7" stdDeviation="4" flood-color="#302d27" flood-opacity=".3"/></filter><pattern id="g" width="13" height="17" patternUnits="userSpaceOnUse"><path d="M2 3h3M8 12h2" stroke="#6f6049" opacity=".16"/></pattern></defs><g filter="url(#s)">${body}</g></svg>`;
await fs.writeFile(pub+'album.svg',paper('<path d="M45 57L285 41 303 62 322 43 554 62 546 351 319 329 303 347 285 331 47 350Z" fill="#526466" stroke="#b39972" stroke-width="9"/><path d="M57 64L280 52 295 67V325L282 316 60 335Z" fill="#e5d4b4"/><path d="M315 67L329 54 542 73 532 332 328 314 315 326Z" fill="#e8d9ba"/><path d="M295 70V324M315 70V324" stroke="#9e8966" stroke-width="3"/><path d="M72 83L267 73 270 303 76 319Z M335 75L528 88 519 311 334 293Z" fill="url(#g)"/><path d="M296 50L315 50 310 382 298 369 287 379Z" fill="#a86d49"/>'));
await fs.writeFile(pub+'bookmark.svg',paper('<path d="M225 25L365 32 355 368 290 326 222 362Z" fill="#b89458" stroke="#ead8b4" stroke-width="7"/><path d="M290 42L291 294M254 61L249 297M334 68L328 297" stroke="#5f705f" opacity=".4" stroke-width="4"/><path d="M225 25L365 32 355 368 290 326 222 362Z" fill="url(#g)"/>'));
await fs.writeFile(pub+'ground-strip.svg',paper('<path d="M20 139L105 125 184 137 272 128 359 140 434 123 579 142 574 167 466 158 378 168 281 157 180 166 81 155 22 169Z" fill="#a28b67"/><path d="M20 139L105 125 184 137 272 128 359 140 434 123 579 142 574 167 466 158 378 168 281 157 180 166 81 155 22 169Z" fill="url(#g)"/>'));
function staticTreatment(scene,id,risk='decorative',importance='supporting'){
 return {id:`${scene.id}-${id}-story`,targetId:id,importance,necessity:'required',changeClass:'static-hold',motion:{kind:'static'},composition:{pattern:'free'},graphic:null,semanticRisk:risk,proofTimeId:'established',rationale:'叙事对象持续可见；角色不通过平移假装步行，道具与人物关系需渲染后人工检查。'};
}
function asset(id,src,x,y,w,h,z=10,role='prop'){
 return {id,kind:'asset',assetRole:role,src,z,depth:0,transform:{x,y,width:w,height:h,anchorX:.5,anchorY:.88},motion:structuredClone(still)};
}
const characterScenes=[0,1,2,3,5,7];
const spatial=[];
const states=['curled','curled','upright','curled',null,'curled',null,'upright'];
const places=[[.27,.72,.25],[.23,.72,.24],[.74,.70,.20],[.30,.73,.23],null,[.23,.72,.24],null,[.23,.73,.17]];
for(let i=0;i<8;i++){
 const s=p.scenes[i],b=sb.scenes[i],story=beats[i];
 b.title=story[0];b.message=story[1];
 for(let j=0;j<3;j++){b.beats[j].purpose=story[j+2];b.beats[j].visual=story[j+2];}
 const album=asset('memory-album','projects/time-patina-paper/assets/story-props/album.svg',i===7?.66:.75,.73,.23,.273,13);
 const bookmark=asset('memory-bookmark','projects/time-patina-paper/assets/story-props/bookmark.svg',i===7?.72:.82,.70,.025,.030,15);
 s.composition.nodes.push(album,bookmark);
 b.beats[0].treatments.push(staticTreatment(s,'memory-album'),staticTreatment(s,'memory-bookmark'));
 if(i!==0){
  const state=letter.states.find(v=>v.id===(i<5?'open':'sealed'));
  const prop=asset('kept-letter',state.src,i===7?.65:.72,.64,.18,.32,14);
  s.composition.nodes.push(prop);b.beats[0].treatments.push(staticTreatment(s,'kept-letter','identity'));
 }
 if(characterScenes.includes(i)){
  const [x,y,w]=places[i],source=hero.states.find(v=>v.id===states[i]);
  const person=asset('paper-person',source.src,x,y,w,w*1920/1080,9,'character');
  s.composition.nodes.push(person);
  b.beats[0].treatments.push(staticTreatment(s,'paper-person','identity','hero'));
  // A visible supporting paper edge shares the same coordinate system and camera.
  const ground=asset('story-ground','projects/time-patina-paper/assets/story-props/ground-strip.svg',x,y+.001,w*.75,.05,8);
  ground.transform.anchorY=.35;s.composition.nodes.push(ground);
  b.beats[0].treatments.push(staticTreatment(s,'story-ground'));
  spatial.push({id:`${s.id}-story-ground`,kind:'grounding',sceneId:s.id,subjectNodeId:'paper-person',supportNodeId:'story-ground',proofTimeIds:['established','transforming','resolved'],subjectAnchor:{mode:'normalized',x:.5,y:.88},supportSurface:{points:[{x:.18,y:.35},{x:.82,y:.35}]},supportScreenBand:{minY:.5,maxY:.85},mode:'locked-contact',maxGap:.018,maxPenetration:.018,maxRelativeDrift:.008});
 }
 if(i===5){
  const closing=structuredClone(letter);
  closing.id='kept-letter';closing.transform={...closing.transform,x:.72,y:.64,width:.18,height:.32};closing.z=14;
  closing.states=[...closing.states].reverse().map((state,j)=>({...state,at:b.beats[j].at}));
  for(let j=0;j<3;j++){const proof=b.proofTimes.find(v=>v.id===b.beats[j].proofTimeId);proof.stateAssertions=[...(proof.stateAssertions??[]),{nodeId:'kept-letter',stateId:closing.states[j].id}];}
  s.composition.nodes=s.composition.nodes.map(n=>n.id==='kept-letter'?closing:n);
  b.beats[0].treatments=b.beats[0].treatments.filter(t=>t.targetId!=='kept-letter');
  for(let j=0;j<3;j++)b.beats[j].treatments.push({id:`${s.id}-close-letter-${j}`,targetId:'kept-letter',importance:'supporting',necessity:'required',changeClass:'pose-change',motion:{kind:'state-sequence',poseFamilyId:'letter-open',stateId:closing.states[j].id,facing:'front',visualChange:`收信阶段${j+1}`,playback:'once',transition:'crossfade'},composition:{pattern:'free'},graphic:null,semanticRisk:'identity',proofTimeId:b.beats[j].proofTimeId,rationale:'复用同一封信的注册形态，由打开到合拢，回应开场拆信，表达主动收好回忆。'});
  const group=s.composition.nodes.find(n=>n.id==='animated-ensemble-6');
  for(const n of group.children.filter(n=>n.id.startsWith('memory-photo-'))){
   const j=Number(n.id.match(/-(\d+)/)[1]),start=6+j*5,end=start+2.4,dur=s.narration.durationSeconds+s.tailSeconds;
   n.motion.keyframes=Array.from({length:Math.ceil(dur*30)+1},(_,f)=>{const t=f/30,q=Math.max(0,Math.min(1,(t-start)/(end-start))),u=q*q*(3-2*q);return{at:Math.min(1,t/dur),offsetX:(.73-n.transform.x)*u,offsetY:(.57-n.transform.y)*u,scale:1-.42*u,rotation:-n.transform.rotation*u,opacity:1,ease:'linear'};});
  }
 }
}
p.spatialContracts=[...(p.spatialContracts??[]),...spatial];
sb.spatialContracts=[...(sb.spatialContracts??[]),...spatial];
for(let i=0;i<plan.shots.length;i++)plan.shots[i].storyAction=shotActions[i];
plan.revision='v4-story';plan.status='authored-awaiting-render';plan.logline='一个守着旧信的人，重返照片里的海边，经过等待，终于把回忆收好并站起来。';
const authorization={schemaVersion:1,id:'story-feedback-v4',slug:'time-patina-paper',source:'preview-changes-requested',allowedSceneIds:sb.scenes.map(s=>s.id),humanNote:'我看了你修改的进度，感觉元素又偏少了一点，然后继续修改，再增加一条就是我希望这个MV和讲故事一样，体现故事感，而不是单纯几张风景图',equivalentQualityEvidence:['保留整首歌曲、原有纸片风格、从旧信到释怀的主线，25个取景镜头加入因果动作。','沿用已批准的同一人物、旧信和花的素材；新增本地相册与书签，未调用付费生成。','新增跨场景角色和道具关系需要新的构图、身份与地面接触检查，未将旧证据视为通过。'],decidedAt:new Date().toISOString()};
await fs.writeFile(dir+'storyboard-story-v4.json',JSON.stringify(sb,null,2));
await fs.writeFile(dir+'project-story-v4-candidate.json',JSON.stringify(p,null,2));
await fs.writeFile(dir+'story-v4-authorization.json',JSON.stringify(authorization,null,2));
await fs.writeFile(dir+'story-v4-shot-plan.json',JSON.stringify(plan,null,2));
const rows=plan.shots.map(s=>`| ${s.id} | ${s.fromSeconds.toFixed(1)}–${s.toSeconds.toFixed(1)} 秒 | ${s.storyAction} |`).join('\n');
await fs.writeFile(dir+'故事版分镜_v4.md',`# 交给时间斑驳 · 故事版分镜 v4\n\n**主线：** ${plan.logline}\n\n保留完整原曲，8个故事段落、25个镜头。人物和旧信反复出现；相册、书签、照片、花与纸船各自承担具体情节。新增人物以剪辑呈现到达、停留与回望；完整起身沿用已批准的注册姿态动画。没有合格步态素材时不让静止人像滑行冒充走路。\n\n## 逐镜头动作\n\n| 镜头 | 时间 | 画面发生的事 |\n|---|---|---|\n${rows}\n\n## 验收重点\n\n- 人物从开篇进入故事，外套、发型、比例保持一致。\n- 信封开场打开、结尾收好，形成明确前后变化。\n- 照片收纳、花开、起身有发生顺序；风景负责交代地点与情绪。\n- 恢复叙事道具密度，但不增加同屏随机漂浮物。\n- 必须复查人物接地、道具遮挡、照片收拢落点、每个镜头的可读性。\n\n**状态：** 分镜和执行候选已写入，尚未渲染验证。自动审批服务报告额度耗尽，未完成视频检查帧提取审批；不得将旧预览当作故事版交付。\n`);
console.log('Authored v4 story: 25 shot actions, recurring person in 7 chapters, album/bookmark/kept-letter continuity. Candidate needs spatial and visual verification.');

