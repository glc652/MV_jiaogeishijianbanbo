# 故事版 v4 历史恢复点（已过期）

**2026-10-08更新：** 下方历史阻塞已解除。当前工程已经进入角色扩充版 v5，新增三组动作共9个姿态，总上限34次、已使用31次。素材与构图质量144/144通过，全部9项生产工作完成，assets-ready已封存，完整预览渲染已启动。优先检查当前渲染会话和render-status.json，避免重复渲染。当前project.json比一次性编排脚本新，不要重新运行build-character-v5.mjs --install。

预览完成后检查report.json及25镜头/17内部切点、字幕、转场联系表，另存为交给时间斑驳_故事角色版_v5.mp4，再展示用户。旧preview.mp4在正式渲染完成前不可当作v5交付。

以下保留历史记录，仅供追溯：

最新用户要求：保留较丰富的元素，增加故事感，不能只是几张风景图。

## 已完成

- `故事版分镜_v4.md` / `story-v4-shot-plan.json`：25个镜头的因果动作。
- `project.json` 已应用 `project-story-v4-candidate.json`，同步当前编译器生成的 plan、motionContract、editorial 和 proofTimes。
- `storyboard.json` 通过正式 `project:revise-preview-semantic` 编译，授权记录保存于 `story-v4-authorization.json`。
- 角色贯穿七段；加入相册、书签与旧信。第六段照片收拢，旧信从 open → unfolding → sealed，复用已批准注册素材。
- 新增六项人物接地契约；人物跨场景身份检查已通过正式 semantic-contracts 工具锁定。
- `story-v4-structure-check.json` 通过：composition structure + spatial geometry，无错误。
- 旧 v3 的工程/分镜备份在 `versions/v3/`；视频为 `dist/time-patina-paper/交给时间斑驳_节奏修订_v3.mp4`。**此视频不包含故事版修改，不得作为 v4 交付。**

## 阻塞

自动审批服务在视频抽帧检查命令上返回账号 usage limit，未执行该动作。这是审批服务无法完成审核，不是安全判定。不得用另一个工具/权限入口绕过同一受阻操作。原提示允许额度恢复后重试（提示 6:28 PM）。

## 恢复后顺序

1. `project:resume`，确认额度/审批已恢复。把 `story-v4-render` 工作项设为 in-progress。
2. 设置本地完整 FFmpeg PATH（`F:/mv/tools/ffmpeg/**/bin`）及 `REMOTION_BROWSER_EXECUTABLE=C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`。
3. 正常审批后执行 `project:composition-proof`。重点复查新人物是否接地、相册是否挡住人物/字幕、照片是否准确落入相册、旧信合拢是否自然。数值结构通过不替代视觉通过。
4. 检查所有新语义/身份/接地证据。修正后 quality scaffold/contact-sheet/record-batch；不得复制旧版已通过结果冒充新版。
5. 新增 `story-v4-render` 是自定义工作项，官方 assets-ready 不会自动完成它。视觉检查完成后先将其 completed，并说明完整预览由正式 preview 阶段执行。其余 directing-revision 工作项由 seal 处理。
6. `project:assets-ready` → `project:preview`，检查编码后所有25镜头、17个内部取景切点、7处场景过渡和歌词。
7. `review-poetic-encode.mjs` 可用于25镜头/17切点抽帧，需先获正常运行审批；图像输出依旧沿用 poetic 文件名，交付时另存 v4 文件名。
8. 用户看故事版完整预览后再批准最终1080p输出。

`build-story-revision.mjs` 从 versions/v3 生成候选，不自动安装。当前候选已经安装，不要重复覆盖后忘记同步编译字段。生成器可修订后重跑；导演/语义变更走正式命令，不手改指纹。
