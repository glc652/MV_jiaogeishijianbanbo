# 交给时间斑驳 · 纸片拼贴 MV

本仓库保存已经完成的 v7 场景扩充版 Remotion 可编辑工程，以及 1080p 成片。

成片：1920×1080 / 30 fps / 193.467 秒。以读信、翻阅相册、海岸、花开与释怀串联故事；新增雨夜站台、沿海列车、晨光阁楼，形成 28 个画面段落。

## 下载完整工程

大型素材、音频、视频和超过 10 MiB 的项目记录采用 Git LFS。请安装 Git LFS 后克隆；仅下载 GitHub ZIP 可能无法取得完整媒体。

```powershell
git lfs install
git clone https://github.com/glc652/MV_jiaogeishijianbanbo.git
cd MV_jiaogeishijianbanbo
git lfs pull
npm ci
```

需要 Node.js 20 或更高版本（制作环境为 Node.js 24）、npm、Git LFS。Remotion 会使用 Chromium；首次可运行 `npx remotion browser ensure`。标准 Remotion 预览/导出无需图像生成服务。制作流程中的音频校验、证明和辅助脚本还需要 FFmpeg/ffprobe 位于 PATH；Python 素材工具的可选依赖见 requirements.txt。

## 编辑与预览

```powershell
npx remotion studio src/index.ts --props=projects/time-patina-paper/project.json
```

主合成名称为 `Paper-Collage`。项目默认 dev 命令指向 starter-demo，编辑本 MV 请使用以上命令。

## 重新导出

```powershell
npx remotion render src/index.ts Paper-Collage dist/time-patina-paper/final.mp4 --props=projects/time-patina-paper/project.json --codec=h264 --crf=18 --audio-bitrate=192k
```

以上是便携的直接渲染命令。完整制作流程另提供 `project:composition-proof`、`project:quality`、`project:assets-ready`、`project:render` 等命令；其验收证据和缓存需要在新机器重新生成，不能将原机器历史通过记录当作新环境的验收。`deliverables/final.mp4` 是已经完成响度处理并验收的最终交付文件。

若需要指定本机浏览器，可设置 `REMOTION_BROWSER_EXECUTABLE`。历史制作脚本中的 `F:\mv` 和 `C:\Users\glc` 是原工作站路径，保存用于记录，不是新机器的安装要求；日常编辑和导出使用上面的相对路径命令。

## 文件结构

| 路径 | 内容 |
| --- | --- |
| src/ | Remotion 场景、人物运动、纸张效果及转场实现 |
| projects/time-patina-paper/project.json | 当前 v7 完整时间轴与构图配置 |
| projects/time-patina-paper/storyboard.json | 分镜与动作设计 |
| projects/time-patina-paper/location-v7-plan.json | 新场景切换计划 |
| projects/time-patina-paper/inputs/ | 原始歌曲与 LRC 歌词 |
| projects/time-patina-paper/versions/ | 历史工程快照 |
| public/projects/time-patina-paper/ | 可直接用于渲染的图像、音频及字幕时间数据 |
| scripts/, schemas/, tests/ | 制作工具、配置规范与验证测试 |
| deliverables/final.mp4 | v7 1080p 最终成片 |
| deliverables/preview.mp4 | v7 960×540 预览 |
| deliverables/ | 交付校验记录、报告及关键帧联系表 |

完整保留工程源码、素材、输入音乐歌词、版本记录及依赖锁文件。依赖安装目录、Python 虚拟环境、浏览器/FFmpeg 可执行文件、临时缓存、旧版视频与可再生成的逐帧校样不纳入 Git。

## 验证

```powershell
npm run check
node --test --test-isolation=none tests/location-shot.test.mjs tests/paper-performance.test.mjs
git lfs fsck
```

已交付成片 SHA-256：`6435904cbe51246e6525466c6f9ed0ededa269f8787882560e9f0ff5364c4dfc`。历史验收记录见 deliverables/v7-final-delivery.json。

## 来源与许可

制作工具基于 [cyberlesterr/paper-collage-video](https://github.com/cyberlesterr/paper-collage-video)，保留 LICENSE、THIRD_PARTY_NOTICES.md、ASSET_LICENSES.md。软件许可不代表对本歌曲、歌词或其他媒体授予额外权利；歌曲及歌词权利仍归各自权利人。
