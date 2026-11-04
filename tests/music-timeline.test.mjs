import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {deriveSceneTimeline,validateSceneTransitionSequence} from '../src/sceneTimeline.mjs';
import {createSubtitleContract} from '../scripts/subtitle-contract-lib.mjs';
const project=JSON.parse(await fs.readFile('projects/time-patina-paper/project.json','utf8'));
test('music excerpts remain adjacent during visual overlap',()=>{
 const t=deriveSceneTimeline(project);
 for(let i=1;i<t.scenes.length;i++)assert.equal(t.scenes[i].from,t.scenes[i-1].from+t.scenes[i-1].narrationFrames);
 assert.equal(t.durationInFrames,5804);
 assert.equal(validateSceneTransitionSequence(project).length,0);
 const p=structuredClone(project);p.scenes[1].narration.contentType='speech';
 assert.ok(validateSceneTransitionSequence(p).some(x=>x.code==='scene-transition-narration-lead'));
});
test('song lyrics allow source-timed gaps but reject retiming and wrong text',async()=>{
 const valid=await createSubtitleContract(project);assert.ok(valid.scenes.every(x=>x.passed));
 const p=structuredClone(project);const s=p.scenes.find(x=>x.narration.contentType==='song');s.subtitles[0].fromSeconds+=.3;
 assert.equal((await createSubtitleContract(p)).scenes.find(x=>x.sceneId===s.id).passed,false);
 s.subtitles[0].text='wrong';assert.equal((await createSubtitleContract(p)).scenes.find(x=>x.sceneId===s.id).passed,false);
});
test('instrumental exemption requires empty transcript and cues',async()=>{
 const p=structuredClone(project);p.scenes[0].narration.text='unexpected lyric';
 assert.equal((await createSubtitleContract(p)).scenes[0].passed,false);
});
