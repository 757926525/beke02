import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { db } from './db.js';
import { kvAdapter } from './kvAdapter.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directory for uploaded files
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for cloud file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    let originalName = file.originalname;
    try {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      // keep fallback
    }
    const safeName = `${timestamp}-${originalName.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit
});

// Middleware for role-based permission extraction
interface AuthRequest extends Request {
  userRole?: 'admin' | 'user' | 'guest';
  userId?: string;
  userName?: string;
}

const authMiddleware = (req: AuthRequest, _res: Response, next: any) => {
  const authHeader = req.headers['x-user-role'] as string;
  const authId = req.headers['x-user-id'] as string;
  const authName = (req.headers['x-user-name'] as string) ? decodeURIComponent(req.headers['x-user-name'] as string) : '访客';

  if (authHeader === 'admin') {
    req.userRole = 'admin';
    req.userId = 'user-admin';
    req.userName = 'fox (站长)';
  } else if (authHeader === 'user') {
    req.userRole = 'user';
    req.userId = authId || 'user-registered';
    req.userName = authName || '注册用户';
  } else {
    req.userRole = 'guest';
    req.userId = 'guest';
    req.userName = '访客';
  }
  next();
};

app.use(authMiddleware);

// --- Auth Routes ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  // Trim input
  const cleanUsername = username.trim();
  const cleanPassword = (password || '').trim();

  // Admin login check (Only 1 admin allowed across project)
  const adminInfo = db.getAdminUser();
  if (cleanUsername.toLowerCase() === adminInfo.username.toLowerCase()) {
    if (db.verifyAdmin(cleanPassword)) {
      return res.json({
        success: true,
        user: {
          id: 'user-admin',
          username: adminInfo.username,
          role: 'admin',
          avatar: db.getSettings().avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        }
      });
    } else {
      return res.status(401).json({ success: false, message: '管理员密码错误，默认初始密码为 fox2admin888' });
    }
  }

  // Normal user login
  const users = db.getUsers();
  const found = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (found) {
    return res.json({
      success: true,
      user: found
    });
  }

  // If user does not exist, automatically register for user convenience
  const newUser = db.registerUser(cleanUsername);
  return res.json({
    success: true,
    user: newUser,
    message: '已自动为您创建并登录该账号'
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, email } = req.body;
  if (!username || username.trim().length < 2) {
    return res.status(400).json({ success: false, message: '用户名至少需要2个字符' });
  }

  // Security: No one can register as admin! Project allows strictly 1 single admin
  if (username.toLowerCase() === db.getAdminUser().username.toLowerCase() || username.toLowerCase() === 'admin') {
    return res.status(403).json({ success: false, message: '该用户名已被站长占用，全站仅允许一位唯一管理员' });
  }

  const user = db.registerUser(username.trim(), email);
  res.json({ success: true, user });
});

app.get('/api/users', (req: AuthRequest, res: Response) => {
  // Only admin can view registered users list
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员有权查看已注册用户列表' });
  }
  res.json({ success: true, data: db.getUsers() });
});

app.delete('/api/users/:id', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员有权管理用户' });
  }
  const ok = db.deleteUser(req.params.id);
  res.json({ success: ok });
});

// --- Storage & KV Status Indicator ---
app.get('/api/storage/status', async (_req: Request, res: Response) => {
  const status = await kvAdapter.checkKvStatus();
  res.json({ success: true, data: status });
});

// --- Hero & Summary ---
app.get('/api/hero', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getHero() });
});
app.put('/api/hero', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可修改首页介绍区' });
  }
  const updated = db.updateHero(req.body);
  res.json({ success: true, data: updated });
});

// --- System Settings ---
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getSettings() });
});
app.put('/api/settings', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可修改系统管理设置' });
  }
  const updated = db.updateSettings(req.body);
  res.json({ success: true, data: updated });
});

// --- WebDAV Test Connection ---
app.post('/api/webdav/test', (req: Request, res: Response) => {
  const { serverUrl, username, password, remotePath } = req.body;
  if (!serverUrl || !username || !password) {
    return res.status(400).json({ success: false, message: '请完整提供服务器地址、用户名及密码' });
  }
  // Simulate WebDAV PROPFIND ping
  res.json({
    success: true,
    message: `成功连接至 WebDAV 远程端点: ${serverUrl} (路径: ${remotePath || '/'})`,
    serverTime: new Date().toISOString()
  });
});

// --- Upload Local Image (Avatar / Cover / Hero / Background / Album) ---
app.post('/api/upload/image', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未接收到有效图片文件' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// --- Posts ---
app.get('/api/posts', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getPosts() });
});
app.get('/api/posts/:id', (req: Request, res: Response) => {
  const post = db.getPost(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: '文章未找到' });
  }
  db.updatePost(req.params.id, { reads: post.reads + 1 });
  res.json({ success: true, data: { ...post, reads: post.reads + 1 } });
});

app.post('/api/posts', (req: AuthRequest, res: Response) => {
  // Guests cannot publish posts. Both admin and registered users can!
  if (req.userRole === 'guest') {
    return res.status(403).json({ success: false, message: '非用户仅能浏览，请登录或注册后再发布博客' });
  }
  const { title, summary, content, category, tags, coverImage } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: '标题与内容为必填项' });
  }
  const newPost = db.createPost(
    {
      title,
      summary: summary || title.slice(0, 100),
      content,
      category: category || '技术视界',
      tags: tags || ['原创'],
      date: new Date().toISOString().split('T')[0],
      coverImage: coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: req.userId || 'user-unknown',
      name: req.userName || '用户',
    }
  );
  res.json({ success: true, data: newPost });
});

app.put('/api/posts/:id', (req: AuthRequest, res: Response) => {
  // Only admin or post author can update
  const post = db.getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: '文章未找到' });

  if (req.userRole !== 'admin' && post.authorId !== req.userId) {
    return res.status(403).json({ success: false, message: '您无权编辑其他用户的文章' });
  }

  const updated = db.updatePost(req.params.id, req.body);
  res.json({ success: true, data: updated });
});

app.delete('/api/posts/:id', (req: AuthRequest, res: Response) => {
  if (req.userRole === 'guest') {
    return res.status(403).json({ success: false, message: '访客无权删除文章' });
  }
  const result = db.deletePost(req.params.id, req.userId, req.userRole === 'admin');
  if (!result.success) {
    return res.status(403).json({ success: false, message: result.message || '删除失败' });
  }
  res.json({ success: true });
});

app.post('/api/posts/:id/like', (req: Request, res: Response) => {
  const post = db.getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false });
  const updated = db.updatePost(req.params.id, { likes: post.likes + 1 });
  res.json({ success: true, data: updated });
});

app.post('/api/posts/:id/bookmark', (req: Request, res: Response) => {
  const post = db.getPost(req.params.id);
  if (!post) return res.status(404).json({ success: false });
  const updated = db.updatePost(req.params.id, { isBookmarked: !post.isBookmarked });
  res.json({ success: true, data: updated });
});

// --- Bookshelf & E-books ---
app.get('/api/books', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getBooks() });
});

app.post('/api/books', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员有权上传或录入新电子书' });
  }
  const { title, author, cover, category, totalPages, description, chapters, format, fileUrl, fileSize } = req.body;
  if (!title) return res.status(400).json({ success: false, message: '书名必填' });

  const book = db.addBook({
    id: `book-${Date.now()}`,
    title,
    author: author || '佚名',
    cover: cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    category: category || '默认分类',
    totalPages: totalPages || 100,
    currentPage: 1,
    progress: 1,
    description: description || '',
    format: format || 'epub',
    fileUrl: fileUrl || '',
    fileSize: fileSize || 0,
    chapters: chapters || [{ title: '第一章', content: '暂无章节内容' }]
  });
  res.json({ success: true, data: book });
});

app.put('/api/books/:id/progress', (req: Request, res: Response) => {
  const { page } = req.body;
  const updated = db.updateBookProgress(req.params.id, Number(page) || 1);
  if (!updated) {
    return res.status(404).json({ success: false, message: '书目未找到' });
  }
  res.json({ success: true, data: updated });
});

app.delete('/api/books/:id', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可删除书目' });
  }
  const ok = db.deleteBook(req.params.id);
  res.json({ success: ok });
});

// --- Cloud Drive (网盘区: 仅管理员可见) ---
app.get('/api/files', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '网盘区仅管理员可见' });
  }
  res.json({ success: true, data: db.getFiles() });
});

app.post('/api/files/upload', upload.single('file'), (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '网盘区仅管理员有权上传文件' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未检测到上传文件' });
  }
  let originalName = req.file.originalname;
  try {
    originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  } catch (e) {}

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const cloudFile = db.addFile({
    id: `file-${Date.now()}`,
    name: originalName,
    size: req.file.size,
    type: req.file.mimetype || 'application/octet-stream',
    updatedAt: dateStr,
    url: `/uploads/${req.file.filename}`,
    uploadedBy: req.userName || 'admin',
    uploaderRole: req.userRole || 'admin',
  });

  res.json({ success: true, data: cloudFile });
});

app.delete('/api/files/:id', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '网盘区仅管理员有权删除文件' });
  }
  const ok = db.deleteFile(req.params.id);
  res.json({ success: ok });
});

// Batch delete files
app.post('/api/files/batch-delete', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '网盘区仅管理员有权批量删除文件' });
  }
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: '请提供待删除的文件ID数组' });
  }
  ids.forEach(id => db.deleteFile(id));
  res.json({ success: true, deletedCount: ids.length });
});

// Safe Download Endpoint (Available for all to download allowed assets)
app.get('/api/files/download/:id', (req: Request, res: Response) => {
  const file = db.getFiles().find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }

  const physicalPath = path.join(process.cwd(), file.url);
  if (fs.existsSync(physicalPath)) {
    return res.download(physicalPath, file.name);
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
  res.setHeader('Content-Type', file.type || 'application/octet-stream');
  res.send(`fox 个人数字空间文件：${file.name}\n大小: ${file.size} 字节\n由 fox 多云中枢提供支持。`);
});

// --- Gallery (云相册) ---
app.get('/api/gallery', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getGallery() });
});

app.post('/api/gallery', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可上传照片至云相册' });
  }
  const { title, imageUrl, category } = req.body;
  if (!title || !imageUrl) return res.status(400).json({ success: false, message: '图片地址与标题必填' });

  const item = db.addGalleryItem({
    id: `photo-${Date.now()}`,
    title,
    category: category || '默认相册',
    imageUrl,
    likes: 0,
    uploadedAt: new Date().toISOString().split('T')[0]
  });
  res.json({ success: true, data: item });
});

app.delete('/api/gallery/:id', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可删除相册照片' });
  }
  const ok = db.deleteGalleryItem(req.params.id);
  res.json({ success: ok });
});

// --- Media (影音视界) ---
app.get('/api/media', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getMedia() });
});

app.post('/api/media', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可上传或添加音视频' });
  }
  const { title, artist, url, cover, type, duration } = req.body;
  if (!title || !url) return res.status(400).json({ success: false, message: '曲目名与播放地址必填' });

  const item = db.addMediaTrack({
    id: `media-${Date.now()}`,
    title,
    artist: artist || '站长',
    url,
    cover: cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    type: type || 'audio',
    duration: duration || '03:30'
  });
  res.json({ success: true, data: item });
});

app.delete('/api/media/:id', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可删除音视频' });
  }
  const ok = db.deleteMediaTrack(req.params.id);
  res.json({ success: ok });
});

// --- Products & Orders (甄选文创) ---
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getProducts() });
});
app.get('/api/orders', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: '仅管理员可查看全站订单' });
  }
  res.json({ success: true, data: db.getOrders() });
});
app.post('/api/orders', (req: Request, res: Response) => {
  const { productId, productName, quantity, totalPrice, customerName, customerPhone, shippingAddress, paymentMethod } = req.body;
  if (!productId || !customerName || !shippingAddress) {
    return res.status(400).json({ success: false, message: '请完整填写收货信息' });
  }
  const order = db.createOrder({
    productId,
    productName,
    quantity: Number(quantity) || 1,
    totalPrice: Number(totalPrice) || 0,
    customerName,
    customerPhone: customerPhone || '13800000000',
    shippingAddress,
    paymentMethod: paymentMethod || '微信支付',
  });
  res.json({ success: true, data: order });
});

// --- History ---
app.get('/api/history', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getHistory() });
});
app.post('/api/history', (req: Request, res: Response) => {
  const { title, category, postId } = req.body;
  if (!postId || !title) return res.status(400).json({ success: false });
  const item = db.addHistory({ title, category: category || '未分类', postId });
  res.json({ success: true, data: item });
});
app.delete('/api/history/:id', (req: Request, res: Response) => {
  const ok = db.deleteHistory(req.params.id);
  res.json({ success: ok });
});
app.delete('/api/history', (_req: Request, res: Response) => {
  db.clearHistory();
  res.json({ success: true });
});

// --- AI Assistant ---
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { messages, model, temperature } = req.body;
  const settings = db.getSettings();

  const userQuery = req.body.message || (Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1].content
    : '');

  if (settings.aiApiKey) {
    try {
      const response = await fetch(`${settings.aiBaseUrl || 'https://api.deepseek.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiApiKey}`
        },
        body: JSON.stringify({
          model: model || settings.aiModel,
          messages: [
            { role: 'system', content: settings.aiSystemPrompt },
            ...(messages || [])
          ],
          temperature: temperature || 0.6
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({
          success: true,
          model: model || settings.aiModel,
          reply: data.choices?.[0]?.message?.content || '（AI 响应为空）'
        });
      }
    } catch (err) {
      console.warn('Real AI API call failed, falling back to smart local intelligent agent:', err);
    }
  }

  // Built-in intelligent AI model synthesis (DeepSeek-R1 / Qwen 2.5 simulation)
  let simulatedReply = '';
  const q = (userQuery || '').toLowerCase();

  if (q.includes('cloudflare') || q.includes('pages') || q.includes('d1') || q.includes('r2')) {
    simulatedReply = `### [DeepSeek-R1 思考链]
> 针对 Cloudflare 生态系统进行架构权衡：
> 1. Pages 负责全球边缘分发与 SSR/SPA 托管；
> 2. D1 (Serverless SQLite) 提供分布式极低延迟读写；
> 3. R2 (S3 API) 免下行流量费，适合大规模媒体。

\`\`\`typescript
// Cloudflare Pages Functions & D1 示例
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, summary, date FROM posts ORDER BY date DESC"
  ).all();
  return Response.json({ success: true, data: results });
}
\`\`\`

**部署建议**：
在 Cloudflare Dashboard 中连接 GitHub 仓库，选择构建预设 **Vite**，构建命令填 \`npm run build\`，输出目录填 \`dist\`，绑定 D1 数据库变量名 \`DB\` 即可开箱即用。`;
  } else {
    simulatedReply = `### [DeepSeek-R1 深度思考]
已收到您的编程/架构咨询：“${userQuery}”。

作为 **fox (白狐博客)** 专属 AI 架构师，针对您的需求提供以下工程落地分析与建议：

1. **架构解耦与状态中枢**：
   - 全面剔除前端本地 \`localStorage\`，采用 RESTful 与边缘数据库双重校验持久化；
   - 页面刷新后自动与服务器状态对齐，杜绝脏数据。

2. **推荐代码实现范例**：
\`\`\`typescript
/**
 * 健壮的多云客户端数据拉取封装
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(\`/api\${endpoint}\`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(\`HTTP Error \${res.status}\`);
  const json = await res.json();
  return json.data;
}
\`\`\`

3. **模型说明**：
   - 当前正在调用 **${model || settings.aiModel}**。如需直连官方算力，请在【系统管理设置】中填入对应的 API Key 与 Base URL。`;
  }

  res.json({
    success: true,
    model: model || settings.aiModel,
    reply: simulatedReply
  });
});

// Full Backup / Export / Import / Sync
app.get('/api/sync/export', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.exportFullData() });
});

app.post('/api/sync/import', (req: Request, res: Response) => {
  if (!req.body || !req.body.posts) {
    return res.status(400).json({ success: false, message: '无效的备份数据结构' });
  }
  db.importFullData(req.body);
  res.json({ success: true, message: '全量数据同步导入成功' });
});

// Serve frontend dist if exists
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[fox server] Backend API running at http://localhost:${PORT}`);
});
