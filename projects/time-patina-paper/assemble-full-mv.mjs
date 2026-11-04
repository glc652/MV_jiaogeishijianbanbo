import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve('.'),dir=path.join(root,'projects/time-patina-paper');
const read=async f=>JSON.parse(await fs.readFile(path.join(dir,f),'utf8'));
const p=await read('project.json'),sb=await read('storyboard.json'),m=await read('assets-manifest.json');
const lyrics=await read('inputs/lyrics-timing.json');
const person=structuredClone(p.scenes.find(s=>s.id==='balanced-scene-07').composition.nodes.find(n=>n.id==='paper-person'));
person.motion={keyframes:[{at:0,offsetX:0},{at:1,offsetX:0}]};
const rec=id=>m.assets.findLast(a=>a.assetId===id&&a.lifecycle.status==='active');
const src=id=>rec(id).file.replaceAll('\\','/').replace(/^public\//,'');
const still={keyframes:[{at:0,offsetX:0},{at:1,offsetX:0}],idle:{preset:'still',intensity:0,cycleSeconds:8}};
const full={x:0,y:0,width:1,height:1,anchorX:0,anchorY:0};
const starts=[0,18.84,47.77,61.94,92.44,105.98,134.83,166.91,193.462313].map((x,i)=>i===8?x:Math.round(x*30)/30);
const keys={1:'rain-window',4:'flower-garden',6:'memory-table',7:'release-coast'};
const backgrounds={2:'folded-yesterday',3:'wind-memory',5:'style-reference',8:'time-outro'};
const asset=(id,assetId,z,depth=0)=>({id,kind:'asset',assetRole:'environment',src:src(assetId),z,depth,transform:{...full},motion:structuredClone(still)});
const title=(id,text,transform,size,fadeOut=false)=>({id,kind:'typography',text,treatment:{fit:{minFontSize:size,maxFontSize:size,maxLines:2,overflow:'error'},style:{color:'#393d43',fontWeight:500,lineHeight:1.5,align:'center',letterSpacing:8,fontFamily:'SimSun'},effects:{shadow:{color:'#efe5d0',x:0,y:1,blur:1}},highlights:[],reveal:{mode:'none',editPointIds:[]},emphasis:[],safeAreaMode:'inside',avoidZoneIds:[]},z:30,transform,motion:{keyframes:[{at:0,opacity:0,offsetY:.015},{at:.13,opacity:1,offsetY:0,ease:'ease-out'},{at:.88,opacity:1},{...(fadeOut?{at:1,opacity:0}:{at:1,opacity:1})}],idle:{preset:'still',intensity:0,cycleSeconds:8}}});
await fs.mkdir(path.join(root,'public/projects/time-patina-paper/audio/scenes'),{recursive:true});
await fs.mkdir(path.join(root,'public/projects/time-patina-paper/timing'),{recursive:true});
const paperSvg='<svg xmlns="http://www.w3.org/2000/svg" width="240" height="92"><path d="M6 8L32 5 64 9 95 4 123 8 151 3 183 8 216 4 233 10 236 79 202 84 176 80 144 87 115 81 87 86 54 80 20 87 4 80Z" fill="#e4d3b4"/><path d="M20 25L218 25M20 32L144 32" stroke="#a69170" opacity=".18" stroke-width="1"/></svg>';
await fs.writeFile(path.join(root,'public/projects/time-patina-paper/assets/paper-strip.svg'),paperSvg);
const ffmpeg=path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
p.quality.minimumAssetScale=.85; // Native 1672x941 art, modest 1.15x final delivery scaling.
p.scenes=[];
for(let i=1;i<=8;i++){
 const s=sb.scenes[i-1],begin=starts[i-1],duration=starts[i]-begin,nodes=[];
 const audio=`projects/time-patina-paper/audio/scenes/scene-${i}.wav`;
 const cut=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-ss',String(begin),'-i','public/projects/time-patina-paper/audio/original-song.wav','-t',String(duration),'-c:a','pcm_s16le','public/'+audio],{cwd:root,encoding:'utf8'});
 if(cut.status!==0)throw new Error(cut.stderr||cut.error?.message);
 if(keys[i]){
  const key=keys[i],spec=await read(i===1?'rain-family.json':`${key}-family.json`);
  const g={id:`world-${i}`,kind:'group',pattern:'registered-depth-stack',stackingContext:'scene',z:0,coordinateSpace:spec.registration.canvas,registration:spec.registration,layerStack:{sourcePackageId:spec.sourcePackageId,sourceStrategy:spec.sourceStrategy,motionCapability:spec.motionCapability,revealEnvelope:spec.revealEnvelope},transform:{x:-.055,y:-.055,width:1.11,height:1.11,anchorX:0,anchorY:0,scale:1,rotation:0,opacity:1},motion:{keyframes:[{at:0,offsetX:0},{at:1,offsetX:0}]},children:['rear','subject','front'].map((r,j)=>({...asset(r,`${key}-${r}-registered`,[0,2,12][j],[-.7,0,.7][j]),slot:['support-rear','subject','support-front'][j],registrationId:spec.registration.id,motion:{keyframes:[{at:0,offsetX:-.004*j},{at:.86,offsetX:.004*j,ease:'ease-in-out'},{at:1,offsetX:.004*j}],idle:{preset:'still',intensity:0,cycleSeconds:8}}}))};
  nodes.push(g);
 }else{const bg=asset(`background-${i}`,backgrounds[i],0,-.5);bg.transform={x:-.04,y:-.04,width:1.08,height:1.08,anchorX:0,anchorY:0};nodes.push(bg);}
 // Small tactile paper accents perform the declared ambient phrases.
 for(let j=1;j<=2;j++)nodes.push({id:`paper-${i}-${j}`,kind:'asset',assetRole:'decorative',src:'projects/time-patina-paper/assets/paper-strip.svg',z:15,depth:.45,transform:{x:j===1?.07:.91,y:j===1?.11:.73,width:j===1?.105:.068,height:j===1?.055:.036,anchorX:.5,anchorY:.5,rotation:j===1?-13:17,opacity:.62},motion:{keyframes:[{at:0,offsetX:j===1?-.02:.01,offsetY:.008},{at:.86,offsetX:j===1?.018:-.008,offsetY:-.006,ease:'ease-in-out'},{at:1,offsetX:j===1?.018:-.008,offsetY:-.006}],idle:{preset:j===1?'drift':'breathe',intensity:.3,cycleSeconds:8}}});
 for(const t of s.beats.flatMap(b=>b.treatments).filter(t=>t.motion.kind==='motif-field')){
  const q=t.motion;nodes.push({id:t.targetId,kind:'motif-field',motifs:[{id:'paper-dust',src:'projects/time-patina-paper/assets/dust.svg'}],count:q.count,seed:29+i,distribution:q.distribution,fieldMotion:{preset:q.preset,cycles:q.cycles},baseSize:.004,variation:{scale:[.5,1.3],rotation:[-25,25],opacity:[.15,.35]},bounds:q.bounds,exclusionZones:q.exclusionZones,z:20,transform:{...full},motion:structuredClone(still)});
 }
 if(i===1||i===4){
  const key=i===1?'letter-open':'paper-flower',id=i===1?'memory-letter':'flower',sheet=rec(`${key}-sheet`),identity=rec(`${key}-reference`),stateIds=sheet.stateSheetBinding.states.map(x=>x.stateId);
  const member=rec(`${key}-${stateIds[0]}`);
  nodes.push({id,kind:'state-sequence',assetRole:'prop',poseFamilyId:key,registration:{id:`${key}-registration`,sourceMasterAssetId:`${key}-sheet`,canvas:{width:member.media.width,height:member.media.height},origin:'top-left'},anchorPolicy:sheet.stateSheetBinding.anchorPolicy,states:stateIds.map(stateId=>({id:stateId,src:src(`${key}-${stateId}`),at:s.beats.find(b=>b.treatments.some(t=>t.motion.stateId===stateId)).at,facing:'front',anchors:rec(`${key}-${stateId}`).stateBinding.anchors,identityReferenceAssetId:identity.assetId,identityReferenceSha256:identity.sha256})),playback:{mode:'once',cycles:1},transition:{type:'crossfade',durationSeconds:i===1?.24:.4},z:7,transform:{x:i===1?.70:.54,y:i===1?.72:.73,width:i===1?.34:.31,height:i===1?.604:.551,anchorX:.5,anchorY:.88},motion:structuredClone(still)});
 }
 if(i===7){person.transform={...person.transform,x:.57,y:.71};nodes.push(person);}
 if(i===1){nodes.push(title('opening-title','交给时间斑驳',{x:.75,y:.13,width:.35,height:.13,anchorX:.5,anchorY:0},64,true));nodes.push(title('opening-caption','把昨日留在纸上',{x:.75,y:.265,width:.32,height:.05,anchorX:.5,anchorY:0},28,true));}
 if(i===8)nodes.push(title('closing-title','交给时间斑驳',{x:.53,y:.115,width:.56,height:.13,anchorX:.5,anchorY:0},64));
 const sceneLyrics=lyrics.filter(l=>l.startMs/1000<starts[i]&&l.endMs/1000>begin).map(l=>({startSeconds:Math.max(0,l.startMs/1000-begin),endSeconds:Math.min(duration,l.endMs/1000-begin),text:l.text})).filter(l=>l.endSeconds-l.startSeconds>=.05);
 const timing=`projects/time-patina-paper/timing/scene-${i}.json`;
 await fs.writeFile(path.join(root,'public',timing),JSON.stringify({source:'user-provided-LRC',sourceFile:'inputs/original-lyrics.lrc',songOffsetSeconds:begin,cues:sceneLyrics},null,2));
 p.scenes.push({id:s.id,label:'',eyebrow:'',tailSeconds:sb.sceneTransitions[i-1]?.treatment.durationSeconds??0,appearance:{chapter:{visible:false},subtitles:{variant:'plain',color:'#303943',maxWidth:.88,fontFamily:'SimSun',fontWeight:500,edgeTreatment:'none'}},motion:{blueprint:s.blueprint,intensity:.5,seed:41+i,proofTimes:s.proofTimes},composition:{coordinateSpace:{width:1920,height:1080},nodes},camera:{preset:i===7||i===8?'pull':'push',intensity:.45,parallax:{enabled:true,strength:.4,focalDepth:-.7},keyframes:[{at:0,x:0,y:0,zoom:i===7||i===8?1.045:1.01},{at:1,x:i%2?9:-9,y:0,zoom:i===7||i===8?1.01:1.045}]},narration:{src:audio,timingSrc:timing,contentType:sceneLyrics.length?'song':'instrumental',startSeconds:0,durationSeconds:duration,text:sceneLyrics.map(l=>l.text).join(' ')},subtitles:sceneLyrics.map(l=>({fromSeconds:l.startSeconds,toSeconds:l.endSeconds,text:l.text})),events:s.beats.map(b=>({id:`${s.id}-${b.id}`,beatId:b.id,at:b.at,targetId:`paper-${i}-1`,visual:{kind:'emphasis',action:'settle',intensity:.18,durationSeconds:Math.min((1-b.at-.001)*(duration+(sb.sceneTransitions[i-1]?.treatment.durationSeconds??0)),Math.max(.2,(s.proofTimes.find(q=>q.id===b.proofTimeId).at-b.at+.015)*(duration+(sb.sceneTransitions[i-1]?.treatment.durationSeconds??0))))},proofTimeId:b.proofTimeId}))});
}
p.sceneTransitions=sb.sceneTransitions;
await fs.writeFile(path.join(dir,'project.json'),JSON.stringify(p,null,2));
await fs.writeFile(path.join(dir,'audio-split-provenance.json'),JSON.stringify({source:'inputs/original-song.wav',sampleRate:48000,frameRate:30,boundariesSeconds:starts,method:'lossless PCM excerpts aligned to nearest video frame',totalSeconds:starts.at(-1)},null,2));
console.log('Assembled 8 complete scenes with original song excerpts and original LRC timings.');
