# fox2 · 白狐博客 (WhiteFox Blog)

> **灵狐踏雪 · 随心而述 · 云端无界**
> 一款融合东方古典意蕴与现代多云边缘计算的全功能数字化博客、随身书架、甄选文创商城、网盘与 AI 编程中枢。

---

## 🌟 核心特性与架构亮点

1. **零 LocalStorage 强依赖 (Zero LocalStorage)**：
   - 彻底摒弃前端 `localStorage` 脆弱缓存方案，全站所有动态状态（博客发布、文章点赞/收藏、足迹历史、书架章节阅读进度、文创结缘订单、云盘上传文件索引、系统参数）均通过 RESTful API 持久化保存至服务端 JSON/SQLite 边缘数据库。
   - 页面任意刷新、换端访问、隐私模式浏览均能 100% 保持状态一致。

2. **多云边缘就近分发**：
   - 原生适配 **Cloudflare Pages / Workers**、**腾讯云 EdgeOne / Serverless**、**阿里云 ESA** 及 **Vercel**。
   - 默认配置 SPA 路由智能重定向（包含 `404.html` 与 `_routes.json`），杜绝刷新空白页。

3. **内置智能编程与架构 AI 顾问**：
   - 深度集成 **DeepSeek-R1 (Qwen-32B)**、**Llama 3.1 70B** 与 **Qwen 2.5 Coder**。
   - 支持直连 Cloudflare Workers AI，提供代码分析、架构推演与部署故障自愈。

4. **全功能一体化中枢**：
   - 📖 **博客文章**：分类检索、文章点赞/书签收藏、Markdown 阅读器、实时足迹。
   - 📚 **随身书架**：多端阅读进度跟踪、分卷研读、翻页记忆。
   - 🛍️ **甄选文创商城**：好物浏览、结缘下单、全量订单跟踪管理。
   - 📷 **光影视界**：瀑布流相册、画质无损分发、点赞互动与灯箱浏览。
   - 🎵 **媒体影音**：Lo-Fi 沉浸式编码视听播放器。
   - 💻 **编程 AI**：全能云端代码架构顾问。
   - 💾 **网盘与 WebDAV**：文件直接上传、下载、删除及存储配额统计。
   - ⚙️ **系统管理设置**：站点元信息更新、AI 模型密钥配置、一键导出/导入全量备份 JSON。

---

## 🚀 快速开始与本地开发

### 1. 环境准备
确保机器已安装 Node.js (>= 18.0.0) 与 npm。

```bash
# 克隆仓库
git clone https://github.com/your-username/fox2.git
cd fox2

# 安装依赖
npm install
```

### 2. 启动全栈开发环境
本项目支持同时启动前端 Vite 开发热重载服务器与后端 Express API 服务器：

```bash
npm run dev
```

- 前端界面: `http://localhost:5173`
- 后端 API: `http://localhost:3001`

### 3. 构建与打包
```bash
# 同时构建前端与后端产物
npm run build

# 仅构建前端静态产物 (输出至 dist/)
npm run build:client

# 生成专供 Cloudflare Pages 直接上传的离线部署压缩包 (dist-pages.zip)
npm run build:pages
```

---

## ☁️ 多平台极速部署指引

### 方案 A：Cloudflare Pages 一键部署（首选推荐）

#### 方式 1：Git 仓库自动拉取部署（自动化 CI/CD）
1. 将本项目推送至您的 GitHub / GitLab 仓库；
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，在左侧导航栏点击 **“Workers 和 Pages”** -> **“创建”** -> **“Pages”**；
3. 选择 **“连接到 Git”** 并选择 `fox2` 仓库；
4. 构建配置如下设置：
   - **框架预设**：`Vite`
   - **构建命令**：`npm run build:client`
   - **构建输出目录**：`dist`
   - **环境变量**（可选）：`NODE_VERSION = 20`
5. 点击 **“保存并部署”**。Cloudflare 将自动在全球边缘网络节点分发，并在几秒钟内分配专属域名（如 `fox2.pages.dev`）。

#### 方式 2：直接上传离线压缩包（无需绑定 Git）
1. 在本地项目根目录运行：
   ```bash
   npm run build:pages
   ```
2. 脚本会在根目录自动打包生成 `dist-pages.zip`；
3. 在 Cloudflare Pages 控制台中选择 **“上传资产 (Direct Upload)”**；
4. 将 `dist-pages.zip` 解压后的文件或该压缩包上传，输入项目名称 `fox2`，点击部署即可瞬间完成发布！

---

### 方案 B：腾讯云 EdgeOne / 静态网站托管
1. 登录腾讯云控制台，进入 **EdgeOne** 或 **轻量云应用托管**；
2. 新建站点并绑定 Git 仓库；
3. 构建命令填写 `npm run build:client`，发布目录填写 `dist`；
4. EdgeOne 将为国内用户提供超低延迟的边缘节点加速与免费 SSL 证书。

---

### 方案 C：阿里云 ESA / 对象存储 OSS + CDN
1. 登录阿里云控制台，进入 **边缘安全加速 ESA** 或 **函数计算 FC**；
2. 可直接将本地打包好的 `dist/` 目录上传至 OSS 存储桶，并开启“静态网站托管”功能；
3. 将“默认首页”与“404 错误页”均设置为 `index.html`，以保证 SPA 路由正常跳转。

---

### 方案 D：Vercel 部署
1. 项目已内置标准 `vercel.json` 路由规则；
2. 登录 [Vercel 仪表盘](https://vercel.com/)，点击 **“Add New Project”** 并导入该仓库；
3. 构建命令填 `npm run build:client`，输出目录填 `dist`，点击 **“Deploy”** 即可。

---

### 方案 E：独立服务器 Docker / Docker Compose 一键部署
如果您拥有自己的 VPS 云服务器（如腾讯云 CVM、阿里云 ECS 或海外服务器），推荐使用全栈容器化部署：

```bash
# 启动持久化容器服务
docker-compose up -d --build
```

容器将自动运行 Node.js 全功能后端并挂载 `./data` 数据库与 `./uploads` 上传目录，数据在容器重启或销毁后依然安全保留。配套的 Nginx 反向代理配置可直接参考仓库中的 `nginx.conf`。

---

## 🤖 AI 编程与模型配置建议

白狐博客内置了智能 AI 工作台。站长可在 **【系统管理设置】** 中自定义模型参数：

1. **推荐模型选型**：
   - `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`：具备强大的数学推理与链式思考能力，适合复杂算法推导与工程架构；
   - `@cf/qwen/qwen2.5-coder-32b-instruct`：专为代码编写与 Bug 审查调优，生成代码严谨规范；
   - `@cf/meta/llama-3.1-70b-instruct`：中英文多语言综合能力出众。
2. **API Key 配置**：
   - 填入您的 DeepSeek API Key 或 Cloudflare Workers AI Token，即可无缝直连最新官方实时算力。
   - 留空时系统将自动启用本地内置的高保真智能推演引擎，随时保障演示可用性。

---

## 📁 目录结构

```text
fox2/
├── data/
│   └── db.json               # 服务端持久化数据库 (Zero LocalStorage)
├── dist/                     # 前端静态打包生成目录
├── dist-server/              # 后端独立打包产物
├── scripts/
│   └── package-pages.js      # Cloudflare Pages 离线包打包工具
├── server/
│   ├── db.ts                 # 边缘数据库管理引擎
│   └── index.ts              # RESTful API 后端服务
├── src/
│   ├── components/           # UI 视图组件库 (Blog, Bookshelf, Shop, Media, AI, Cloud, Admin)
│   ├── App.tsx               # 根组件
│   ├── api.ts                # 前端 REST API 通信层
│   ├── types.ts              # TypeScript 全局数据模型定义
│   └── index.css             # Tailwind CSS 样式
├── uploads/                  # 网盘文件实体存储目录
├── Dockerfile                # 多阶段 Docker 容器构建文件
├── docker-compose.yml        # Docker Compose 编排文件
├── nginx.conf                # 独立服务器 Nginx 生产反向代理配置
├── vercel.json               # Vercel 路由规则
├── netlify.toml              # Netlify 路由规则
└── vite.config.ts            # Vite 构建配置
```

---

## 📜 开源协议
本项目采用 [MIT 协议](LICENSE) 开源。欢迎 Star 与 Fork！
