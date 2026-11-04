import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

const dir = 'dist/time-patina-paper/';
const report = JSON.parse(await fs.readFile(dir + 'report.json', 'utf8'));
const qa = JSON.parse(await fs.readFile(dir + 'v7-final-encoded-review.json', 'utf8'));
if (!report.passed || !report.continuityAnalysis.passed || !report.subtitleProof.passed || !qa.decoded || qa.width !== 1920 || qa.height !== 1080) {
  throw new Error('Final video must pass technical checks, full decode, and 1080p dimensions.');
}
const file = dir + '交给时间斑驳_场景扩充版_v7_1080p.mp4';
const data = await fs.readFile(file);
const sha256 = createHash('sha256').update(data).digest('hex');
const sourceHash = createHash('sha256').update(await fs.readFile(dir + 'final.mp4')).digest('hex');
if (sha256 !== sourceHash) throw new Error('Named delivery differs from the verified final.mp4.');
const delivery = {
  version: 7, kind: 'final', file, completedAt: new Date().toISOString(),
  width: qa.width, height: qa.height, fps: qa.fps, durationSeconds: Number(qa.duration),
  sizeBytes: data.length, sha256,
  technicalPassed: report.passed, continuityPassed: report.continuityAnalysis.passed,
  subtitlesPassed: report.subtitleProof.passed, fullDecodePassed: qa.decoded,
  visualReview: {encodedSamples: qa.samples.length, insertBoundaries: 20,
    note: 'Inspected final encoded contact sheets and subtitle evidence. Sea wipes contain complete image coverage; new settings and story poses match the approved v7 preview.'},
  humanApproval: '2026-10-12：可以，导出来吧；授权本机浏览器连接。'
};
await fs.writeFile(dir + 'v7-final-delivery.json', JSON.stringify(delivery, null, 2) + '\n');
const note = `\n\n## 2026-10-12 · v7 1080p 最终成片\n\n用户批准预览并授权导出。高清渲染完成，1920×1080、30fps、${qa.duration} 秒。素材及构图质量 147/147 通过；最终技术、连续性、字幕、音频检查及全片解码通过。复核最终编码的七十张抽帧，覆盖十段新场景中点、二十个进出边界；海面转场未见露底。\n\n成片：${file}\n字节数：${data.length}\nSHA256：${sha256}\n\n项目保留可编辑 Remotion 源码及此前 v7 预览。已完成本地交付。\n`;
await fs.appendFile('projects/time-patina-paper/review.md', note);
await fs.appendFile('projects/time-patina-paper/场景扩充_v7.md', note);
console.log(JSON.stringify(delivery, null, 2));
