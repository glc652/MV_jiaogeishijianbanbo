import test from 'node:test';import assert from 'node:assert/strict';import {inspectAlphaTopology} from '../scripts/alpha-band-lib.mjs';
test('declared sheet cells permit separated rectangular envelopes; unbound fragments still fail',async()=>{
 const file='public/projects/time-patina-paper/assets/letter-open-sheet.png';
 assert.equal((await inspectAlphaTopology({file})).passed,false);
 const expectedComponents=[{left:0,top:0,width:627,height:627},{left:627,top:0,width:627,height:627},{left:0,top:627,width:627,height:627}];
 assert.equal((await inspectAlphaTopology({file,expectedComponents})).passed,true);
 assert.equal((await inspectAlphaTopology({file,expectedComponents:expectedComponents.slice(0,2)})).passed,false);
});
