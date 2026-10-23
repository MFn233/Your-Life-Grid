# Your Life Grid · 人生格

一张纸，900 个格子，一格一个月。输入生日，看看自己的人生已经被填掉了多少格；剩下的空白，由你自己决定涂什么颜色。

纯静态站点，无框架、无构建步骤、无后端：克隆下来直接打开就能用。

---

## 功能

| 功能 | 说明 |
| --- | --- |
| 生日入口 | 选择生日后跳转到人生格，自动把已经度过的月份涂灰 |
| 手动标记 | 点击任意格子切换「已度过 / 重要」状态，可用来标注任意事件 |
| 持久化 | 标记、生日、语言选择都保存在浏览器 `localStorage`，刷新不丢 |
| 按生日重新填充 | 页面内嵌日期面板，不再弹原生 `prompt`，并预填上次的生日 |
| 重置 | 一键清空全部 900 格 |
| 打印 | 打印样式按 A4 排版，30×30 的格子和正文刚好一页，灰格会正常打印 |
| 中英双语 | 右上角 🌐 切换，`<html lang>` 和页面标题同步更新 |
| 无障碍 | 格子是可聚焦按钮，支持方向键 / Home / End 移动、空格标记，状态用 `aria-pressed` 播报 |

## 目录结构

```
YourLifeGrid/
├─ index.html           入口页：生日输入
├─ grid.html            人生格主页面
├─ favicon.svg          站点图标
├─ css/
│  ├─ common.css        两页共用：重置、卡片、按钮、语言菜单、打印基础
│  ├─ index.css         入口页样式
│  └─ grid.css          人生格样式 + A4 打印样式
├─ js/
│  ├─ common.js         共用工具：日期解析、月数计算、localStorage 封装、语言切换器
│  ├─ index.js          入口页逻辑
│  └─ grid.js           人生格逻辑：建格、标记、持久化、键盘导航、填充面板
└─ test/                早期原型稿（gridtest1~4 等），不属于线上页面，可删除
```

## 本地预览

推荐起一个本地静态服务器，`localStorage` 和相对路径的行为才和线上一致：

```bash
# Python 3
python -m http.server 8000

# 或 Node
npx serve .
```

然后打开 <http://localhost:8000/>。

直接双击 `index.html` 也能用，但部分浏览器在 `file://` 下的存储行为不一致，所以只建议用来快速看样式。

## 部署

整个目录就是站点，没有构建产物，任何静态托管都能放。注意保持目录结构不变（`css/`、`js/`、`favicon.svg` 都是相对路径引用）。

### GitHub Pages

1. 把仓库推到 GitHub；
2. **Settings → Pages → Build and deployment**，Source 选 `Deploy from a branch`；
3. Branch 选 `main`、目录选 `/ (root)`，保存。

若本项目在仓库的子目录里（例如 `/YourLifeGrid`），站点地址就是 `https://<user>.github.io/<repo>/YourLifeGrid/`，站内相对路径依然有效；想让地址更短，可把该目录内容提到仓库根目录。

### Netlify

- 拖拽：把 `YourLifeGrid` 文件夹直接拖进 [app.netlify.com/drop](https://app.netlify.com/drop)；
- 或连接仓库：Build command 留空，**Publish directory** 填 `YourLifeGrid`。

### Vercel

导入仓库 → Framework Preset 选 **Other** → Build Command 留空 → **Root Directory** 选 `YourLifeGrid` → Deploy。

### 自己的服务器（Nginx）

```nginx
server {
    listen 80;
    server_name lifegrid.example.com;
    root /var/www/yourlifegrid;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # 静态资源加一点缓存，页面本身保持短缓存
    location ~* \.(css|js|svg|png|ico)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

把 `root` 指向 `YourLifeGrid` 目录即可，不需要重写规则（只有两个页面，没有前端路由）。

## 数据与隐私

所有数据只存在当前浏览器里，不会上传到任何服务器：

| 键 | 内容 |
| --- | --- |
| `lifeGridBirthday` | 生日，`YYYY-MM-DD` |
| `lifeGridMarksV1` | 900 个 `0`/`1`，按顺序表示每一格是否被标记 |
| `lifeGridLang` | 语言（`en` / `zh`） |

清除站点数据或换浏览器后，标记会重置；需要长期保存可以打印，或后续加导出图片。

## 键盘与无障碍

- `Tab` 进入格子区域（整块只占一个 Tab 停靠点），`Tab` 再离开；
- `←` `→` `↑` `↓` 逐格移动，`Home` / `End` 跳到当前行首 / 行尾；
- `Space` / `Enter` 切换当前格；
- 语言菜单支持 `Esc` 关闭，菜单项用 `menuitemradio` + `aria-checked` 标注当前语言；
- 填充、重置的结果通过 `aria-live` 区域播报。

## 打印

在 `grid.html` 点「打印本页」，或直接 `Ctrl/Cmd + P`：

- 页面已声明 `@page { size: A4 }`，正文、格子和寄语按一页排；
- 打印时自动隐藏工具栏、语言菜单、填充面板和页脚；
- 灰格使用 `print-color-adjust: exact`，需要在打印对话框里勾选「背景图形 / Background graphics」才会显示颜色；
- 右下角会淡出一个旋转水印，属打印态样式，屏幕上不可见。

## 加一门语言

1. 在 `js/index.js` 和 `js/grid.js` 的 `locales` 里各加一段，键名与现有条目保持一致（`pageTitle`、`monthLabel` 等）；
2. 在两个 HTML 的语言菜单里加一个按钮：

   ```html
   <button type="button" role="menuitemradio" data-lang="ja" aria-checked="false">日本語</button>
   ```

3. 在 `js/common.js` 顶部的 `LANG_TAGS` 里补上 `<html lang>` 的取值，例如 `ja: 'ja'`。

其余逻辑（菜单交互、记忆选择、浏览器语言探测、`<title>` 同步）由 `LifeGrid.setupLanguage()` 统一处理，不需要再改页面脚本。

## 改格子数量

默认 900 格（30×30，约 75 年）。要改成别的数字，需要同时改三处：

- `js/common.js` 的 `TOTAL_MONTHS`；
- `js/grid.js` 的 `COLUMNS`（每行格子数）；
- `css/grid.css` 里 `.grid-container` 的 `grid-template-columns: repeat(30, 1fr)`。

文案里出现的「900」在 `locales` 中，可按需调整。

## 浏览器支持

面向现代浏览器（Chrome / Edge / Firefox / Safari 最近两个大版本）。用到的特性：`localStorage`、`URLSearchParams`、`aspect-ratio`（旧 Safari 有 `@supports` 回退）、`:focus-visible`、`Uint8Array`。不支持 IE11。

## test/ 目录

`test/` 是设计过程中的原型稿，结构与线上页面不同（有的直接内联脚本、有的固定 900 格），保留仅作参考；打包部署时可以整个删掉，不影响 `index.html` / `grid.html`。

## 版权

Copyright © 2026 MFn，代码：MFn & Deepseek。
