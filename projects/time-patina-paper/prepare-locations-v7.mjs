import fs from 'node:fs/promises';
const dir='projects/time-patina-paper/';
await fs.mkdir(dir+'versions/v6',{recursive:true});
for(const name of ['project.json','storyboard.json','production.json','planning-scenarios.json','quality-report.json']){
  try{await fs.copyFile(dir+name,dir+'versions/v6/'+name,fs.constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;}
}
const template=JSON.parse(await fs.readFile(dir+'requests/folded-yesterday.json','utf8'));
const specs=[
 ['rain-station-v7','balanced-scene-02','An empty small seaside railway platform at blue hour after rain. Oblique cinematic view along the platform, vanishing point at 68 percent width and 40 percent height. A delicate weathered iron canopy on the left, one elegant dark wooden bench at left middle, wet paving and long warm amber reflections, slender lamp posts receding toward misty hills on the right, a suggestion of railway tracks. Indigo blue grey rain clouds against cream paper. Beautiful quiet melancholy, a place where someone once waited. The entire lower 18 percent gently dissolves into ivory rag paper for lyrics; architecture remains fully visible above. No trains, no people, no signs, no clock numbers, no text.'],
 ['coastal-train-v7','balanced-scene-03','Inside an old empty railway carriage during a quiet coastal journey, cinematic eye-level oblique perspective. Large rounded rectangular window dominates the left and central 65 percent; beyond it a pale blue sea, distant headland, telegraph wires, muted gold morning sky. A worn indigo upholstered bench occupies right middle and lower right, polished brown wood trim, thin warm sunlit curtains at far left. An ivory envelope rests on the small window table. Layered torn photographic paper and fine engraving. Intimate poetic transition from grief to openness. No people, no writing, no signage. Bottom 18 percent softly fades into light ivory paper for lyrics.'],
 ['morning-room-v7','balanced-scene-06','A quiet old attic room at golden morning, a complete cinematic interior with airy depth. Slanted roof rafters, tall open sash window on left looking toward a pale sea and far hills, a thin linen curtain gathered at left, warm sunbeam crosses aged timber floor. An empty wooden writing table and chair at right middle, small closed indigo photo album on table, tiny vase with a single dried stem and cream blossom. The room is ready for someone to return and put memories away. Understated nostalgic fine-art collage, not cluttered. Restrained honey light, washed indigo shadows. Bottom 18 percent fades into clean warm ivory paper. No people, no lettering, no words.']
];
for(const [id,sceneId,description]of specs){
 const r=structuredClone(template);r.assetId=id;r.output=`public/projects/time-patina-paper/assets/${id}.png`;
 r.compositionBinding.sceneId=sceneId;r.compositionBinding.nodeId=id;
 r.prompt=r.styleProfileBinding.directives.join('\n')+'\nCreate one exquisite full-frame cinematic paper-collage environment. Exact landscape 1672x941, no panels or contact sheet. Aged ivory cotton paper, muted indigo photographic printing, restrained amber, sepia halftone, tactile torn edges and shallow paper shadows, realistic elegant proportions. '+description+' Gallery quality, richly detailed but spacious. No text, logos or watermarks. Opaque background. The architectural perspective must be coherent.';
 await fs.writeFile(dir+`requests/${id}.json`,JSON.stringify(r,null,2));
}
console.log('Backed up v6 and authored three landscape requests.');
