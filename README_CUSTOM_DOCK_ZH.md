# WaveTask 兼容模式增强版

> 本文档仅适用于 `feat/dock-visual-customization` 分支。这是基于上游 WaveTask 的 **KDE Plasma Panel 小部件**定制版，**不是独立 Dock 应用**。

## 功能说明

- 固定图标与非固定运行图标之间的自动分割线；支持分割线间距、宽度、长度、透明度。
- 可选的圆点、短线、胶囊形运行状态标记；活动和最小化应用显示不同强度。
- 可选的圆角半透明背景，支持颜色、透明度、圆角和内边距。开启「动态背景」后随放大峰值做温和的厚度扩展。
- 统一的 DockPhysics.js 运动与视觉槽位计算：固定任务布局尺寸、统一高斯放大、按实际帧间隔平滑鼠标坐标和进入/退出过渡、图标位置阻尼动画。
- 支持手动排序时的临时重排预览；释放拖拽后才向原生任务模型提交排序。
- **面板安全模式（默认启用）**：按 Panel 可用绘制厚度限制放大与跳动。这是兼容性取舍，不是让图标突破面板窗口的裁切范围。

## 安装（Fedora KDE Plasma）

要求：KDE Plasma 6、Qt 6、KF6 和上游 README / CMakeLists.txt 所要求的开发库。推荐先备份当前布局和 WaveTask 设置。

1. 克隆**这个 fork 的功能分支**：

   ```bash
   git clone -b feat/dock-visual-customization https://github.com/cxcg/org.vicko.wavetask.git
   cd org.vicko.wavetask
   ```

2. 在 Fedora 上安装构建工具和依赖。所需库名称可能随 Fedora 版本变化；以 CMake 的缺失依赖输出为准：

   ```bash
   sudo dnf install -y cmake ninja-build gcc-c++ extra-cmake-modules qt6-qtbase-devel qt6-qtdeclarative-devel kf6-kconfig-devel kf6-kcoreaddons-devel kf6-ki18n-devel kf6-kservice-devel kf6-kwindowsystem-devel plasma-devel
   ```

   如果遇到 `No match for argument`，查找对应的 Fedora 44 包名后再安装。上游还依赖 `PlasmaActivities`、`KWin`、`LibTaskManager`、`LibNotificationManager`、`KSysGuard` 及相应 KF6 开发组件；仅执行上面这一行**不保证**依赖完整。

3. 编译安装（与上游采用同样的 CMake 流程）：

   ```bash
   cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
   cmake --build build -j"$(nproc)"
   sudo cmake --install build
   ```

4. **注销后重新登录 Plasma 会话**，使编译的 QML 插件和 C++ 模块重新加载。进入桌面编辑模式，添加或重新应用 WaveTask 面板；在小部件「外观」中启用新的分割线、状态标记、动态背景及运动选项。

5. 若已安装上游的 `wavetask` RPM，手动 CMake 安装可能与 RPM 管理的相同文件冲突。建议先了解当前安装路径和覆盖关系，再决定如何切换、备份或卸载。**不要在未知安装布局上直接覆盖生产工作环境。**

## 面板约束和已知局限

- **Panel 裁切仍然存在**。小部件不能绕过 Plasma Panel 所在的 QQuickWindow 边界；面板安全模式优先保证显示不越界，因此低矮面板中的放大效果会比 macOS 弱。
- 圆角背景是半透明着色层；真实桌面背景模糊仍由已有 KWin / 皮肤 BlurBehind 逻辑决定。此版**不实现**独立窗口或新的系统级材质采样。
- 悬停动画采用约 16ms 间隔的 QML Timer，按实际 `dt` 计算；定时器并非显示垂直同步信号，不保证 120Hz 下一帧一次更新。
- 手动排序预览只针对当前 TaskModel 的 `SortManual`；多组窗口弹出层仍走原生排序逻辑。
- 图标清晰度受应用原始 SVG / 位图分辨率限制；本次没有增加原生图标解析器。
- 缺少当前运行环境的 Plasma 桌面会话，**尚未完成真实 KDE 可视化、拖拽行为及 C++ 全量编译验收**。

## 检查与调试

只测试独立的 JS 几何／运动工具（需要 Node.js）：

```bash
node tests/dock-geometry.test.cjs
node tests/dock-physics.test.cjs
```

对外观和行为进行实机验收时，请检查：横向和纵向四种面板位置；固定和非固定图标数量变化；分割线穿越；鼠标快速滑动、离开；手动排序拖动；不同缩放比例及皮肤切换；启动与最小化状态指示器。

## 文件概览

- `package/contents/ui/main.qml`：图标槽位、单一运动更新循环、背景及 Panel 位置。
- `package/contents/ui/Task.qml`：消费集中计算的图标缩放、运行指示器和边界安全跳动。
- `package/contents/ui/MouseHandler.qml`：拖拽预览目标计算。
- `package/contents/ui/code/DockPhysics.js`：统一帧无关平滑、弹簧、视觉排序／高斯几何、面板安全裁切预算。
- `package/contents/ui/code/DockGeometry.js`：基础尺寸与分割线计算。
- `package/contents/ui/ConfigAppearance.qml`、`package/contents/config/main.xml`：用户配置。
- `tests/`：纯逻辑回归测试。

## 恢复上游行为

在小部件外观中关闭「动态背景」「拖动预览」，将运行指示器设为「原皮肤」。面板安全模式如需更强放大可关闭，但可能发生真实裁切。恢复旧版代码可切回 fork 的 `main` 分支重新编译安装；配置项可能保留在用户设置中。

> 许可证：遵守原项目所用 GPL-2.0-or-later 源文件许可条款。此分支为个人实验改造，并不代表上游已支持。
