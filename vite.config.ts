import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'api-dev-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) {
            return next();
          }

          const parsedUrl = new URL(req.url, 'http://localhost');
          const pathname = parsedUrl.pathname;

          const sendJson = (code: number, data: any) => {
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          // Collect body for POST requests
          let body: any = {};
          if (req.method === 'POST') {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            try {
              body = dataStr ? JSON.parse(dataStr) : {};
            } catch {
              body = {};
            }
          }

          const mockRes = {
            statusCode: 200,
            setHeader: (k: string, v: string) => res.setHeader(k, v),
            status: (code: number) => {
              mockRes.statusCode = code;
              return mockRes;
            },
            json: (data: any) => sendJson(mockRes.statusCode, data),
            end: () => res.end(),
          };

          const mockReq = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            query: Object.fromEntries(parsedUrl.searchParams.entries()),
            body,
          };

          try {
            if (pathname === '/api/pesapal/initiate') {
              const mod = await server.ssrLoadModule('/api/pesapal/initiate.ts');
              return await mod.default(mockReq, mockRes);
            }
            if (pathname === '/api/pesapal/status') {
              const mod = await server.ssrLoadModule('/api/pesapal/status.ts');
              return await mod.default(mockReq, mockRes);
            }
            if (pathname === '/api/pesapal/ipn') {
              const mod = await server.ssrLoadModule('/api/pesapal/ipn.ts');
              return await mod.default(mockReq, mockRes);
            }
            if (pathname === '/api/email' || pathname === '/api/email/send') {
              const mod = await server.ssrLoadModule('/api/email.ts');
              return await mod.default(mockReq, mockRes);
            }
            next();
          } catch (err: any) {
            console.error('API Dev Server Handler Error:', err);
            sendJson(500, { error: err.message || 'Internal Server Error' });
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
