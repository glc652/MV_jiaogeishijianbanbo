import fs from 'node:fs/promises';
import {storyboardAuthoringFromCompiled} from '../../scripts/directing-revision-lib.mjs';
const d='projects/time-patina-paper/';
const p=JSON.parse(await fs.readFile(d+'project.json','utf8'));
const sb=storyboardAuthoringFromCompiled(JSON.parse(await fs.readFile(d+'storyboard.json','utf8')));
const s=p.scenes[2];s.composition.nodes.find(n=>n.id==='paper-person').transform.x=.69;s.composition.nodes.find(n=>n.id==='story-ground').transform.x=.69;
for(const t of sb.scenes[2].beats.flatMap(b=>b.treatments).filter(t=>['paper-person','story-ground'].includes(t.targetId)))t.rationale+=' 构图复查：角色移回右侧沿海步道，保留左侧相册与海面留白，消除相册遮腿。';
await fs.writeFile(d+'project-character-v5-layout.json',JSON.stringify(p,null,2));
await fs.writeFile(d+'storyboard-character-v5-layout.json',JSON.stringify(sb,null,2));
