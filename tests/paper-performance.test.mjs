import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deformPaperPoint,mapRegisteredRow} from '../src/paperPerformance.mjs';
import {resolveSceneTransitionPresentation,deriveSceneTimeline} from '../src/sceneTimeline.mjs';

test('performance locks the entire support band, keeps mesh orientation, and moves upper body',()=>{
  for(const standing of [true,false]){
    const c={kind:'character',supportY:standing?.81:.77,neckY:standing?.26:.5,standing};
    let travelled=0;
    for(let t=0;t<30;t+=.17){
      for(const x of [.3,.5,.7])for(const y of [c.supportY,.88,1])assert.deepEqual(deformPaperPoint(x,y,t,c),{x,y});
      const head=deformPaperPoint(.5,c.neckY-.1,t,c);travelled=Math.max(travelled,Math.abs(head.x-.5));
      for(let y=.05;y<.95;y+=.05)for(let x=.1;x<.9;x+=.05){
        const a=deformPaperPoint(x,y,t,c),b=deformPaperPoint(x+.01,y,t,c),d=deformPaperPoint(x,y+.01,t,c);
        assert.ok((b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x)>0,'mesh must never fold');
      }
    }
    assert.ok(travelled>.02);
  }
});
test('water leaves land, horizon, and image edges unchanged',()=>{
  const c={kind:'water',region:{left:.1,right:.9,top:.4,bottom:.8}};
  for(const [x,y] of [[0,.6],[1,.6],[.5,.2],[.5,.4],[.5,.8],[.5,1]])
    assert.deepEqual(deformPaperPoint(x,y,2,c),{x,y});
  assert.notDeepEqual(deformPaperPoint(.5,.6,2,c),{x:.5,y:.6});
  assert.ok(Math.abs(mapRegisteredRow(.88,[0,.5,.88,1],[0,.3,.88,1])-.88)<1e-12);
});
test('dissolve is a continuous source-over blend with no blank midpoint and no audio timeline drift',()=>{
  const transition={treatment:{type:'dissolve'},durationInFrames:40};
  assert.equal(resolveSceneTransitionPresentation({transition,frame:0}).incomingOpacity,0);
  assert.equal(resolveSceneTransitionPresentation({transition,frame:39}).incomingOpacity,1);
  let last=0;
  for(let frame=0;frame<40;frame++){
    const p=resolveSceneTransitionPresentation({transition,frame});
    assert.equal(p.coverOpacity,0);assert.ok(p.incomingVisible);assert.ok(p.incomingOpacity>=last);last=p.incomingOpacity;
  }
  const p={video:{fps:30},scenes:[{narration:{durationSeconds:10},tailSeconds:1.3},{narration:{durationSeconds:15}}],sceneTransitions:[{treatment:{type:'dissolve',durationSeconds:1.3}}]};
  const timeline=deriveSceneTimeline(p);assert.equal(timeline.scenes[1].from,300);assert.equal(timeline.durationInFrames,750);
});
