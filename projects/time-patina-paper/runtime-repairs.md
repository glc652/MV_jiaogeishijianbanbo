# 本地运行修复

安装的上游运行时版本：0.19.1-dev.1。插件缓存原件未修改。

- Windows：`project-lib.mjs` 的 Remotion 调用从 extensionless npm shim 改为 Node 直接启动已安装包的 `bin.remotion`。参数保持独立，不引入 shell 字符串拼接。
- 原生透明状态图：`process-state-sheet.mjs` 针对请求声明 alpha 且图片有 alpha 的素材，使用完整画布裁切保留原始 RGBA；不再送入仅支持 RGB 的色键路径。色键图片仍沿用原路径。派生元数据记录 `preserve-provider-alpha`。
- 验证：三个实际生成状态的派生 RGBA 均与源图对应单元逐字节一致。Remotion 实际渲染用于验证 Windows 调用路径。

当前目录是 bootstrap 后的生产工作区，未包含上游打包目录或 `plugin:sync` 命令；修复仅作用于这个制作工程。

2026-10-06 人物动作修订：完整姿态族派生支持可验证的 registrationTransform，按实测脚底位置等比缩小并放回共同透明画布。禁止裁掉单元，变换参与族指纹并写入派生证据；原生提供方图片保持不变。三个姿态头部比例统一，脚底误差不超过 0.5 像素。

移除运行时阶跃缩放。普通淡化测试仍出现分离的双头轮廓，因此改为 0.55 秒 registrationBands 配准过渡：头顶、下颌、身体、膝部和脚底分带逐帧对齐，smoothstep 连续插值位置，并在相同几何位置融合两张纸片纹理。plus-lighter 在隔离容器中避免双层半透明合成产生透明度凹陷。该可选字段纳入 TypeScript 类型、JSON schema、完整状态族与单调行验证；新组件经本地 import closure 自动纳入渲染指纹。数值测试验证连续头部上移、固定脚底及终态；实际渲染逐帧复核。属于风格化纸片变形，身体融合处仍有短暂纹理重叠，并非自然人体逐帧动画。
2026-10-07 完整歌曲支持：narration.contentType 区分 speech/song/instrumental；song 必须逐条匹配用户 LRC 时码，不强制填满器乐留白。视觉转场由出场 tail 承载，歌曲片段零起点连续接续，speech 保留转场后开口要求。修复浮点误差导致整帧音频多一帧的问题。测试覆盖连续 5804 帧、语音保护、歌词错位及错误器乐声明。背景原生 1672×941，1080p 输出轻微放大，minimumAssetScale 明确设为 0.85。
完整 FFmpeg 安装于 F:/mv/tools/ffmpeg，避开 Remotion 精简版缺少 m4a/fps 等功能。project-render 的 Windows npm shim 启动改为 Node CLI。状态表的 topology 检查以声明的格子作为 expectedComponents，不再把正常分离的矩形信封误判为背景碎片；未声明区域的碎片仍会失败，专门测试覆盖。音频 adelay 改用 48kHz 样本单位，避免毫秒取整造成片段接缝。
