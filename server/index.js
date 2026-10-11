import { createStudentStore } from './store.js';
import { createApp } from './app.js';

try {
  const store = createStudentStore({ file: process.env.STUDENT_DATA_FILE });
  await store.initialize();
  const port = Number(process.env.PORT || 3004);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT không hợp lệ.');
  const server = createApp(store).listen(port, '127.0.0.1', () => {
    console.log(JSON.stringify({ ready: true, port: server.address().port, dataFile: store.dataFile }));
  });
  server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
  // Đóng HTTP server trước khi thoát; hoàn tất các request đang ghi.
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
} catch (error) {
  console.error('Không thể khởi động backend. Runtime được giữ nguyên:', error.message);
  process.exitCode = 1;
}
