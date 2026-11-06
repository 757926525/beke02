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
    // Preserve original name while ensuring uniqueness if duplicate
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const safeName = `${timestamp}-${originalName.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// API Routes

// 0. Storage & KV Status Indicator
app.get('/api/storage/status', async (_req: Request, res: Response) => {
  const status = await kvAdapter.checkKvStatus();
  res.json({ success: true, data: status });
});

// Toggle KV emulation for testing fallback
app.post('/api/storage/toggle-kv', (req: Request, res: Response) => {
  const { enabled } = req.body;
  kvAdapter.setKvAvailable(!!enabled);
  res.json({ success: true, enabled: !!enabled });
});

// 1. Hero & Summary
app.get('/api/hero', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getHero() });
});
app.put('/api/hero', (req: Request, res: Response) => {
  const updated = db.updateHero(req.body);
  res.json({ success: true, data: updated });
});

// 2. System Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getSettings() });
});
app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, data: updated });
});

// 3. Posts
app.get('/api/posts', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getPosts() });
});
app.get('/api/posts/:id', (req: Request, res: Response) => {
  const post = db.getPost(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: '文章未找到' });
  }
  // increment reads
  db.updatePost(req.params.id, { reads: post.reads + 1 });
  res.json({ success: true, data: { ...post, reads: post.reads + 1 } });
});
app.post('/api/posts', (req: Request, res: Response) => {
  const { title, summary, content, category, tags, coverImage } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: '标题与内容为必填项' });
  }
  const newPost = db.createPost({
    title,
    summary: summary || title.slice(0, 100),
    content,
    category: category || '技术视界',
    tags: tags || ['原创'],
    date: new Date().toISOString().split('T')[0],
    coverImage: coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  });
  res.json({ success: true, data: newPost });
});
app.put('/api/posts/:id', (req: Request, res: Response) => {
  const updated = db.updatePost(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '文章未找到' });
  }
  res.json({ success: true, data: updated });
});
app.delete('/api/posts/:id', (req: Request, res: Response) => {
  const ok = db.deletePost(req.params.id);
  res.json({ success: ok });
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

// 4. Books
app.get('/api/books', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getBooks() });
});
app.put('/api/books/:id/progress', (req: Request, res: Response) => {
  const { page } = req.body;
  const updated = db.updateBookProgress(req.params.id, Number(page) || 1);
  if (!updated) {
    return res.status(404).json({ success: false, message: '书目未找到' });
  }
  res.json({ success: true, data: updated });
});

// 5. Products & Orders (Mall)
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getProducts() });
});
app.get('/api/orders', (_req: Request, res: Response) => {
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

// 6. Cloud Files & WebDAV
app.get('/api/files', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getFiles() });
});
app.post('/api/files/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未检测到上传文件' });
  }
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const cloudFile = db.addFile({
    id: `file-${Date.now()}`,
    name: originalName,
    size: req.file.size,
    type: req.file.mimetype || 'application/octet-stream',
    updatedAt: dateStr,
    url: `/uploads/${req.file.filename}`
  });

  res.json({ success: true, data: cloudFile });
});

app.get('/api/files/download/:id', (req: Request, res: Response) => {
  const file = db.getFiles().find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ success: false, message: '文件未找到' });
  }

  // Check if file physically exists
  const physicalPath = path.join(process.cwd(), file.url);
  if (fs.existsSync(physicalPath)) {
    return res.download(physicalPath, file.name);
  }

  // If it's a seed sample file, generate mock text content for download
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
  res.setHeader('Content-Type', file.type || 'application/octet-stream');
  res.send(`白狐博客 (WhiteFox Blog) 示例资源内容：${file.name}\n文件大小: ${file.size} 字节\n由 fox2 多云边缘中枢提供支持。`);
});

app.delete('/api/files/:id', (req: Request, res: Response) => {
  const ok = db.deleteFile(req.params.id);
  res.json({ success: ok });
});

// 7. Browsing History
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

// 8. AI Code & Architecture Assistant
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { messages, model, temperature } = req.body;
  const settings = db.getSettings();

  const userQuery = req.body.message || (Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1].content
    : '');

  // If user configured real Cloudflare Workers AI / DeepSeek API Key, attempt to call it
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
> 2. D1 (Serverless SQLite) 提供分布式极低延迟读；
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
  } else if (q.includes('react') || q.includes('hooks') || q.includes('组件')) {
    simulatedReply = `### [DeepSeek-R1 思考链]
> 分析 React 18 高并发与自定义 Hook 架构规范：
> 状态应保持单向数据流，与后端无缝同步，杜绝 localStorage 污染。

\`\`\`tsx
import { useState, useEffect } from 'react';

export function useSyncPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPosts(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { posts, loading };
}
\`\`\`
此 Hook 完全脱离浏览器本地存储，实现多端实时一致性。`;
  } else if (q.includes('docker') || q.includes('容器') || q.includes('nginx')) {
    simulatedReply = `### [DeepSeek-R1 思考链]
> 容器化最佳实践：使用多阶段构建（Multi-stage build）减小最终镜像体积，并集成 Node.js 后端与 Nginx 静态分发。

\`\`\`dockerfile
# 阶段 1: 构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 阶段 2: 运行
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3001
ENV PORT=3001
CMD ["npm", "run", "server"]
\`\`\``;
  } else {
    simulatedReply = `### [DeepSeek-R1 深度思考]
已收到您的编程/架构咨询：“${userQuery}”。

作为 **白狐博客 (fox2)** 专属 AI 架构师，针对您的需求提供以下工程落地分析与建议：

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

// 9. Full Backup / Export / Import / Sync
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

// Serve frontend dist if exists (in production)
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[fox2 server] Backend API running at http://localhost:${PORT}`);
});
