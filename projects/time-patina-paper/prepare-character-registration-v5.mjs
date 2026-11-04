import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='projects/time-patina-paper/';
const families=JSON.parse(await fs.readFile(dir+'character-v5-families.json','utf8'));
for(const f of families){
 const input=`public/projects/time-patina-paper/assets/${f.id}-sheet.png`;
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const c=info.width/2,canvas=650;
 const rects=f.id==='human-album'?[{left:0,top:0,width:627,height:633},{left:627,top:0,width:627,height:633},{left:0,top:633,width:650,height:621}]:[0,1,2].map(j=>({left:j%2*c,top:Math.floor(j/2)*c,width:c,height:c}));
 const states=f.states.map((id,j)=>{
  const r=rects[j];let bottom=0;
  for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++)if(data[((y+r.top)*info.width+x+r.left)*4+3]>100)bottom=Math.max(bottom,y);
  let minX=r.width,maxX=0;for(let y=bottom-30;y<=bottom;y++)for(let x=0;x<r.width;x++)if(data[((y+r.top)*info.width+x+r.left)*4+3]>100){minX=Math.min(minX,x);maxX=Math.max(maxX,x);}
  return {id,row:Math.floor(j/2),column:j%2,facing:f.facing[j],anchors:[{id:'contact',x:.5,y:.88}],registrationTransform:{scale:f.id==='human-seaward'?.82:.60,anchorId:'contact',sourceContact:{x:(minX+maxX)/2/canvas,y:bottom/canvas}}};
 });
 const spec={schemaVersion:1,projectSlug:'time-patina-paper',sceneId:`balanced-scene-0${f.scene}`,nodeId:'paper-person',poseFamilyId:f.id,sourceAssetId:f.id+'-sheet',input,outputDirectory:'public/projects/time-patina-paper/assets/character-v5',layout:{columns:2,rows:2},registration:{id:f.id+'-registration',sourceMasterAssetId:f.id+'-sheet'},identityReference:{assetId:'paper-person-reference'},anchorPolicy:{requiredAnchorIds:['contact'],maximumDrift:.07},states,extraction:{mode:'explicit-source-rects',canvas:{width:canvas,height:canvas},cells:rects.map((sourceRect,j)=>({stateId:f.states[j],sourceRect,placement:{left:0,top:0}}))},keying:{keyColor:'#00ff00',transparentThreshold:0,opaqueThreshold:1,edgeFeather:0,matteErode:0,edgePadding:2}};
 await fs.writeFile(dir+f.id+'-process-v5.json',JSON.stringify(spec,null,2));
 console.log(f.id,states.map(s=>s.registrationTransform));
}


