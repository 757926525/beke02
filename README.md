# fox · 现代多云博客与云端个人空间

> 微软 Outlook 绿白风格 (Emerald & Clean White) · 多云边缘原生架构 · 零客户端 LocalStorage 依赖 · 单管理员唯一制

本项目基于前沿技术栈与微软 Outlook 办公美学设计，参考 `https://beke.pages.dev/` 进行全面现代化重构。

---

## 🌟 核心特性与架构升级

1. **微软 Outlook 经典绿白美学 (Emerald & White)**
   - 采用翡翠绿 (`#059669`) 与温润纯白高对比度配色；
   - 顶部导航栏支持**一键收拢与展开**，享受沉浸式研读；
   - 品牌名默认为 `fox`（支持在后台一键自定义）；
   - 页眉状态徽章升级为**站内消息状态灯**，实时感知通信畅通度；
   - 页面布局切换按钮已收纳于【系统管理设置】内。

2. **单项目唯一管理员制 (RBAC 权限中枢)**
   - 全项目**仅限一位唯一管理员（站长）**；
   - **管理员**拥有系统所有编辑控制权、网盘访问权、相册管理权及系统设置权；
   - **注册用户**仅能发布自己的博文并删除自己的博文，**无权删除或修改其他用户文件与管理员设置**；
   - **未登录访客**仅能浏览与下载开放文件，不能发布内容；
   - 管理员账号与密码在**部署环境变量**中预先设定，杜绝安全隐患。

3. **真实有效的云端存储池 (D1 / R2 / KV / AI)**
   - **数值真实有效**：未接入 Cloudflare D1 或 R2 时，存储池总容量与已用容量默认显示为零或真实物理大小，绝不伪造虚假容量；
   - **状态指示灯真实有效**：接入 KV 或云端池后呈绿色微光呼吸灯；未接入时呈离线/本地状态；
   - **完全离线零网络自洽**：系统自带轻量文件型数据库与 local uploads 目录，即便完全不配置任何外部云服务，全站功能依然 100% 正常运行。

4. **网盘与 WebDAV 调度中枢 (站长专属)**
   - **网盘区仅管理员可见**；
   - 支持**小图、中图、大图、详细列表**四种全能检视模式；
   - 支持单个与批量文件极速上传、下载与批量删除；
   - 上传与下载均带有**实时流式进度条**；
   - **坚果云 / WebDAV 远端同步**提供标准的 4 大核心接口：
     - 服务器地址 (Server URL)
     - 用户名 (Username)
     - 应用授权密码 (Password)
     - 远程路径 (Remote Path)
     - 支持一键连通性连通探测测试。

5. **博文编辑器与多媒体资产库**
   - **一键选择插入云相册图片**（弹出相册选择器，一键插入高清 Markdown 格式图片）；
   - **一键插入视频与音乐**（支持 HTML5 视频流与音频流一键插入）；
   - **自定义本地封面图片**：支持从本地选择图片直接上传并绑定为博客封面，也可以随时更换 Hero 首页背景。

6. **随身数字书架与移动端优化**
   - 支持本地上传电子书与离线下载；
   - 明确标注格式兼容性：支持 **.EPUB, .PDF, .TXT, .MOBI, .AZW3**；不支持受 DRM 数字加密的专有文件；
   - **手机全屏研读体验**：针对移动端优化，顶部保留刘海安全区，绝不遮挡手机状态栏。

---

## 🔐 环境变量与管理员凭证说明

在部署时，请在平台控制台或 `.env` 中设置以下关键变量：

| 环境变量名 | 说明 | 默认值 (测试用) | 生产推荐 |
|---|---|---|---|
| `ADMIN_USER` | **系统唯一管理员用户名** | `admin` | 设置为您的专属站长名 |
| `ADMIN_PASSWORD` | **系统唯一管理员密码** | `fox2admin888` | **请务必在部署控制台设定强密码** |
| `CF_KV_NAMESPACE` | Cloudflare KV 命名空间名称 (可选) | 无 (自动离线) | `CF_KV_FOX_PROD` |
| `CF_D1_DATABASE` | Cloudflare D1 数据库名称 (可选) | 无 (自动离线) | `fox_blog_d1` |
| `CF_R2_BUCKET` | Cloudflare R2 存储桶名称 (可选) | 无 (自动离线) | `fox-assets` |

> ⚠️ **重要安全说明**：管理员密码是部署时的敏感环境变量，请不要硬编码在公开 Git 仓库中。未设置时系统将启用初始默认密码 `fox2admin888`。

---

## 🚀 多云平台部署指南

### 一、Cloudflare Pages 部署指南 (推荐)

#### 1. 方式 A: GitHub / GitLab 自动化 CI/CD
1. 将本项目推送至您的 GitHub / GitLab 仓库；
2. 登录 Cloudflare Dashboard -> **Compute (Workers & Pages)** -> **Create application** -> **Pages** -> **Connect to Git**；
3. 选择该仓库，配置构建设置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 在 **Environment variables** 中添加：
   - `ADMIN_USER`: 您的站长账号
   - `ADMIN_PASSWORD`: 您的专属站长密码
5. 点击 **Save and Deploy** 即可全球上线！

#### 2. 方式 B: 直接上传预构建压缩包 (Direct Upload)
本项目内置一键打包 Cloudflare Pages 归档命令：
```bash
npm run build:pages
```
构建完成后会在根目录生成 `dist-pages.zip`（内含完整的静态单页路由 `404.html` 与 `_routes.json`）。直接在 Cloudflare Pages 后台拖拽上传即可。

#### 3. 绑定 Cloudflare D1 / R2 / KV / Workers AI
在 Cloudflare Pages 项目后台 -> **Settings** -> **Functions** -> **Bindings** 中：
- **D1 Database**: 绑定变量名为 `DB`，关联您的 D1 数据库实例；
- **R2 Bucket**: 绑定变量名为 `BUCKET`，关联您的 R2 免流量费对象存储桶；
- **KV Namespace**: 绑定变量名为 `KV`，关联您的边缘键值命名空间；
- **Workers AI**: 绑定变量名为 `AI`。

---

### 二、腾讯云 EdgeOne / 轻量应用服务器

#### 1. EdgeOne 边缘托管 (静态 + 边缘函数)
- 构建前端静态资源：`npm run build`
- 将 `dist/` 目录下全部文件上传至腾讯云 COS 对象存储；
- 在 EdgeOne 控制台开启全站边缘加速与 HTTPS 证书。

#### 2. 腾讯云轻量服务器 (Node.js + PM2)
```bash
git clone <your-repo>
cd fox2
npm install
npm run build
npm install -g pm2
ADMIN_USER=admin ADMIN_PASSWORD=your_secure_password pm2 start "npm run start" --name "fox2"
```

---

### 三、阿里云 ESA 边缘安全加速 / OSS

1. 执行 `npm run build` 生成 `dist` 静态包；
2. 打开阿里云 OSS 控制台，创建静态网站托管存储桶，上传 `dist/` 全部文件；
3. 接入阿里云 ESA (Edge Security Acceleration) 或 CDN，配置回源与免费 SSL 证书。

---

### 四、Vercel 部署

本项目根目录已内置 `vercel.json` 规则：
1. 在 Vercel 控制台导入 GitHub 仓库；
2. 构建命令为 `npm run build`，输出目录为 `dist`；
3. 在 Settings -> Environment Variables 中配置 `ADMIN_USER` 与 `ADMIN_PASSWORD`；
4. 点击 Deploy 即可。

---

### 五、Docker / 私有云一键部署

根目录已提供完整的 `Dockerfile` 与 `docker-compose.yml`：
```bash
docker compose up -d --build
```
启动后访问 `http://localhost:3001` 即可体验。

---

## 🛠️ 本地开发与测试命令

```bash
# 安装依赖
npm install

# 启动本地开发热更新服务器 (前端 Vite 运行在 3000，后端 API 运行在 3001)
npm run dev

# 编译打包前端与后端
npm run build

# 生成 Cloudflare Pages 上传压缩包
npm run build:pages

# 启动生产级全功能服务
npm run start
```
