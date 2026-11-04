import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';

const dir = 'dist/time-patina-paper/';
const report = JSON.parse(await fs.readFile(dir + 'report.json', 'utf8'));
const review = JSON.parse(await fs.readFile(dir + 'v7-encoded-review.json', 'utf8'));
if (!report.passed || !report.continuityAnalysis.passed || !report.subtitleProof.passed || !review.decoded) {
  throw new Error('The current video must pass technical and encoded-video review before delivery.');
}
const file = dir + '交给时间斑驳_场景扩充版_v7.mp4';
await fs.copyFile(dir + 'preview.mp4', file, constants.COPYFILE_EXCL);
const bytes = await fs.readFile(file);
const sha256 = createHash('sha256').update(bytes).digest('hex');
const delivery = {
  version: 7, file, generatedAt: new Date().toISOString(),
  durationSeconds: Number(review.duration), width: review.width, height: review.height, fps: review.fps,
  sha256, sizeBytes: bytes.length,
  technicalPassed: report.passed, continuityPassed: report.continuityAnalysis.passed,
  subtitlesPassed: report.subtitleProof.passed, fullDecodePassed: review.decoded,
  newLocations: 3, locationInserts: 10, visualSegments: 28,
  visualReview: {
    encodedSamples: review.samples.length, insertBoundaries: 20,
    notes: 'Viewed all six current encoded contact sheets and subtitle sheet. New station, train and room settings remain coherent with the paper palette. Wipes reveal complete imagery, including sea transitions at 95.38s and 98.68s after the offscreen canvas fix. No exposed brown canvas gaps observed. Existing action windows remain unobstructed.'
  },
  deliveryKind: 'preview', humanCreativeApproval: 'pending'
};
await fs.writeFile(dir + 'v7-delivery.json', JSON.stringify(delivery, null, 2) + '\n');
const note = `\n\n## 2026-10-11 · v7 场景扩充完整预览已交付\n\n新增雨夜海边站台、沿海列车、晨光阁楼三种地点。十段环境插镜与原有八章故事交错，共二十八个画面段落。保留人物、花朵关键动作与原曲歌词，增加环境雨丝、光尘和细微车厢运动。\n\n147/147 素材及构图质量项通过；技术验收、连续性、字幕、全片解码均通过。已查看修复后七页质量证据、六页共七十张实际编码抽帧及字幕联系表，覆盖十段插镜中点和全部二十个进出边界。海面转场露底问题在完整编码文件中未再出现。\n\n交付：${file}\n规格：${review.width}×${review.height} / 30fps / ${review.duration}s（完整预览）\nSHA256：${sha256}\n\n当前等待用户观看此版预览后的创作反馈，未代替用户确认最终高清成片。\n`;
await fs.appendFile('projects/time-patina-paper/场景扩充_v7.md', note);
await fs.appendFile('projects/time-patina-paper/review.md', note);
console.log(JSON.stringify(delivery, null, 2));
