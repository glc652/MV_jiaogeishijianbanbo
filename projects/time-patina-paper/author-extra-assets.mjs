import fs from 'node:fs/promises';
import {styleProfileBinding} from '../../scripts/style-catalog-lib.mjs';
const dir=new URL('./',import.meta.url);
const read=async f=>JSON.parse(await fs.readFile(new URL(f,dir),'utf8'));
const p=await read('project.json'),binding=styleProfileBinding(p.styleProfile);
const semantic=await read('semantic-input.json');
const checks=['silhouette-fidelity','negative-space-clean','background-leak-free'];
for(const [id,title,scene,node,parts] of [['letter-topology','旧信展开结构','balanced-scene-01','memory-letter',['完整信封','翻开的封口','同一张空白信纸']],['flower-topology','花朵绽放结构','balanced-scene-04','flower',['一支连续茎','完整叶片','同一朵花由花苞到开放']]]) {
 if(!semantic.contracts.some(c=>c.id===id))semantic.contracts.push({id,kind:'topology',title,invariants:['完整纸片轮廓，不增添无关部件；所有状态保持同一纸张、配色和固定底部位置。'],subjectIds:[node],requiredVisibleParts:parts,requiredNegativeSpaces:['物件外围透明空隙'],evidenceTargets:[{id:'outline',scope:'asset',checks,shots:[{sceneId:scene,nodeId:node,proofTimeIds:['established','transforming','resolved']}]}]});
}
await fs.writeFile(new URL('semantic-production-input.json',dir),JSON.stringify(semantic,null,2));
const free={
 'folded-yesterday':{scene:2,prompt:'A cinematic still life of a single folded ivory letter in the lower-left, a large weathered empty indigo picture frame tilted on an old desk, a faint torn monochrome photograph of a quiet empty street behind. Cool rainy blue light. Spacious ivory right half. Nostalgia without human figures.'},
 'wind-memory':{scene:3,prompt:'Poetic wind and passing time: an old empty seaside lane receding diagonally through torn indigo archival photo strips, several blank ivory page corners sweeping toward the upper right as a carefully composed still collage. A faint ochre moon, cool mist, beautiful sparse composition. Keep the middle legible.'},
 'time-outro':{scene:8,prompt:'An expansive calm sea at dawn inside one horizontal torn old photograph, faded blue mountains on the horizon, an understated small gold sun toward upper-right, a single pressed ivory flower tucked at far left. The central ivory paper above the sea is spacious for editable title, bottom ivory paper clear. Quiet release, warmth and silence.'}
};
for(const [assetId,c] of Object.entries(free)) {
 const request={schemaVersion:8,projectSlug:p.slug,assetId,capability:'image',output:`public/projects/${p.slug}/assets/${assetId}.png`,prompt:binding.directives.join('\n')+'\nCreate an exquisite fine-art paper collage in exact landscape 1672x941. Aged ivory paper, muted indigo printed photographic textures, restrained amber light, handmade ragged edges, shallow physical paper shadows. '+c.prompt+' No words, letters, text, logos, people or watermarks. Bottom 18 percent quiet ivory for editable Chinese lyrics. Gallery quality and rich tactile detail, no digital glossy effects.',styleProfileBinding:binding,outputSurface:{mode:'opaque'},compositionBinding:{sceneId:`balanced-scene-0${c.scene}`,nodeId:`background-${c.scene}`,pattern:'free',outputRole:'background',canvas:{width:1672,height:941},derivation:{method:'provider-generation'}},semanticBinding:{riskClass:'decorative',contractIds:[]},quality:{requiredChecks:['no-text','no-watermark','no-people','style-consistent','style-profile-conformant','safe-area-clear']}};
 await fs.writeFile(new URL(`requests/${assetId}.json`,dir),JSON.stringify(request,null,2));
}
