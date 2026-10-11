import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { projectRoot } from '../server/store.js';

export async function testDirectory(label) {
  const base = path.join(projectRoot, '.tools/test-data');
  await fs.mkdir(base, { recursive: true });
  return fs.mkdtemp(path.join(base, label + '-'));
}

function launch(args, environment) {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot, env: { ...process.env, ...environment }, windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Server không sẵn sàng: ' + output)); }, 20000);
    child.on('error', (error) => { clearTimeout(timeout); reject(error); });
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
      for (const line of output.split('\n')) {
        try {
          const message = JSON.parse(line);
          if (message.ready) { clearTimeout(timeout); resolve(message); }
        } catch { /* Vite có thể ghi thêm thông tin không phải JSON. */ }
      }
    });
    child.stderr.on('data', (chunk) => { output += chunk.toString(); });
    child.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error('Server thoát trước khi sẵn sàng (' + code + '): ' + output));
    });
  });
  return { child, ready, output: () => output };
}

async function stop(processHandle) {
  if (!processHandle || processHandle.child.exitCode !== null || processHandle.child.signalCode !== null) return;
  await new Promise((resolve) => {
    processHandle.child.once('exit', resolve);
    processHandle.child.kill();
  });
}

// Mỗi suite sở hữu JSON riêng. Không dùng/chạm data/students.json thật, không reset file.
export async function startFixture(mode = 'production') {
  const directory = await testDirectory(mode);
  let dataFile = path.join(directory, 'students.json');
  let backend = launch(['server/index.js'], { PORT: '0', STUDENT_DATA_FILE: dataFile });
  let { port: backendPort } = await backend.ready;
  let vite;
  let url = 'http://127.0.0.1:' + backendPort;
  try {
    if (mode === 'dev' || mode === 'evidence') {
      const probe = net.createServer();
      const vitePort = await new Promise((resolve, reject) => {
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', () => { const port = probe.address().port; probe.close(() => resolve(port)); });
      });
      const script = "import { createServer } from 'vite'; const app=await createServer({server:{host:'127.0.0.1',port:Number(process.env.TEST_VITE_PORT),strictPort:true}}); await app.listen(); console.log(JSON.stringify({ready:true,port:app.httpServer.address().port}));";
      vite = launch(['--input-type=module', '-e', script], { API_PORT: String(backendPort), TEST_VITE_PORT: String(vitePort) });
      const ready = await vite.ready;
      url = 'http://127.0.0.1:' + ready.port;
    }
  } catch (error) {
    await stop(vite); await stop(backend); throw error;
  }

  async function restartBackend({ freshRecording = false } = {}) {
    await stop(backend);
    if (freshRecording) dataFile = path.join(directory, 'recording.json');
    backend = launch(['server/index.js'], { PORT: String(backendPort), STUDENT_DATA_FILE: dataFile });
    await backend.ready; // Cùng file khi restart; chỉ recording dùng file MỚI.
  }

  return {
    url, backendUrl: 'http://127.0.0.1:' + backendPort, directory,
    get dataFile() { return dataFile; },
    restartBackend,
    readData: async () => JSON.parse(await fs.readFile(dataFile, 'utf8')),
    close: async () => { await stop(vite); await stop(backend); },
  };
}
