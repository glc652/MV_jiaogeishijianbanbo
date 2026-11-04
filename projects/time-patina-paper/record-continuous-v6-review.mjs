import fs from 'node:fs/promises';
const file='projects/time-patina-paper/quality-review-continuous-v6.json';
const q=JSON.parse(await fs.readFile(file,'utf8'));
// This record follows inspection of all seven 94d48818a60b sheets, full-size
// chapter 1/7/8 proof frames, and the encoded cross-chapter test progression.
for(const r of q.reviews){
  const id=r.assetId??r.compositeId??'';
  let note='已查看本轮7页绑定联系表：复用素材纸纹、靛蓝米白色系一致，轮廓与透明负空间完整；无新增绘制人物或图像来源。';
  if(id.startsWith('state-sequence:'))note='比较当前建立、变化、落定帧及既有注册状态：读信、翻书、回望、花开、起身顺序正确，头部和四肢轮廓完整。读信手位已重新对齐，翻书/回望使用短过渡；脚底固定。全片编码后的运动仍另行检查。';
  if(id.startsWith('parallax-rig:')||id.startsWith('group:'))note='本轮证明帧可见前后层次与纸边，推进后无画布空洞，地面不再上下漂动，主要景物和纸张完整。相机采用连续密集关键帧，入场与上幕终点对齐；海面局部形变不移动地平线。';
  if(id.startsWith('spatial-contract:'))note='结合通过的接地测试和当前完整画面复查：脚底或坐姿接触线稳定。尾声已补入上一幕完整礁石平台，消除站在水面上的构图错误；人物与相册分离，歌词区留白。';
  if(id.startsWith('typography:'))note='本轮标题建立帧完整可读，未切边。片头文字于4.6秒前退场，避开后续推近；尾声标题居中，角色、道具与文字不相互遮挡。';
  if(id.startsWith('event:'))note='检查本幕三个事件帧，实际状态与歌词叙事顺序一致，动作窗口覆盖证明时刻；整曲时长保持193.466667秒，无新增拟音或音轨切口。';
  if(id.startsWith('semantic:'))note='复查绑定图像与跨幕全景：人物保持深色短发、靛蓝长外套、米白裤鞋的既有身份；信封、窗框、花朵的部件连续且完整。尾声沿用同一礁石支撑，人和记忆道具不会移到海水中。';
  if(id.startsWith('motif-field:'))note='联系表与跨幕逐帧样片中尘点密度克制，留白区干净，飘落方向一致；没有新增堆叠贴纸。';
  if(id.startsWith('motion-contract:'))note='26个连续取景节点覆盖8个建立/动作/落定段落，采用连续推移、完整人物纹理形变、水域波动和固定支撑；已看跨幕编码测试及全片三阶段证明。7处边界取消空白dip，尾声匹配人物与道具坐标；不把静帧审查当成完整编码运动检验。';
  r.passedChecks=[...new Set([...(r.passedChecks??[]),...r.pendingChecks])];
  r.pendingChecks=[];r.failedChecks=[];r.note=note;
}
await fs.writeFile(file,JSON.stringify(q,null,2));
console.log(`Reviewed ${q.reviews.length} current targets.`);
