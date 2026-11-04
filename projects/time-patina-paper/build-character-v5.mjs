import fs from 'node:fs/promises';
import {buildPlanningScenarios,buildCreativePlanFromScenario} from '../../scripts/planning-scenario-lib.mjs';
import {assertApprovedImageBudgetDecision,assertCreativePlanReady} from '../../scripts/creative-plan-lib.mjs';
import {storyboardAuthoringFromCompiled,prepareSemanticRevision} from '../../scripts/directing-revision-lib.mjs';
import {motionLanguageCard} from '../../scripts/motion-contract-lib.mjs';
import {syncReviewFromProduction} from '../../scripts/production-state.mjs';
const dir='projects/time-patina-paper/',slug='time-patina-paper';
const read=async n=>JSON.parse(await fs.readFile(dir+n,'utf8'));
const write=async(n,x)=>fs.writeFile(dir+n,JSON.stringify(x,null,2));
const p=await read('project.json'),current=await read('storyboard.json'),production=await read('production.json'),families=await read('character-v5-families.json'),oldScenarios=await read('planning-scenarios.json');
await fs.mkdir(dir+'versions/v4',{recursive:true});
for(const n of ['project.json','storyboard.json','production.json','planning-scenarios.json']){try{await fs.copyFile(dir+n,dir+'versions/v4/'+n,fs.constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;}}
const sb=storyboardAuthoringFromCompiled(structuredClone(current));
const mapping=new Map([[0,families[0]],[1,families[1]],[2,families[2]],[5,families[1]],[7,families[2]]]);
const actions={0:['人物坐在雨窗边低握旧信，等待有了具体对象。','双手把信纸展开抬起阅读，右侧纸框呈现旧信的细节。','读完将信纸放回膝上，抬头想起照片里的海。'],1:['主人公坐着托起旧相册，看向其中的海岸照片。','右手翻过一页，照片与干花书签引出花坡回忆。','合上相册抱在胸前，决定重返照片里的海岸。'],2:['主人公侧身望向海面，衣摆随风轻动。','头肩回望身后的方向，远处船与纸飞机经过。','重新抬头看向海平线，视野缓缓拉开。'],5:['主人公坐着打开相册，散落照片等待归位。','一边翻阅，一边让照片依次回到相册页面。','旧信收好、相册合上抱在怀里，保留回忆而不再追问。'],7:['人物侧身站在开阔海边，与开场低坐呼应。','短暂回望，旧信和书签留在身后纸页上。','回正并抬头面向远方，片名在留白中出现。']};
for(const [i,f] of mapping){
 const s=p.scenes[i],b=sb.scenes[i];const old=s.composition.nodes.find(n=>n.id==='paper-person');
 const spec=await read(f.id+'-process-v5.json');
 const states=spec.states.map((state,j)=>({id:state.id,src:`projects/${slug}/assets/character-v5/${f.id}-${state.id}.png`,at:b.beats[j].at,facing:state.facing,anchors:state.anchors,identityReferenceAssetId:'paper-person-reference',identityReferenceSha256:'a0fef410f4cc80a08a12639668e5ff9afe0435336d7bb77cec25a15006d4a205'}));
 const bands=Object.fromEntries(states.map(st=>[st.id,f.id==='human-seaward'?[0,.12,.28,.56,.75,.88,1]:[0,.32,.48,.64,.76,.88,1]]));
 const node={...old,kind:'state-sequence',poseFamilyId:f.id,registration:{id:f.id+'-registration',sourceMasterAssetId:f.id+'-sheet',canvas:{width:650,height:650},origin:'top-left'},anchorPolicy:spec.anchorPolicy,states,playback:{mode:'once',cycles:1},transition:{type:'crossfade',durationSeconds:.75,registrationBands:bands}};delete node.src;
 if(i===1||i===5){node.transform.width=.30;node.transform.height=.30*1920/1080;}
 if(i===2){node.transform.x=.26;node.transform.width=.26;node.transform.height=.26*1920/1080;}
 if(i===7){node.transform.width=.23;node.transform.height=.23*1920/1080;}
 s.composition.nodes=s.composition.nodes.map(n=>n.id==='paper-person'?node:n);
 const ground=s.composition.nodes.find(n=>n.id==='story-ground');ground.transform.x=node.transform.x;ground.transform.width=node.transform.width*.75;
 for(const [j,beat]of b.beats.entries()){
  beat.treatments=beat.treatments.filter(t=>t.targetId!=='paper-person');
  beat.purpose=beat.visual=actions[i][j];
  beat.treatments.push({id:`${b.id}-${f.id}-${j}`,targetId:'paper-person',importance:'hero',necessity:'required',changeClass:'pose-change',motion:{kind:'state-sequence',poseFamilyId:f.id,stateId:states[j].id,facing:states[j].facing,visualChange:actions[i][j],playback:'once',transition:'crossfade'},composition:{pattern:'free'},graphic:null,semanticRisk:'identity',proofTimeId:beat.proofTimeId,rationale:'同一主人公的动作与道具接触发生变化；注册脚底接地点与头身比例，连续补间后检查手部和轮廓，不做滑行假步行。'});
  const proof=b.proofTimes.find(q=>q.id===beat.proofTimeId);proof.stateAssertions=[...(proof.stateAssertions??[]).filter(a=>a.nodeId!=='paper-person'),{nodeId:'paper-person',stateId:states[j].id}];
 }
 if(i===1||i===5){s.composition.nodes=s.composition.nodes.filter(n=>n.id!=='memory-album');for(const beat of b.beats)beat.treatments=beat.treatments.filter(t=>t.targetId!=='memory-album');}
 if(i===5){
  const group=s.composition.nodes.find(n=>n.id==='animated-ensemble-6');
  for(const n of group.children.filter(n=>n.id.startsWith('memory-photo-'))){
   const j=Number(n.id.match(/-(\d+)/)[1]),start=6+j*5,dur=s.narration.durationSeconds+s.tailSeconds;
   n.motion.keyframes=Array.from({length:Math.ceil(dur*30)+1},(_,frame)=>{const t=frame/30,q=Math.max(0,Math.min(1,(t-start)/2.4)),u=q*q*(3-2*q),fade=Math.max(0,Math.min(1,(t-start-2)/.4));return{at:Math.min(1,t/dur),offsetX:(node.transform.x-n.transform.x)*u,offsetY:(.585-n.transform.y)*u-.018*Math.sin(Math.PI*u),scale:1-.80*u,rotation:-n.transform.rotation*u,opacity:1-fade,ease:'linear'};});
  }
 }
 s.proofTimes=structuredClone(b.proofTimes);
}
const flowerHero=p.scenes[3].composition.nodes.find(n=>n.id==='paper-person');flowerHero.src=`projects/${slug}/assets/character-v5/human-letter-letter-rest.png`;
// Recompile the explicitly approved three-family addendum; retain original scenario and budget audit in versions/v4.
const input={requested:oldScenarios.requested,commonStory:oldScenarios.commonStory,options:oldScenarios.options.map(o=>({...o,proposedImageAttemptLimit:o.providerEstimate.proposedImageAttemptLimit,providerRecommendation:o.providerEstimate.recommendation,costNote:o.providerEstimate.costNote}))};
const option=input.options.find(o=>o.id==='balanced');
for(const [i,f]of mapping){option.scenes[i].stateFamilies.push({id:f.id,necessity:'required',states:f.states});option.scenes[i].characterActions=actions[i];}
option.finalEffect+=' 经用户角色扩充追加方案，新增读信、翻相册、海边回望三组动作共9态，原有纸片风格及故事结构保持。';
const scenarios=buildPlanningScenarios({slug,intake:p.intake,input});
const derived=buildCreativePlanFromScenario({slug,scenarios,optionId:'balanced'});
const revisedPlan={...p.plan,motionBudget:derived.motionBudget,scenarioBinding:derived.scenarioBinding,profilePromise:derived.profilePromise};
const authorization={schemaVersion:1,id:'character-variety-v5',slug,source:'asset-production-feedback',allowedSceneIds:[0,1,2,5,7].map(i=>sb.scenes[i].id),humanNote:'用户要求角色造型多一点，在故事性基础上丰富美观；在三组动作表、9个新姿态及总上限34次方案后明确回复继续。',equivalentQualityEvidence:['新增三组完整角色动作表，每组3态，沿用同一角色参考。','已通过正式增额命令记录28→34次，保留原预算审计。','角色动作、接地与道具交互需重新渲染检查，未复用旧画面通过结论。'],decidedAt:new Date().toISOString()};
const result=prepareSemanticRevision({currentStoryboard:current,suppliedStoryboard:sb,plan:revisedPlan,styleProfile:p.styleProfile,production,authorization,reportPath:dir+'semantic-revision.json',scenarioOption:scenarios.options.find(o=>o.id==='balanced')});
result.plan.approvedImageBudget=assertApprovedImageBudgetDecision({imageAttemptLimit:p.plan.approvedImageBudget.imageAttemptLimit},result.plan,result.storyboard.directingSummary,{at:p.plan.approvedImageBudget.approvedAt});
assertCreativePlanReady(result.plan,{slug});
p.plan=result.plan;p.motionContract=result.storyboard.motionContract;p.editorial=result.storyboard.editorial;
for(let i=0;i<p.scenes.length;i++)p.scenes[i].proofTimes=structuredClone(result.storyboard.scenes[i].proofTimes);
await write('character-v5-authorization.json',authorization);await write('project-character-v5-candidate.json',p);await write('storyboard-character-v5.json',result.storyboard);await write('planning-scenarios-character-v5.json',scenarios);await write('semantic-revision-character-v5.json',result.report);
if(process.argv.includes('--install')){
 await write('planning-scenarios.json',scenarios);await write('storyboard.json',result.storyboard);await write('project.json',p);await write('production.json',result.production);await write('semantic-revision.json',result.report);await write('motion-language-card.json',motionLanguageCard(result.storyboard.motionContract));await syncReviewFromProduction(slug,result.production);
}
console.log(JSON.stringify({installed:process.argv.includes('--install'),stage:result.production.stage,motionApprovalInvalidated:result.report.motionApprovalInvalidated,motionBudget:p.plan.motionBudget,expected:p.plan.approvedImageBudget,scenes:[...mapping.keys()].map(i=>i+1)}));



