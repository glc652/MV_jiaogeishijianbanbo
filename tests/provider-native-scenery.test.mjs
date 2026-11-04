import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {verifyOutputFile} from '../scripts/provider-lib.mjs';
test('one-pixel free scenery rounding preserves native pixels but does not relax registered sources',async()=>{
 const request=JSON.parse(await fs.readFile('projects/time-patina-paper/requests/morning-room-v7.json','utf8'));
 const result=await verifyOutputFile(request.output,request);
 assert.equal(result.metadata.height,940);
 assert.equal(request.compositionBinding.canvas.height,941);
 const registered=structuredClone(request);registered.compositionBinding.pattern='registered-depth-stack';
 await assert.rejects(()=>verifyOutputFile(request.output,registered),/与请求画布/);
 const oversized=structuredClone(request);oversized.compositionBinding.canvas.height=942;
 await assert.rejects(()=>verifyOutputFile(request.output,oversized),/与请求画布/);
});
