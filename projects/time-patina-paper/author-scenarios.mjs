import fs from 'node:fs/promises';
const duration = 193.462313;
const chapters = [
 ['雨落旧信', '0–18.84 秒，前奏：蓝灰雨痕滑过旧纸窗，信封缓缓打开。', '雨窗与书桌'],
 ['折起昨日', '18.84–47.77 秒，主歌：纸片照片、空椅与信件组成失落的房间。', '空房与旧照片'],
 ['风翻记忆', '47.77–61.94 秒，情绪抬升：照片边缘扬起，碎片向远方移动。', '风中的档案长廊'],
 ['花开如初', '61.94–92.44 秒，首轮副歌：纸花从闭合到盛开，冷色渐暖。', '纸花与远山'],
 ['留白的海', '92.44–105.98 秒，间奏：海面纸纹、慢移地平线，给旋律呼吸。', '海岸与撕边云'],
 ['重新拼合', '105.98–134.83 秒，第二主歌：散落的纸片重新组成完整的窗景。', '拼合的窗与田野'],
 ['放过自己', '134.83–166.91 秒，第二副歌：人物从蜷坐到舒展站立，纸花铺展，镜头拉开。', '人物与日光花田'],
 ['交给时间', '166.91–193.462313 秒，尾奏：信件合上、花瓣缓行，晨光停在纸页上。', '晨光与完整纸页'],
];
const expanded = [chapters[0], ['雨后空椅','18.84–33 秒，空椅与雨窗留住失落。','雨后房间'], ['信中旧日','33–47.77 秒，信与照片渐渐展开。','档案桌面'], chapters[2], ['花苞见光','61.94–77 秒，纸花由花苞展开。','花园局部'], ['把遗憾放远','77–92.44 秒，远山与花田接续副歌。','远山花田'], chapters[4], ['破碎与拾起','105.98–120 秒，碎片向同一页汇集。','旧纸窗框'], ['窗外有春天','120–134.83 秒，碎片拼成完整田野。','窗外田野'], ['重新站起','134.83–150 秒，人物由蜷坐转为直立。','人物剪影'], ['花向光生长','150–166.91 秒，花枝舒展，视野打开。','日光花田'], chapters[7]];
const familySpecs = [
 ['letter-open', ['sealed','unfolding','open','released']],
 ['paper-flower', ['bud','opening','bloom','wide-bloom']],
 ['human-release', ['curled','rising','upright','open-arms']],
 ['photo-repair', ['torn','aligned','joined','whole']],
 ['window-open', ['closed','ajar','opening','open']],
 ['letter-close', ['open','folding','folded','closed']],
 ['petal-fall', ['attached','loose','drifting','resting']],
 ['page-turn', ['flat','raised','turning','settled']],
 ['sun-reveal', ['hidden','rim','half','full']],
 ['branch-unfurl', ['tight','bent','stretching','open']],
];
const options = [
 {id:'draft',storyScope:'concise',n:8,layered:0,ambient:0,required:1,enhancement:0,states:3,motions:1,cap:12},
 {id:'balanced',storyScope:'standard',n:8,layered:4,ambient:2,required:3,enhancement:0,states:3,motions:2,cap:28},
 {id:'full-depth',storyScope:'expanded',n:12,layered:12,ambient:6,required:6,enhancement:4,states:4,motions:3,cap:66},
].map(c=>{
 const source = c.n===12 ? expanded:chapters;
 const heroIndices = c.id==='balanced' ? [0,3,5,6] : Array.from({length:c.layered},(_,i)=>i);
 const scenes=source.map(([label,beat,world],i)=>{
  const layered=heroIndices.includes(i);
  return {id:`${c.id}-scene-${String(i+1).padStart(2,'0')}`,label,beat,characterActions:[i===0?'信封打开，露出无文字的旧信纸':i===6?'人物逐渐舒展，视野变得开阔':'纸片、照片或花枝沿旋律舒缓移动'],stateFamilies:[],layers:{rear:layered?[`${world}完整远景底板`]:[],mid:[`${world}主体纸片`],front:layered?['独立撕边纸片与花枝']:[],near:layered?['稀疏纸纤维前景']:[]},sourcePackages:[{id:`${c.id}-source-${i+1}`,strategy:layered?'context-preserving-layer-edits':'single-background',providerCalls:layered?4:1,localDerivatives:layered?3:0,avoidedCalls:0}],parallax:layered,ambientElements:i<c.ambient?['稀疏纸屑随风缓慢移动，避开歌词']:[],localMotionTargets:Array.from({length:c.motions},(_,j)=>({targetId:`paper-${i+1}-${j+1}`,preset:j===0?'translate':j===1?'breathe':'sway'}))};
 });
 for(let i=0;i<c.required+c.enhancement;i++){
  const [id,states]=familySpecs[i];
  const sceneIndex=c.id==='balanced'?[0,3,6][i]:i===0?0:i===1?4:i===2?9:i===5?11:i;
  scenes[sceneIndex].stateFamilies.push({id,necessity:i<c.required?'required':'enhancement',states:states.slice(0,c.states)});
 }
 return {id:c.id,storyScope:c.storyScope,durationSeconds:duration,sceneCount:c.n,estimatedNarrationSeconds:duration,rationale:'保留整首原曲与全部歌词，制作深度只影响纸片动画和分层密度，不删减音乐。',scenes,semanticActionCoverage:[{actionId:'open-memory-letter',sceneId:scenes[0].id,targetId:'memory-letter',execution:'registered-state',stateRef:{poseFamilyId:'letter-open',stateId:'open'},visibleResult:'封闭信封展开为露出信纸的打开状态。'},{actionId:'gather-fragments',sceneId:scenes[c.n===12?7:5].id,targetId:`paper-${c.n===12?8:6}-1`,execution:'local-motion',localMotionTargetId:`paper-${c.n===12?8:6}-1`,visibleResult:'可见纸片从分散位置缓慢汇集，形成完整画面的秩序。'}],proposedImageAttemptLimit:c.cap,providerRecommendation:{text:'host-text：当前 Codex 模型负责故事与 Remotion 编排',image:'host-image：当前 image_gen 工具，使用账户现有图像额度',voice:'manual-voice：导入用户提供的原曲，不生成配音、不克隆声音'},costNote:'预计次数包含风格样片、分层源图与整套状态图；失败和重试同样计入上限。当前工具不提供货币报价，因此不承诺具体费用，不接入外部付费 API。',factsAndRightsRisks:['仅制作用户提供歌曲的本地 MV；不外发，不使用歌手肖像。'],finalEffect:c.id==='draft'?'8 幕纸片画面与歌词节奏，1 组信件状态，镜头轻移；适合快速看完整创意。':c.id==='balanced'?'8 幕，4 幕独立纵深分层，信件、花朵、人物共 3 组状态；在副歌与转折处明显增加动画表现。':'12 幕全部独立纵深分层，10 组道具与人物状态，持续但克制的局部动画；画面变化最丰富。'};
});
const input={requested:{durationSeconds:duration,sceneCount:null},commonStory:{logline:'一个人翻开旧信，在雨、碎片与花开的纸片世界里重新拼合自己，最后把遗憾留给时间。',audience:'喜欢中文抒情音乐、怀旧与自愈主题的观众',theme:'释怀是放过自己，允许记忆留痕，让生活重新生长。',ending:'信件合上，晨光照亮完整的纸页；不再执着修复过去，而是平静望向新的生活。',beats:chapters.map(x=>x[1]),semanticActions:[{id:'open-memory-letter',summary:'开场信封真实打开，成为进入回忆的入口。',requiredExecution:'registered-state'},{id:'gather-fragments',summary:'第二主歌纸片从零散汇集，传达重新整合自己的主题。',requiredExecution:'local-motion'}]},options};
await fs.writeFile(new URL('./scenarios-input.json',import.meta.url),JSON.stringify(input,null,2)+'\n');
