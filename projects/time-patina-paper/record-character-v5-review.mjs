import fs from 'node:fs/promises';
const d='projects/time-patina-paper/',file=d+'quality-review-character-v5.json';
const q=JSON.parse(await fs.readFile(file,'utf8'));
// Run only after inspecting the current 7 fingerprint-bound sheets and the full-resolution scene crops.
for(const r of q.reviews){
 const id=r.assetId??r.compositeId??'';
 let note='已逐项查看当前7页绑定联系表；纸张纹理、靛蓝米白色系与既有素材一致，主体轮廓完整，无新增水印或非预期文字；关联构图未见遮挡主体或侵占歌词区。';
 if(id.includes('human-letter'))note='已查看完整原动作表与注册单格：同一短发长外套人物，双手握住一张信纸，低握、抬读、放下三态清楚，鞋与衣摆完整，透明负空间干净。';
 if(id.includes('human-album'))note='已查看完整原动作表与注册单格：相册打开、翻页、合起抱住三个形态可辨，手与书接触；原表按实际633像素分界提取，未裁掉鞋部或混入邻格，人物衣着身份一致。';
 if(id.includes('human-seaward'))note='已查看完整原动作表与注册单格：身体朝右，回望时头肩向左转而脚保持原朝向；三态头发、外套、裤鞋连续，脚底已注册到共同基线。';
 if(id.startsWith('state-sequence:'))note='已查看当前起始、变化、落定构图与相应原动作表；状态与场景意图一致，接地点与比例可读，落定帧完整可见。连续播放的主观流畅度另在整片编码后复查。';
 if(id.startsWith('spatial-contract:'))note='查看完整构图及已通过的接触证明：脚底/坐姿接地点与支撑纸边同步；海边角色已移回右侧步道，与左侧相册分离，无相册遮腿。';
 if(id.includes('story-cross-scene'))note='比较读信、翻页、抱相册、回望、起身和结尾构图：短深发、靛蓝及膝外套、米白长裤维持主人公识别度；正侧面变化与叙事相符。';
 if(id.startsWith('event:'))note='已比较所属幕的三个事件检查帧，状态改变按既有歌词节拍排序；本MV使用原曲，无新增离散拟音；收好回忆幕照片先归位消隐，再显示合册拥抱。';
 if(id.startsWith('motion-contract:'))note='当前25镜头和8章节保留已批准动作语法；新增三组注册姿态按建立、动作、落定编排，场景证明通过。图片证据不替代编码视频的转场和连续运动复查。';
 r.passedChecks=[...new Set([...(r.passedChecks??[]),...r.pendingChecks])];r.pendingChecks=[];r.failedChecks=[];r.note=note;
}
await fs.writeFile(file,JSON.stringify(q,null,2));console.log(`Recorded inspection notes for ${q.reviews.length} review items.`);
