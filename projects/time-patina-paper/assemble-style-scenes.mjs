import fs from 'node:fs/promises';
const dir=new URL('./',import.meta.url);
const read=async f=>JSON.parse(await fs.readFile(new URL(f,dir),'utf8'));
const p=await read('project.json'),sb=await read('storyboard.json'),manifest=await read('assets-manifest.json');
const record=id=>[...manifest.assets].reverse().find(a=>a.assetId===id&&a.lifecycle.status==='active');
const src=id=>record(id).file.replaceAll('\\','/').replace(/^public\//,'');
const transform={x:0,y:0,width:1,height:1,anchorX:0,anchorY:0};
const still={keyframes:[{at:0},{at:1}],idle:{preset:'still',intensity:0,cycleSeconds:8}};
const slow={keyframes:[{at:0,offsetX:-0.008},{at:0.86,offsetX:0.008},{at:1,offsetX:0.008}],idle:{preset:'breathe',intensity:0.15,cycleSeconds:8}};
const asset=(id,assetId,z,depth=0)=>({id,kind:'asset',assetRole:'environment',src:src(assetId),z,depth,transform:{...transform},motion:structuredClone(still)});
const starts={ 'balanced-scene-01':0,'balanced-scene-07':134.83};
p.scenes=[0,6].map(i=>{
 const s=sb.scenes[i];
 const nodes=[];
 if(i===0){
  const family=JSON.parse(JSON.stringify(record('rain-window-rear-registered').registeredFamilyBinding));
  const plan=sb.directingSummary.generationBudget.sourcePackagePlans.find(x=>x.sceneId===s.id);
  nodes.push({id:'world-1',kind:'group',pattern:'registered-depth-stack',stackingContext:'scene',z:0,coordinateSpace:{width:1672,height:941},registration:{id:'rain-window-family',sourceMasterAssetId:'rain-window-master',canvas:{width:1672,height:941},origin:'top-left'},layerStack:{sourcePackageId:plan.id,sourceStrategy:plan.sourceStrategy,motionCapability:plan.motionCapability,revealEnvelope:plan.revealEnvelope},transform:{x:-0.055,y:-0.055,width:1.11,height:1.11,anchorX:0,anchorY:0,scale:1,rotation:0,opacity:1},motion:structuredClone(still),children:['rain-window-rear-registered','rain-window-subject-registered','rain-window-front-registered'].map((id,j)=>({...asset(['rear','subject','front'][j],id,j,[-0.7,0,0.7][j]),slot:['support-rear','subject','support-front'][j],registrationId:'rain-window-family',motion:{keyframes:[{at:0,offsetX:-0.008*j},{at:0.86,offsetX:0.008*j},{at:1,offsetX:0.008*j}]}}))});
  const mt=s.beats.flatMap(b=>b.treatments).find(t=>t.motion.kind==='motif-field').motion;
  nodes.push({id:'dust-0',kind:'motif-field',motifs:[{id:'paper-dust',src:'projects/time-patina-paper/assets/dust.svg'}],count:mt.count,seed:29,distribution:mt.distribution,fieldMotion:{preset:mt.preset,cycles:mt.cycles},baseSize:0.004,variation:{scale:[0.5,1.3],rotation:[-25,25],opacity:[0.15,0.35]},bounds:mt.bounds,exclusionZones:mt.exclusionZones,z:5,transform:{...transform},motion:structuredClone(still)});
 }else{
  nodes.push(asset('style-backdrop','style-reference',0,-0.5));
  const sheet=record('human-release-sheet');
  const identity=record('paper-person-reference');
  nodes.push({id:'paper-person',kind:'state-sequence',assetRole:'character',poseFamilyId:'human-release',registration:{id:'human-release-registration',sourceMasterAssetId:'human-release-sheet',canvas:{width:627,height:627},origin:'top-left'},anchorPolicy:sheet.stateSheetBinding.anchorPolicy,states:['curled','rising','upright'].map((id,j)=>({id,src:`projects/time-patina-paper/assets/person-states/human-release-${id}.png`,at:s.beats.find(b=>b.treatments.some(t=>t.motion.kind==='state-sequence'&&t.motion.stateId===id)).at,facing:'front',anchors:[{id:'contact',x:0.5,y:0.88}],identityReferenceAssetId:identity.assetId,identityReferenceSha256:identity.sha256})),playback:{mode:'once',cycles:1},transition:{type:'crossfade',durationSeconds:0.55,registrationBands:{curled:[0,.47,.605,.74,.82,.88,1],rising:[0,.39,.525,.69,.80,.88,1],upright:[0,.04,.175,.50,.74,.88,1]}},z:5,transform:{x:0.56,y:0.73,width:0.32,height:0.57,anchorX:0.5,anchorY:0.88},motion:structuredClone(still)});
 }
 return {id:s.id,label:'',eyebrow:'',tailSeconds:0,motion:{blueprint:s.blueprint,intensity:0.5,seed:42+i,proofTimes:s.proofTimes},composition:{coordinateSpace:{width:1920,height:1080},nodes},camera:{preset:'push',intensity:0.5,parallax:{enabled:true,strength:0.5,focalDepth:0},keyframes:[{at:0,x:0,y:0,scale:1.02},{at:1,x:-9,y:0,scale:1.045}]},narration:{src:'projects/time-patina-paper/audio/original-song.wav',startSeconds:starts[s.id],durationSeconds:s.estimatedDurationSeconds,text:''},subtitles:[],events:s.beats.map(b=>({id:s.id+'-'+b.id,beatId:b.id,at:b.at,targetId:i===0?'world-1':'paper-person',visual:null,proofTimeId:b.proofTimeId}))};
});
p.sceneTransitions=[];
await fs.writeFile(new URL('../../public/projects/time-patina-paper/assets/dust.svg',dir),'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path d="M1 2L9 0 12 6 3 8Z" fill="#e3cda9"/></svg>');
await fs.writeFile(new URL('project.json',dir),JSON.stringify(p,null,2));
