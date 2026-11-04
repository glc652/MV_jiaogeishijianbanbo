import fs from 'node:fs/promises';
const dir = new URL('./', import.meta.url);
const read = async name => JSON.parse(await fs.readFile(new URL(name, dir), 'utf8'));
const write = (name, value) => fs.writeFile(new URL(name, dir), JSON.stringify(value, null, 2));
const original = await read('requests/human-release-sheet.json');
const families = [
  {id:'human-letter',scene:1,states:['letter-low','letter-read','letter-rest'],facing:['front','front','front'],
    action:'All three figures sit on the ground, knees comfortably bent and shoes planted, seen from the same front three-quarter camera. The pelvis, legs and feet remain IDENTICAL across the three cells; ONLY arms, paper and head change. Top-left: both hands hold ONE folded cream letter low above the lap, head bowed. Top-right: both hands lift and unfold the SAME letter slightly in front of the chest, eyes gently lowered reading, elbows close to torso. Bottom-left: after reading, both hands lower the open letter onto the lap, head lifts a little with a thoughtful expression. Both hands actually grip the edges of the paper in every cell. No envelope, chair, table or other objects.'},
  {id:'human-album',scene:2,states:['album-open','album-turn','album-held'],facing:['front','front','front'],
    action:'All three figures sit on the ground in exactly the same relaxed bent-knee seated position from the same front three-quarter camera, with fixed pelvis, feet and legs. Top-left: holds ONE small warm-brown cloth-bound open photo album across the lap with both hands; two tiny muted coastal photographs visible. Top-right: left hand supports the SAME album in exactly the same location while the right hand gently turns ONE page, raised page in mid-arc, head glancing down. Bottom-left: album is now CLOSED, the SAME brown album held upright close against the chest by both hands; shoulders relax, head slightly raised. Anatomically clear wrists and fingers; hands touch the album, no duplicated books. No chair, table, extra papers or setting.'},
  {id:'human-seaward',scene:3,states:['sea-profile','sea-lookback','sea-lift'],facing:['right','right','right'],
    action:'All three full-body figures stand still with IDENTICAL feet, legs, pelvis and body scale, in a graceful three-quarter profile facing to image RIGHT. Top-left: looking quietly right toward the horizon, arms relaxed down, shoulders a little closed. Top-right: feet and lower body stay fixed facing right while head and shoulders gently turn back toward the viewer LEFT, an expressive looking-back gesture, anatomically natural neck, no exaggerated twist. Bottom-left: gently returns gaze to the RIGHT and lifts chin slightly, shoulders relaxed and open, right hand lightly resting on coat lapel. Maintain the same coat silhouette except tiny natural cloth differences. No letter, book, props or scenery.'}
];
const common='Use case: illustration-story. Asset type: registered animation pose sheet for an elegant melancholic music video. Reference image: immutable character identity and printed paper material. Create ONE complete square 2x2 sheet at least 1024x1024 with true transparent background. Three occupied equal cells: top-left, top-right, bottom-left. Bottom-right entirely empty transparent. No grid lines, borders, labels or text. Same anonymous slim adult man as reference: short dark wavy hair, knee-length indigo coat, brown waistcoat, ivory shirt and trousers, dark flat shoes, understated face, warm cream cut-paper outline, detailed fine sepia halftone and tactile vintage print. Maintain one consistent head size and anatomy across ALL cells. No costume changes. Each cell has generous clear margin; every figure and all shoes entirely inside its own cell. Put the contact baseline at 88% of cell height, horizontally centered at 50%. Standing equivalent height 74% of cell; seated figures naturally shorter, never enlarge seated heads to fill the cell. All internal spaces show real alpha, no checkerboard, ground shadow, background or glow. Exactly two arms and two legs per figure. Quiet, beautiful, mature album illustration; no glossy rendering, neon, caricature or child proportions. ';
for(const f of families){
 const r=structuredClone(original);r.assetId=f.id+'-sheet';r.output=`public/projects/time-patina-paper/assets/${r.assetId}.png`;
 r.prompt=r.styleProfileBinding.directives.join('\n')+'\n'+common+f.action;
 r.compositionBinding.sceneId=`balanced-scene-0${f.scene}`;r.compositionBinding.registrationId=f.id+'-registration';r.compositionBinding.sourceMasterAssetId=r.assetId;
 r.semanticBinding.generationFamily.familyId=f.id;r.semanticBinding.generationFamily.stateMemberIds=f.states;
 const s=r.stateSheetBinding;s.poseFamilyId=f.id;s.registrationId=r.compositionBinding.registrationId;s.sourceMasterAssetId=r.assetId;
 s.states=f.states.map((stateId,i)=>({stateId,row:Math.floor(i/2),column:i%2,facing:f.facing[i],anchors:[{id:'contact',x:.5,y:.88}]}));
 await write(`requests/${r.assetId}.json`,r);
}
const c=await read('semantic-contracts.json');delete c.fingerprint;delete c.updatedAt;
const identity=c.contracts.find(c=>c.id==='paper-person-identity');identity.invariants=['所有姿态保持同一成年修长身形、短深色头发、及膝靛蓝长外套、米白长裤和细腻纸张质感。','坐姿、侧身与回望允许视角改变，但头身比例与身份辨识度连续。'];identity.members[0].fingerprint.faceOrFront='简洁匿名面容；正面、三分之二侧身与回望保持同一身份';
await write('semantic-contracts-character-v5.json',c);
await write('character-v5-families.json',families);
console.log('Authored 3 character sheet requests and semantic contract input; no provider calls.');
