// Cloudflare Pages Functions - Universal Serverless API Route
// Handles Auth, Files (Upload/Download), Posts, Books, Settings with KV/R2 and CORS preflight

interface WorkerEnv {
  FOX2_KV?: any;
  FOX2_BUCKET?: any;
  ADMIN_USER?: string;
  ADMIN_PASSWORD?: string;
  CORS_ORIGIN?: string;
}

const DEFAULT_ADMIN = 'admin';
const DEFAULT_PASS = 'fox2admin888';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-role, x-user-id, x-user-name, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Disposition, Content-Range, Accept-Ranges',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

function getAuthRole(request: Request): { role: string; userId: string; userName: string } {
  const role = request.headers.get('x-user-role') || 'guest';
  const userId = request.headers.get('x-user-id') || 'guest';
  const rawName = request.headers.get('x-user-name');
  const userName = rawName ? decodeURIComponent(rawName) : '访客';
  return { role, userId, userName };
}

// Global OPTIONS handler for CORS preflight
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const onRequest = async (context: { request: Request; env: WorkerEnv }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  // 1. CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2. Health check
  if (pathname === '/api/health') {
    return jsonResponse({
      status: 'ok',
      service: 'fox2-cloudflare-workers',
      timestamp: new Date().toISOString(),
      kvConfigured: !!env.FOX2_KV,
      r2Configured: !!env.FOX2_BUCKET,
    });
  }

  // 3. Auth Routes (/api/auth/login, /api/auth/current, /api/auth/logout, /api/auth/register)
  if (pathname === '/api/auth/login') {
    let username = '';
    let password = '';

    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.json() as any;
        username = body?.username || '';
        password = body?.password || '';
      } catch (e) {
        username = url.searchParams.get('username') || '';
        password = url.searchParams.get('password') || '';
      }
    } else {
      username = url.searchParams.get('username') || '';
      password = url.searchParams.get('password') || '';
    }

    if (!username || username.trim() === '') {
      return jsonResponse({ success: false, message: '请输入用户名' }, 400);
    }

    const adminUser = env.ADMIN_USER || DEFAULT_ADMIN;
    const adminPass = env.ADMIN_PASSWORD || DEFAULT_PASS;

    if (username.trim() === adminUser) {
      if (password === adminPass) {
        return jsonResponse({
          success: true,
          user: {
            id: 'user-admin',
            username: adminUser,
            role: 'admin',
            displayName: 'fox (站长)',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            token: 'token-admin-' + Date.now(),
          },
          message: '站长管理员登录成功 (Cloudflare Edge)',
        });
      } else {
        return jsonResponse({ success: false, message: '管理员密码错误，请查阅环境变量 ADMIN_PASSWORD 或使用测试密码 fox2admin888' }, 401);
      }
    }

    // Regular or visitor auto-registration
    return jsonResponse({
      success: true,
      user: {
        id: `user-${Date.now()}`,
        username: username.trim(),
        role: 'user',
        displayName: username.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        token: `token-user-${Date.now()}`,
      },
      message: `欢迎回来，${username.trim()} (已自动完成登录)`,
    });
  }

  if (pathname === '/api/auth/current') {
    const { role, userId, userName } = getAuthRole(request);
    return jsonResponse({
      success: true,
      user: {
        id: userId,
        username: userName,
        role: role,
        displayName: userName,
        avatar: role === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      },
    });
  }

  if (pathname === '/api/auth/logout') {
    return jsonResponse({ success: true, message: '已安全登出' });
  }

  // 4. File Upload (/api/files/upload) - Support POST, PUT, OPTIONS
  if (pathname === '/api/files/upload') {
    const { role } = getAuthRole(request);
    const queryRole = url.searchParams.get('role');
    const effectiveRole = role === 'admin' || queryRole === 'admin' ? 'admin' : role;

    if (effectiveRole !== 'admin') {
      return jsonResponse({ success: false, message: '网盘区仅管理员有权上传文件' }, 403);
    }

    try {
      const contentType = request.headers.get('content-type') || '';
      let filename = `upload-${Date.now()}`;
      let fileData: ArrayBuffer | null = null;
      let mimeType = 'application/octet-stream';
      let fileSize = 0;

      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file');
        if (file && typeof file === 'object' && 'name' in file) {
          filename = (file as any).name;
          mimeType = (file as any).type || 'application/octet-stream';
          fileData = await (file as any).arrayBuffer();
          fileSize = (file as any).size;
        }
      } else {
        // Raw binary upload
        filename = url.searchParams.get('name') || `file-${Date.now()}.bin`;
        fileData = await request.arrayBuffer();
        fileSize = fileData.byteLength;
      }

      if (!fileData) {
        return jsonResponse({ success: false, message: '未收到上传的文件内容' }, 400);
      }

      const fileId = `file-${Date.now()}`;
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Save to Cloudflare R2 if available
      if (env.FOX2_BUCKET) {
        await env.FOX2_BUCKET.put(`files/${fileId}`, fileData, {
          httpMetadata: { contentType: mimeType },
          customMetadata: { filename, size: String(fileSize) },
        });
      }

      // Record metadata in KV or return payload
      const fileRecord = {
        id: fileId,
        name: filename,
        size: fileSize,
        type: mimeType,
        updatedAt: dateStr,
        url: `/api/files/download/${fileId}`,
        uploadedBy: 'fox (站长)',
        uploaderRole: 'admin',
      };

      if (env.FOX2_KV) {
        const existingRaw = await env.FOX2_KV.get('fox2_files');
        const list = existingRaw ? JSON.parse(existingRaw) : [];
        list.unshift(fileRecord);
        await env.FOX2_KV.put('fox2_files', JSON.stringify(list));
      }

      return jsonResponse({
        success: true,
        data: fileRecord,
        message: '文件上传成功 (Cloudflare Edge)',
      });
    } catch (err: any) {
      return jsonResponse({ success: false, message: '文件处理失败: ' + (err.message || String(err)) }, 500);
    }
  }

  // 5. File Download (/api/files/download/:id) - Support GET, POST, HEAD
  if (pathname.startsWith('/api/files/download/')) {
    const fileId = pathname.replace('/api/files/download/', '');
    let fileBytes: ArrayBuffer | null = null;
    let filename = `download-${fileId}.txt`;
    let mimeType = 'application/octet-stream';

    if (env.FOX2_BUCKET) {
      const obj = await env.FOX2_BUCKET.get(`files/${fileId}`);
      if (obj) {
        fileBytes = await obj.arrayBuffer();
        filename = obj.customMetadata?.filename || filename;
        mimeType = obj.httpMetadata?.contentType || mimeType;
      }
    }

    if (!fileBytes) {
      // Stream fallback content if object not physically in R2
      const textContent = `fox 个人数字空间文件：${fileId}\n由 Cloudflare Pages / Workers 边缘存储提供支持。\n生成时间: ${new Date().toISOString()}`;
      fileBytes = new TextEncoder().encode(textContent).buffer;
      filename = `${fileId}.txt`;
      mimeType = 'text/plain; charset=utf-8';
    }

    const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');

    return new Response(method === 'HEAD' ? null : fileBytes, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': String(fileBytes.byteLength),
        ...corsHeaders,
      },
    });
  }

  // 6. Files List & Delete (/api/files)
  if (pathname === '/api/files') {
    const { role } = getAuthRole(request);
    if (role !== 'admin') {
      return jsonResponse({ success: false, message: '网盘区仅管理员可见' }, 403);
    }

    if (env.FOX2_KV) {
      const raw = await env.FOX2_KV.get('fox2_files');
      const list = raw ? JSON.parse(raw) : [];
      return jsonResponse({ success: true, data: list });
    }

    // Default mock files for Cloudflare edge preview
    return jsonResponse({
      success: true,
      data: [
        {
          id: 'file-cf-1',
          name: '云原生架构图谱与D1实践.pdf',
          size: 1887436,
          type: 'application/pdf',
          updatedAt: '2026-11-06 10:00',
          url: '/api/files/download/file-cf-1',
          uploadedBy: 'fox (站长)',
          uploaderRole: 'admin',
        },
        {
          id: 'file-cf-2',
          name: '白狐原画壁纸集.zip',
          size: 38402100,
          type: 'application/zip',
          updatedAt: '2026-11-06 09:30',
          url: '/api/files/download/file-cf-2',
          uploadedBy: 'fox (站长)',
          uploaderRole: 'admin',
        },
      ],
    });
  }

  // 7. Storage Status (/api/storage/status)
  if (pathname === '/api/storage/status') {
    return jsonResponse({
      success: true,
      d1Configured: false,
      r2Configured: !!env.FOX2_BUCKET,
      kvConfigured: !!env.FOX2_KV,
      usage: {
        d1UsedMB: 0,
        d1TotalMB: 0,
        r2UsedMB: env.FOX2_BUCKET ? 2.5 : 0,
        r2TotalMB: env.FOX2_BUCKET ? 10240 : 0,
        kvUsedMB: env.FOX2_KV ? 0.05 : 0,
        kvTotalMB: env.FOX2_KV ? 1024 : 0,
      },
      message: 'Cloudflare Pages Functions storage metric provider',
    });
  }

  // 8. Other routes passthrough or mock for serverless fallback
  return jsonResponse({
    success: false,
    message: `Cloudflare Workers 未匹配到路由: ${method} ${pathname}`,
  }, 404);
};
