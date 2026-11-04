import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
const dir='projects/time-patina-paper/';
const read=async n=>JSON.parse(await fs.readFile(dir+n,'utf8'));
const p=await read('versions/v6/project.json');
const sb=storyboardAuthoringFromCompiled(await read('versions/v6/storyboard.json'));
const slots=[
  [0,11.9,14.4,'rain-station-v7','雨夜站台：读完旧信，想起那次等待','rain','dissolve'],
  [1,5.2,10.0,'rain-station-v7','站台灯火：尚未问出口的离别','rain','wipe-left'],
  [1,17.7,21.7,'coastal-train-v7','车窗旅途：把照片里的海变成目的地','train','wipe-left'],
  [3,5.3,10.7,'morning-room-v7','晨光旧屋：花与相册的来处','sunlight','dissolve'],
  [4,2.6,6.6,'wind-memory','海边小径：在间奏中向前','sea','wipe-up'],
  [5,4.8,10.6,'morning-room-v7','回到旧屋：让回忆找到归处','sunlight','dissolve'],
  [5,19.0,21.8,'folded-yesterday','桌边旧信：曾经追问的答案','sunlight','wipe-left'],
  [6,5.7,11.1,'flower-garden-master','花坡再访：季节已悄悄改变','garden','dissolve'],
  [6,19.9,23.7,'wind-memory','通向远方的海径：给放下留一段路','sea','wipe-left'],
  [7,5.4,9.0,'morning-room-v7','晨光收束：回忆安放，生活继续','sunlight','dissolve'],
];
const still={keyframes:[{at:0,offsetX:0},{at:1,offsetX:0}],idle:{preset:'still',intensity:0,cycleSeconds:8}};
const full={x:0,y:0,width:1,height:1,anchorX:0,anchorY:0};
// Replace secondary paper-strip drift with whole-location directing. The main
// character, ocean, flowers and camera performances remain intact.
for(const index of new Set(slots.map(s=>s[0]))){
 for(const beat of sb.scenes[index].beats)for(const t of beat.treatments){
  if(t.targetId.startsWith('paper-') && t.targetId!=='paper-person' && t.motion.kind==='continuous-transform'){
   t.motion={kind:'static'};t.changeClass='static-hold';
   t.rationale='v7 装饰纸条作为静态边框，运动注意力让给整幅地点镜头及角色表演。';
  }
 }
 for(const node of p.scenes[index].composition.nodes)if(/^paper-\d+-\d+$/.test(node.id))node.motion=structuredClone(still);
}
const rows=[];
for(const [k,[index,start,end,asset,label,atmosphere,transition]] of slots.entries()){
 const s=p.scenes[index],b=sb.scenes[index],id=`location-shot-${k+1}`;
 const bg={id:asset+(k?'--'+k:''),kind:'asset',assetRole:'environment',src:`projects/time-patina-paper/assets/${asset}.png`,z:0,depth:0,transform:{...full},motion:structuredClone(still)};
 // Existing sea plates have genuine bounded water; architecture and horizon stay fixed.
 if(asset==='wind-memory')bg.motion.performance={kind:'water',region:{left:.29,right:.58,top:.43,bottom:.57},phase:48};
 const from=k%2?{zoom:1.055,x:12,y:-6}:{zoom:1.04,x:-12,y:-3};
 const to=k%2?{zoom:1.10,x:-20,y:-12}:{zoom:1.095,x:18,y:-10};
 const node={id,kind:'group',pattern:'free',z:50,coordinateSpace:{width:1920,height:1080},transform:{...full},motion:structuredClone(still),locationShot:{label,startSeconds:start,endSeconds:end,transitionSeconds:transition==='dissolve'?.7:.85,transition,atmosphere,camera:{from,to}},children:[bg]};
 s.composition.nodes.push(node);
 b.beats[0].treatments.push({id:`${s.id}-${id}`,targetId:id,importance:'supporting',necessity:'enhancement',changeClass:'ambient-motion',motion:{kind:'continuous-transform',preset:'drift'},composition:{pattern:'free'},graphic:null,semanticRisk:'decorative',proofTimeId:b.beats[0].proofTimeId,rationale:`v7 环境插镜 ${start}–${end} 秒：${label}。保持章节歌曲与主角动作；独立整幅环境轻推移，${transition}连接；专属前中后帧复核见 location-v7-plan.json。`});
 const chapterStart=p.scenes.slice(0,index).reduce((a,s)=>a+s.narration.durationSeconds,0);
 rows.push({id,sceneId:s.id,chapter:index+1,asset,label,startSeconds:chapterStart+start,endSeconds:chapterStart+end,localStart:start,localEnd:end,transition,proofSeconds:[chapterStart+start+1.1,chapterStart+(start+end)/2,chapterStart+end-1.1]});
}
const plan={version:7,authorization:'用户认可 v6，明确要求在保留动画和故事基础上增加实际场景。',unchangedStoryChapters:8,newLocations:3,locationInserts:slots.length,visualSegments:8+slots.length*2,sourceBackgroundCount:11,imageAttemptsAdded:3,sourceTreatment:'全画幅独立环境；不把单张不透明图冒充可独立移动的多层环境。',shots:rows};
await fs.writeFile(dir+'location-v7-plan.json',JSON.stringify(plan,null,2));
await fs.writeFile(dir+'project-locations-v7.json',JSON.stringify(p,null,2));
await fs.writeFile(dir+'storyboard-locations-v7.json',JSON.stringify(sb,null,2));
console.log(JSON.stringify({newLocations:3,inserts:slots.length,visualSegments:plan.visualSegments}));
