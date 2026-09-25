import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handler as initializeCheckout } from './netlify/functions/paystack-initialize.mjs';
import { handler as verifyCheckout } from './netlify/functions/paystack-verify.mjs';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function paystackDevPlugin() {
  return {
    name: 'paystack-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const isInit = url.startsWith('/api/paystack/initialize');
        const isVerify = url.startsWith('/api/paystack/verify');
        if (!isInit && !isVerify) return next();

        const requestUrl = new URL(url, 'http://localhost');
        const event = {
          httpMethod: req.method,
          body: req.method === 'GET' ? '' : await readBody(req),
          headers: req.headers,
          queryStringParameters: Object.fromEntries(requestUrl.searchParams),
          isBase64Encoded: false,
        };
        try {
          const result = isInit ? await initializeCheckout(event) : await verifyCheckout(event);
          res.statusCode = result.statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(result.body);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Checkout failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY;

  return {
    plugins: [react(), paystackDevPlugin()],
    test: {
      globals: true,
      environment: 'jsdom',
    },
  };
});
