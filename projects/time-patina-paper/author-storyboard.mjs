import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url);
const read=async n=>JSON.parse(await fs.readFile(new URL(n,dir),'utf8'));
const opt=(await read('planning-scenarios.json')).options.find(x=>x.id==='balanced');
const project=await read('project.json');
const edges=[0,18.84,47.77,61.94,92.44,105.98,134.83,166.91,193.462313];
const proofIds=['established','transforming','resolved'];
const roles=['establish','action','settle'];
const at=[0,0.44,0.86];
const t=(id,targetId,proofTimeId,motion,changeClass='ambient-motion',more={})=>({id,targetId,importance:'supporting',necessity:'required',changeClass,motion,composition:{pattern:'free'},graphic:null,semanticRisk:'decorative',proofTimeId,rationale:'沿音乐缓慢变化，给歌词与情绪留下呼吸空间。',...more});
const scenes=opt.scenes.map((s,i)=>{
 const proofs=proofIds.map((p,j)=>({id:p,at:[0.08,0.51,0.89][j],kind:['establish','peak','final'][j],label:[s.label+'进入',s.label+'变化',s.label+'停留'][j],assertions:[j===0?'画面主体清晰，歌词安全区留白':j===1?'纸片运动与状态变化可见':'最终构图稳定，光与纸纹保持细腻'],stateAssertions:[]}));
 const beats=roles.map((role,j)=>({id:role,at:at[j],performanceRole:role,purpose:[`建立${s.label}的空间`,s.beat,'让情绪落定并准备进入下一段'][j],visual:[s.layers.mid[0],'纸片、光线与主体顺着旋律发生变化','终态停留，保留微妙环境运动'][j],soundCue:null,proofTimeId:proofIds[j],treatments:[]}));
 s.localMotionTargets.forEach((m,j)=>beats[j].treatments.push(t('motion-'+m.targetId,m.targetId,proofIds[j],{kind:'continuous-transform',preset:m.preset==='translate'?'drift':m.preset})));
 if(s.parallax){
  beats[0].treatments.push(t('camera-depth','scene-camera','established',{kind:'continuous-transform',preset:'parallax-camera'},'depth-parallax'));
  beats[0].treatments.push(t('layer-package',`world-${i+1}`,'established',{kind:'continuous-transform',preset:'drift'},'depth-layer-separation',{composition:{pattern:'registered-depth-stack',motionCapability:'bounded-relative',sourcePackageId:s.sourcePackages[0].id,sourceStrategy:'context-preserving-layer-edits',layers:[{id:'rear',role:'support-rear',completeness:'clean-plate',depth:-0.7},{id:'subject',role:'subject',completeness:'full-silhouette',depth:0},{id:'front',role:'support-front',completeness:'full-overlay',depth:0.7}],revealEnvelope:Object.fromEntries(['16:9','9:16','1:1'].map(k=>[k,{x:0.025,y:0.015,scale:0.035,rotationDegrees:0.7}]))}}));
 }
 if(s.ambientElements.length)beats[1].treatments.push(t('paper-dust','dust-'+i,'transforming',{kind:'motif-field',preset:'fall-drift',distribution:'scattered',count:9,cycles:2,bounds:{x:0.06,y:0.08,width:0.88,height:0.65},exclusionZones:[{id:'lyrics-safe',shape:'rectangle',x:0.1,y:0.78,width:0.8,height:0.17,padding:0.02}]},'decorative-field',{importance:'ambient',necessity:'enhancement'}));
 for(const f of s.stateFamilies){
  const targetId=f.id==='letter-open'?'memory-letter':f.id==='paper-flower'?'flower':'paper-person';
  f.states.forEach((stateId,j)=>{
   beats[j].treatments.push(t(`${f.id}-${stateId}`,targetId,proofIds[j],{kind:'state-sequence',poseFamilyId:f.id,stateId,facing:'front',visualChange:stateId,playback:'once',transition:'cut'},'pose-change',{importance:'hero',semanticRisk:f.id==='human-release'?'identity':'decorative',rationale:'完整注册状态表现真实形态变化，而不是缩放静态图片。'}));
   proofs[j].stateAssertions.push({nodeId:targetId,stateId});
  });
 }
 if(!beats[2].treatments.length)beats[2].treatments.push(t('final-hold',s.localMotionTargets[0].targetId,'resolved',{kind:'static'},'static-hold'));
 beats.forEach(b=>b.treatments.forEach(t=>t.id=s.id+'-'+t.id));
 return {id:s.id,title:s.label,narrativeRole:i===0?'开篇':i===7?'释怀':'情绪发展',message:s.beat,blueprint:s.stateFamilies.length?'transformation-tableau':s.parallax?'layered-reveal':i===7?'quiet-lockup':'archive-stack',estimatedDurationSeconds:edges[i+1]-edges[i],beats,proofTimes:proofs};
});
const audio=await fs.readFile(new URL('inputs/original-song.wav',dir));
const pub=new URL('../../public/projects/time-patina-paper/audio/',dir);
await fs.mkdir(pub,{recursive:true});
await fs.writeFile(new URL('original-song.wav',pub),audio);
const editorial={timebase:{fps:30,rounding:'nearest'},wordTimingPolicy:'phrase-fallback',media:[{id:'original-song',kind:'music',src:'projects/time-patina-paper/audio/original-song.wav',sha256:createHash('sha256').update(audio).digest('hex'),durationSeconds:edges.at(-1),timelineMode:'global'}],cues:[],editPoints:[],bindings:[],responsiveProfiles:[['16:9',1920,1080,1],['9:16',1080,1920,0.8],['1:1',1080,1080,0.9]].map(([id,width,height,scale])=>({id,width,height,safeArea:{x:0.07,y:0.06,width:0.86,height:0.88},densityBudget:12,typographyScale:scale,parallaxScale:scale,exclusionZones:[]})),sceneDirecting:scenes.map(s=>({sceneId:s.id,compositionProfile:'archival-memory',typographyProfile:'lyric-serif',subjectFraming:{mode:'contain',focusPoint:{x:0.5,y:0.42}},placements:[]})),transitions:[],activeProfile:'16:9'};
const sb={schemaVersion:12,slug:'time-patina-paper',status:'ready',arc:opt.rationale+' 从雨中的旧信，到碎片拼合，再到花开和释怀。',style:{visualThesis:'记忆有斑驳纸纹，生活依然向光生长。',compositionRules:['一幕一个视觉中心','底部保留清晰的歌词区','冷蓝灰逐步过渡到米白与暖金','纸纹可见、撕边自然，避免卡通和繁杂装饰'],layerStrategy:'四个关键段落使用完整独立后景、主体、前景；其余段落以档案拼贴和局部纸片动作连接。'},motionDirection:{schemaVersion:1,summary:'以缓慢建立、纸片或形态转变、情绪落定构成每幕，副歌展开纵深与暖光。',pacing:'gentle',performance:{grammar:roles,anticipation:'selective',followThrough:'selective',poseStrategy:'mixed',minimumFinalHoldRatio:0.1},camera:{strategy:'motivated'},transitions:{strategy:'story-led'},ambient:{strategy:'selective'},styleDeviationRationale:'完整抒情歌曲以缓慢乐句为节奏，保留安静的终态与尾奏。'},editorial,scenes,sceneTransitions:scenes.slice(0,-1).map((s,i)=>({id:`boundary-${i+1}`,fromSceneId:s.id,toSceneId:scenes[i+1].id,intent:i===3?'location-change':'time-passage',rationale:'随歌曲段落切换记忆空间，保持纸张与色彩连续。'}))};
await fs.writeFile(new URL('storyboard-input.json',dir),JSON.stringify(sb,null,2)+'\n');
