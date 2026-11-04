import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
const dir='projects/time-patina-paper/', pub='public/projects/time-patina-paper/assets/animated-paper/';await fs.mkdir(pub,{recursive:true});
const p=JSON.parse(await fs.readFile(dir+'versions/v1/project.json','utf8'));
const sb=storyboardAuthoringFromCompiled(JSON.parse(await fs.readFile(dir+'versions/v1/storyboard.json','utf8')));
const palette=['#dfc99e','#e8ddc4','#90a0a0','#af8a50'];
const paper=(body,w=400,h=300)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><pattern id="grain" width="31" height="27" patternUnits="userSpaceOnUse"><path d="M2 4h2M17 20h3M26 8h1" stroke="#655741" stroke-width="1" opacity=".15"/></pattern><filter id="paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="3" seed="9" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="mono"/><feComposite in="mono" in2="SourceGraphic" operator="in" result="clipped"/><feBlend in="SourceGraphic" in2="clipped" mode="soft-light"/></filter><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-color="#332e25" flood-opacity=".3"/></filter></defs><g filter="url(#shadow)" stroke-linejoin="round"><g filter="url(#paper-grain)">${body}</g></g></svg>`;
const shapes={
 cloud:paper('<path d="M20 207Q0 149 63 137Q51 75 120 77Q144 12 205 54Q253 13 287 85Q356 59 362 132Q418 158 368 211L20 217Z" fill="#eee4d0" stroke="#cbb995" stroke-width="4"/><path d="M20 207Q0 149 63 137Q51 75 120 77Q144 12 205 54Q253 13 287 85Q356 59 362 132Q418 158 368 211L20 217Z" fill="url(#grain)"/>'),
 plane:paper('<path d="M17 103L380 28 270 262 203 161 138 202 137 141Z" fill="#eee3cc" stroke="#9f8c66" stroke-width="5"/><path d="M137 141L380 28 203 161 138 202Z" fill="#9da9a7" stroke="#8c846e" stroke-width="3"/><path d="M17 103L380 28 270 262 203 161 138 202 137 141Z" fill="url(#grain)"/>'),
 leaf:paper('<path d="M60 265Q0 92 337 25Q366 220 60 265Z" fill="#aa955f" stroke="#eadac0" stroke-width="9"/><path d="M48 277L303 52M103 226L102 119M143 184L141 88M143 184L263 180M202 130L306 128" stroke="#655f44" stroke-width="4" fill="none"/>'),
 petal:paper('<path d="M200 263Q22 164 74 71Q130 12 204 69Q272 3 333 75Q373 189 200 263Z" fill="#e7d3ac" stroke="#f6ebd4" stroke-width="10"/><path d="M200 252Q140 161 131 89M200 252Q260 162 278 95" stroke="#a9936e" stroke-width="2" fill="none"/>'),
 wave:paper('<path d="M8 160Q55 82 111 151T222 151T333 151T398 146L398 193Q352 201 333 188T222 189T111 189T8 194Z" fill="#d8e3dc" stroke="#ede3cb" stroke-width="5"/><path d="M15 158Q60 103 107 153T219 153T332 153" fill="none" stroke="#6e969a" stroke-width="3"/>'),
 boat:paper('<path d="M38 188L359 181 294 250 108 259Z" fill="#617b81" stroke="#eee1c2" stroke-width="9"/><path d="M190 180L190 28 62 180Z" fill="#eadabe" stroke="#9d8d71" stroke-width="3"/><path d="M204 180L208 60 305 168Z" fill="#bd9c60" stroke="#f2e4c9" stroke-width="5"/><path d="M36 188L355 183 294 250 108 259Z" fill="url(#grain)"/>'),
 'wing-left':paper('<path d="M365 267Q246 213 64 33L42 91 91 190 174 249 274 277Z" fill="#f0e7d0" stroke="#8b917e" stroke-width="5"/><path d="M64 72L272 254M93 130L257 264M145 202L239 270" fill="none" stroke="#c4b995" stroke-width="3"/>'),
 'wing-right':paper('<path d="M35 267Q154 213 336 33L358 91 309 190 226 249 126 277Z" fill="#f0e7d0" stroke="#8b917e" stroke-width="5"/><path d="M336 72L128 254M307 130L143 264M255 202L161 270" fill="none" stroke="#c4b995" stroke-width="3"/>'),
 'bird-body':paper('<path d="M184 74Q196 43 213 78L226 167 264 257 200 234 141 256 181 161Z" fill="#d7c59e" stroke="#f4e8cc" stroke-width="8"/><path d="M188 72L200 39 214 73Z" fill="#aa8951"/>'),
 butterfly:paper('<path d="M194 123Q57 -10 41 73Q18 163 164 169Q36 195 103 267Q160 290 197 178Q250 297 313 251Q371 186 234 166Q382 135 348 59Q310 -8 208 124Z" fill="#b79959" stroke="#f2e3c4" stroke-width="8"/><path d="M199 111L204 216M196 117L176 86M207 116L225 86" stroke="#444b47" stroke-width="9"/><path d="M73 72L163 137M278 236L227 191" stroke="#ece0c4" stroke-width="5"/>'),
 letter:paper('<path d="M50 20L350 26 345 271 45 268Z" fill="#ede0c3" stroke="#b8a27b" stroke-width="4"/><path d="M79 67L306 69M79 87L272 89M79 119L303 122M79 142L259 143M78 179L306 181M77 199L228 201" stroke="#897c67" stroke-width="3" opacity=".55"/><path d="M50 20L350 26 345 271 45 268Z" fill="url(#grain)"/>'),
 clock:paper('<circle cx="200" cy="150" r="122" fill="#ede1c7" stroke="#a68854" stroke-width="14"/><circle cx="200" cy="150" r="99" fill="none" stroke="#c5b38e" stroke-width="3"/>'+Array.from({length:12},(_,i)=>`<path d="M200 58v15" stroke="#5e635c" stroke-width="4" transform="rotate(${i*30} 200 150)"/>`).join('')),
 'clock-hand':paper('<path d="M192 154L196 56 206 53 208 153 203 174Z" fill="#4b605f"/><circle cx="200" cy="150" r="9" fill="#b39258"/>'),
 rain:paper('<path d="M215 22L180 263" stroke="#d2dfdc" stroke-width="9" opacity=".7"/><path d="M219 21L184 262" stroke="#f7e9cf" stroke-width="2"/>'),
 star:paper('<path d="M198 18L224 112 328 136 226 162 201 277 175 164 70 138 175 113Z" fill="#d9b76f" stroke="#f3e2b8" stroke-width="8"/>'),
};
for(let k=0;k<3;k++)shapes['photo-'+k]=paper(`<path d="M18 14L379 20 375 280 24 276Z" fill="#eadcc2" stroke="#9e8f73" stroke-width="4"/><path d="M39 35H356V228H39Z" fill="${['#819da0','#b6b899','#9bafab'][k]}"/><circle cx="${270-k*72}" cy="84" r="29" fill="#dcc083"/><path d="M39 175L139 86 206 169 269 123 356 191V228H39Z" fill="#4e696e"/><path d="M39 196Q119 149 196 195T356 193V228H39Z" fill="#a6aa88"/><path d="M18 14L379 20 375 280 24 276Z" fill="url(#grain)"/>`);
for(let k=0;k<3;k++){
 const imageName=['wind-memory','style-reference','time-outro'][k];
 const data=(await fs.readFile(`public/projects/time-patina-paper/assets/${imageName}.png`)).toString('base64');
 shapes['photo-'+k]=paper(`<defs><clipPath id="photo"><path d="M39 35H356V228H39Z"/></clipPath></defs><path d="M18 14L379 20 375 280 24 276Z" fill="#eadcc2" stroke="#9e8f73" stroke-width="4"/><image href="data:image/png;base64,${data}" x="-30" y="-24" width="460" height="270" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/><path d="M49 253H176M49 260H115" stroke="#b1a082" stroke-width="2"/>`);
}
for(const[name,svg]of Object.entries(shapes))await fs.writeFile(pub+name+'.svg',svg);
const schedules=[];
function add(scene,name,id,x,y,w,fn,{z=18,opacity=1,rotation=0,anchorX=.5,anchorY=.5,seconds=.12}={}){
 const dur=scene.narration.durationSeconds+scene.tailSeconds;
 const n=Math.ceil(dur/seconds),keyframes=Array.from({length:n+1},(_,j)=>{const t=j/n*dur;return {at:j/n,ease:'linear',...fn(t,dur)}});
 const node={id,kind:'asset',assetRole:'decorative',src:`projects/time-patina-paper/assets/animated-paper/${name}.svg`,z,depth:.3,transform:{x,y,width:w,height:w*1.333333,anchorX,anchorY,rotation,opacity},motion:{keyframes,idle:{preset:'still',intensity:0,cycleSeconds:5}}};
 scene.composition.nodes.push(node);schedules.push({sceneId:scene.id,nodeId:id,asset:name,duration:dur,keyframes:n+1});

 return node;
}
const bob=(phase=0,speed=3,ax=.015,ay=.025,rot=5)=>t=>({offsetX:ax*Math.sin(t/speed+phase),offsetY:ay*Math.sin(t/speed*1.7+phase),rotation:rot*Math.sin(t/speed+phase)});
function drifting(scene,name,count,{y=.25,w=.08,speed=10,span=.65,x=.5,z=18}={}){for(let j=0;j<count;j++){const phase=j*2.399;add(scene,name,`${name}-${j}`,x+(j-(count-1)/2)*.018,y+(j%3-.9)*.12,w*(.8+(j%3)*.16),t=>({offsetX:span/2*Math.sin(t/speed+phase),offsetY:.085*Math.sin(t/speed*1.4+phase),rotation:20*Math.sin(t/2.4+phase)}),{z});}}
function sea(scene){for(let j=0;j<5;j++)add(scene,'wave',`wave-${j}`,.15+j*.17,.42+(j%3)*.065,.16,t=>({offsetX:.055*Math.sin(t/2+j),offsetY:.012*Math.sin(t*1.4+j),scale:1+.09*Math.sin(t+j),opacity:.4+.15*Math.sin(t/2+j)}),{z:4});for(let j=0;j<2;j++)add(scene,'boat',`boat-${j}`,.22+j*.51,.54-j*.04,.11-j*.035,t=>({offsetX:.1*Math.sin(t/5+j*2),offsetY:.022*Math.sin(t*1.2+j),rotation:7*Math.sin(t*1.2+j)}),{z:9});}
function birds(scene,count){for(let j=0;j<count;j++){let x=.16+j*.16,y=(scene.id.endsWith('08')?.34:.23)+(j%2)*.085,w=.045+j*.003;for(const [part,dx,ax,sign]of [['wing-left',0,.9125,-1],['wing-right',0,.0875,1],['bird-body',0,.5,0]])add(scene,part,`bird-${j}-${part}`,x+dx,y,w,t=>({offsetX:.18*Math.sin(t/7+j*1.4),offsetY:.06*Math.sin(t/4+j*1.4),rotation:sign*28*Math.sin(t*4.4+j)+6*Math.sin(t/7+j)}),{z:21,anchorX:ax,anchorY:part==='bird-body'?.5:.89});}}
for(let i=0;i<8;i++){
 const scene=p.scenes[i];
 // Keep the approved hero animation, increase wind in the existing paper accents.
 for(const n of scene.composition.nodes.filter(n=>n.id.startsWith('paper-'))){if(n.id==='paper-person')continue;n.motion.idle={preset:'sway',intensity:1.1,cycleSeconds:3.7,phase:i};}
 const stack=scene.composition.nodes.find(n=>n.kind==='group'&&n.pattern==='registered-depth-stack');if(stack)for(const [j,n]of stack.children.entries())n.motion.keyframes=Array.from({length:25},(_,k)=>({at:k/24,offsetX:.012*j/2*Math.sin(k/24*Math.PI*5+j),offsetY:.006*j/2*Math.cos(k/24*Math.PI*4+j),rotation:.28*j/2*Math.sin(k/24*Math.PI*6),ease:'ease-in-out'}));
 if(i===0){for(let j=0;j<32;j++)add(scene,'rain',`rain-${j}`,.065+(j%10)*.049,.04+Math.floor(j/10)*.15,.009,t=>({offsetY:((t*.29+j*.037)%.58),opacity:.25+.35*Math.sin(Math.PI*((t*.29+j*.037)%.58)/.58)}),{z:3});drifting(scene,'letter',5,{x:.40,y:.39,w:.083,span:.55,speed:6,z:19});}
 if([1,5].includes(i)){for(let j=0;j<6;j++)add(scene,'photo-'+j%3,`memory-photo-${j}`,.43+(j%3)*.13,.23+Math.floor(j/3)*.32,.16,t=>({offsetX:.11*Math.sin(t/3.6+j*1.5),offsetY:.06*Math.sin(t/2.7+j*1.3),rotation:14*Math.sin(t/3+j),scale:1+.07*Math.sin(t/2+j)}),{z:8+j});add(scene,'clock','clock-face',.84,.20,.13,bob(0,4,.012,.01,3));add(scene,'clock-hand','clock-pointer',.84,.20,.13,t=>({...bob(0,4,.012,.01,3)(t),rotation:t*25}));drifting(scene,'leaf',5,{y:.57,w:.065,span:.8,speed:5});}
 if([2,4,7].includes(i)){sea(scene);drifting(scene,'cloud',3,{y:i===7?.40:.16,w:.13,span:.25,speed:10,z:3});birds(scene,i===4?4:3);}
 if(i===2)drifting(scene,'plane',3,{y:.32,w:.11,span:.78,speed:4});
 if(i===3){drifting(scene,'butterfly',4,{y:.32,w:.075,span:.6,speed:3});drifting(scene,'petal',9,{y:.5,w:.036,span:.83,speed:4});for(let j=0;j<4;j++){const n=add(scene,'leaf',`garden-leaf-${j}`,.13+j*.23,.70,.075,bob(j,1.5,.01,.02,13),{z:16,anchorY:.9});}}
 if(i===6){birds(scene,5);drifting(scene,'leaf',9,{y:.35,w:.045,span:.8,speed:4});drifting(scene,'cloud',2,{y:.14,w:.18,span:.3,speed:11,z:3});}
 if(i===7){drifting(scene,'petal',6,{y:.53,w:.035,span:.8,speed:5});drifting(scene,'star',4,{y:.35,w:.035,span:.6,speed:8});}
 if(i===6){
  for(const n of scene.composition.nodes.filter(n=>n.id.startsWith('leaf-'))){const j=Number(n.id.split('-')[1]);n.transform.x=j%2?.85:.15;n.transform.y=.2+(j%4)*.13;n.motion.keyframes=n.motion.keyframes.map(k=>({...k,offsetX:.09*Math.sin(k.at*(scene.narration.durationSeconds+scene.tailSeconds)/4+j),offsetY:.045*Math.sin(k.at*10+j)}));}
 }
 const actors=scene.composition.nodes.filter(n=>n.src?.includes('/animated-paper/'));
 scene.composition.nodes=scene.composition.nodes.filter(n=>!actors.includes(n));
 const id=`animated-ensemble-${i+1}`;
 scene.composition.nodes.push({id,kind:'group',pattern:'free',z:6,coordinateSpace:{width:1920,height:1080},transform:{x:0,y:0,width:1,height:1,anchorX:0,anchorY:0},motion:{keyframes:[{at:0,offsetX:-.004},{at:.5,offsetX:.004},{at:1,offsetX:-.004}]},children:actors});
 sb.scenes[i].beats[0].treatments.push({id:`${scene.id}-animated-ensemble`,targetId:id,importance:'supporting',necessity:'required',changeClass:'ambient-motion',motion:{kind:'continuous-transform',preset:'drift'},composition:{pattern:'free'},graphic:null,semanticRisk:'decorative',proofTimeId:'established',rationale:`响应用户持续动画反馈：本幕纸片舞台含 ${actors.length} 个独立运动部件。风场承载小幅移动，信纸/照片/波纹/纸船/纸鸟等子部件各自持续位置和转动动画，完整清单见 animation-inventory.json。`});
}
await fs.writeFile(dir+'storyboard-animation-revision.json',JSON.stringify(sb,null,2));await fs.writeFile(dir+'project-animation-candidate.json',JSON.stringify(p,null,2));await fs.writeFile(dir+'animation-inventory.json',JSON.stringify({newAssets:Object.keys(shapes),animatedActors:schedules.length,actors:schedules},null,2));console.log(`${Object.keys(shapes).length} native paper asset types, ${schedules.length} independent animated actors`);
