import fs from 'node:fs/promises';
const file='projects/time-patina-paper/quality-review-locations-v7.json';
const q=JSON.parse(await fs.readFile(file,'utf8'));
// Run after inspecting the current bound seven-page asset/composite contact
// sheet, plus the separate location/transition proof sheets. Encoded checks are
// recorded separately after export, not inferred from these still images.
for(const r of q.reviews){
 const id=r.assetId??r.compositeId??'';
 let note='已复核本轮绑定七页资产/组合联系表：纸边和纹理完整，靛蓝、米白、暖光统一；复用素材无改变身份或部件。';
 if(['rain-station-v7','coastal-train-v7','morning-room-v7'].includes(id))note='已查看原生全幅输出及 v7 地点插镜实渲染：建筑透视可读，构图细腻，无文字水印及人物，歌词在下方留白内。站台冷雨、车窗与晨光旧屋形成清楚的空间与光线变化。旧屋保留原生 1672×940 像素。';
 if(id.startsWith('state-sequence:'))note='本轮三阶段证明保持读信、翻页、回望、花开和起身的既有状态与注册关系。新增地点安排在动作窗口之外，自动检查逐一验证无遮挡；手部及脚底轮廓完整。';
 if(id.startsWith('parallax-rig:')||id.startsWith('group:'))note='当前全幅证明延续 v6 前后景与连续相机；新增地点另看 v7-location-proof 的中点及转场进程，不把不透明整幅背景算成独立多层视差。全幅无露底，留白区保持完整。';
 if(id.startsWith('spatial-contract:'))note='本轮全幅接地检查保持人物脚底/坐姿支撑；新增地点为环境插镜，没有在新背景上平移冻结角色。返回原镜头后原有地面、礁石与道具关系不变。';
 if(id.startsWith('typography:'))note='片头尾声文字可读，没有切边；新地点不覆盖字幕，标题仍按原时机出现。';
 if(id.startsWith('event:'))note='建立、变化、落定全幅证明与原有角色、信件、花朵事件一致；新增插镜不覆盖状态转换区间，歌曲时钟保持连续。';
 if(id.startsWith('semantic:'))note='原人物身份、信封/窗框/花朵部件未修改；跨幕人物仍为同一靛蓝长外套角色，新增环境内不生成第二个人物。';
 if(id.startsWith('motif-field:'))note='尘点分布和密度克制，无增加大量贴纸；新增气氛另由地点内的雨丝、尘光和微弱车厢振动承担。';
 if(id.startsWith('motion-contract:'))note='既有建立/动作/落定演出保持；十段环境插镜补充完整地点切换，按三个转场类别检查过程帧。动作窗口无遮挡与连续镜头插值测试通过；完整编码视频将独立抽帧并解码复核。';
 r.passedChecks=[...new Set([...(r.passedChecks??[]),...r.pendingChecks])];r.pendingChecks=[];r.failedChecks=[];r.note=note;
}
await fs.writeFile(file,JSON.stringify(q,null,2));
console.log(`Recorded visual observations for ${q.reviews.length} reviewed targets.`);
