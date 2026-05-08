if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy) {
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
  delete process.env.http_proxy;
  delete process.env.https_proxy;
  console.log('Proxy environment variables cleared');
}

import express from 'express';
import cors from 'cors';
import noticeRoutes from './routes/notices';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', noticeRoutes);

app.get('/', (_req, res) => {
  res.json({
    name: 'A-Stock Notice API',
    version: '1.0.0',
    endpoints: {
      notices: '/api/notices',
      health: '/api/health',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/notices`);
});
