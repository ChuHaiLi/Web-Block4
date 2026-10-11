import express from 'express';
import path from 'node:path';
import { ApiError, projectRoot } from './store.js';

export function createApp(store) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', (_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/students', async (_request, response) => {
    response.json(await store.getAll());
  });
  app.post('/api/students', async (request, response) => {
    response.status(201).json(await store.add(request.body));
  });
  app.delete('/api/students/:id', async (request, response) => {
    response.json(await store.remove(request.params.id));
  });
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'API không tồn tại.' });
  });

  // Chỉ phục vụ file build có sẵn: HTML shell không chứa bảng/Student List.
  app.use(express.static(path.join(projectRoot, 'dist')));

  app.use((error, _request, response, _next) => {
    const status = error instanceof ApiError ? error.status :
      error.type === 'entity.parse.failed' ? 400 :
      error.type === 'entity.too.large' ? 413 : 500;
    const message = error instanceof ApiError ? error.message :
      status === 400 ? 'Request phải chứa JSON hợp lệ.' :
      status === 413 ? 'Dữ liệu gửi lên quá lớn.' :
      'Không thể đọc hoặc lưu dữ liệu sinh viên. Vui lòng kiểm tra backend và thử lại.';
    if (status === 500) console.error('Lỗi JSON storage:', error.message);
    response.status(status).json({ error: message });
  });
  return app;
}
