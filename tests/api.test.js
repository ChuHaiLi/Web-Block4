import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { once } from 'node:events';
import seed from '../src/data/students.seed.json' with { type: 'json' };
import { createStudentStore, resolveDataFile, defaultDataFile } from '../server/store.js';
import { createApp } from '../server/app.js';
import { startFixture, testDirectory } from './fixture.mjs';

const values = { name: 'Nguyễn Minh Anh API', email: 'api.demo@example.com', className: '24C11' };

async function environment(t, options = {}) {
  const directory = await testDirectory('api');
  const file = path.join(directory, 'students.json');
  const store = createStudentStore({ file, ...options });
  await store.initialize();
  const server = createApp(store).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = 'http://127.0.0.1:' + server.address().port;
  const request = async (method = 'GET', route = '/api/students', data) => {
    const response = await fetch(url + route, {
      method, headers: { 'Content-Type': 'application/json' },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    return { status: response.status, body: await response.json(), headers: response.headers };
  };
  return { store, file, request, url };
}

test('GET trả đủ 40 seed; initialize lại không ghi đè runtime', async (t) => {
  const { file, request } = await environment(t);
  const before = await fs.readFile(file, 'utf8');
  const modified = (await fs.stat(file)).mtimeMs;
  const result = await request();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, seed);
  assert.equal(result.headers.get('content-type').includes('application/json'), true);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  await createStudentStore({ file }).initialize();
  assert.equal(await fs.readFile(file, 'utf8'), before);
  assert.equal((await fs.stat(file)).mtimeMs, modified);
});

test('POST trả 201 chỉ sau khi hồ sơ và counter đã nằm trong JSON', async (t) => {
  const { file, request } = await environment(t);
  const result = await request('POST', '/api/students', values);
  assert.equal(result.status, 201);
  assert.equal(result.body.id, '02410011');
  const saved = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.equal(saved.students.length, 41);
  assert.deepEqual(saved.students.at(-1), result.body);
  assert.equal(saved.counters['024'], 10011);
  assert.deepEqual((await request()).body, saved.students);
});

test('POST từ chối kiểu sai, đầu vào sai, ID/path tự truyền và JSON malformed', async (t) => {
  const { file, request, url } = await environment(t);
  const before = await fs.readFile(file, 'utf8');
  for (const input of [null, [], {}, { ...values, name: 123 }, { ...values, name: '  ' },
    { ...values, email: 'sai' }, { ...values, className: 'unknown' },
    { ...values, id: '02410011' }, { ...values, file: '../../Block3/data/students.json' }]) {
    assert.equal((await request('POST', '/api/students', input)).status, 400);
  }
  const malformed = await fetch(url + '/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal(typeof (await malformed.json()).error, 'string');
  assert.equal(await fs.readFile(file, 'utf8'), before);
});

test('Email trùng và POST đồng thời cùng email chỉ tạo một hồ sơ', async (t) => {
  const { request } = await environment(t);
  const responses = await Promise.all(Array.from({ length: 4 }, () => request('POST', '/api/students', values)));
  assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409, 409, 409]);
  assert.equal((await request()).body.length, 41);
  assert.equal((await request('POST', '/api/students', { ...values, email: ' API.DEMO@EXAMPLE.COM ' })).status, 409);
});

test('20 POST đồng thời không mất hồ sơ, ID không trùng; DELETE liên tiếp lưu đúng', async (t) => {
  const { file, request } = await environment(t);
  const responses = await Promise.all(Array.from({ length: 20 }, (_, i) =>
    request('POST', '/api/students', { ...values, email: 'parallel' + i + '@example.com' })));
  assert.ok(responses.every((response) => response.status === 201));
  assert.equal(new Set(responses.map((response) => response.body.id)).size, 20);
  assert.equal((await request()).body.length, 60);
  await Promise.all(responses.slice(0, 5).map((response) => request('DELETE', '/api/students/' + response.body.id)));
  const saved = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.equal(saved.students.length, 55);
  assert.equal(saved.counters['024'], 10030);
  assert.deepEqual((await request()).body, saved.students);
});

test('DELETE xóa đúng ID; không tồn tại trả 404 và không sửa file', async (t) => {
  const { file, request } = await environment(t);
  assert.equal((await request('DELETE', '/api/students/02410010')).status, 200);
  assert.deepEqual((await request()).body, seed.filter((student) => student.id !== '02410010'));
  const after = await fs.readFile(file, 'utf8');
  for (const id of ['02410010', '99999999', 'invalid']) assert.equal((await request('DELETE', '/api/students/' + id)).status, 404);
  assert.equal(await fs.readFile(file, 'utf8'), after);
  assert.equal((await request('POST', '/api/students', values)).body.id, '02410011');
});

test('Restart TIẾN TRÌNH Express giữ Add/Delete và bộ đếm MSSV', async () => {
  const fixture = await startFixture('api-restart');
  try {
    const response = await fetch(fixture.backendUrl + '/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const student = await response.json();
    assert.equal(response.status, 201);
    await fixture.restartBackend();
    assert.equal((await (await fetch(fixture.backendUrl + '/api/students')).json()).length, 41);
    assert.equal((await fetch(fixture.backendUrl + '/api/students/' + student.id, { method: 'DELETE' })).status, 200);
    const afterDelete = await fixture.readData();
    await fixture.restartBackend();
    assert.deepEqual(await fixture.readData(), afterDelete);
    const next = await fetch(fixture.backendUrl + '/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, email: 'restart@example.com' }) });
    assert.equal((await next.json()).id, '02410012');
  } finally { await fixture.close(); }
});

test('Runtime lỗi cú pháp/shape/ID/counter: dừng an toàn và giữ nguyên bytes', async () => {
  const directory = await testDirectory('invalid-json');
  const file = path.join(directory, 'students.json');
  const original = { version: 1, students: seed, counters: { '024': 10010, '025': 10, '026': 10 } };
  for (const content of ['{broken', '{}', JSON.stringify({ ...original, students: [...seed, seed[0]] }),
    JSON.stringify({ ...original, counters: { '024': 0, '025': 10, '026': 10 } })]) {
    await fs.writeFile(file, content);
    await assert.rejects(createStudentStore({ file }).initialize());
    assert.equal(await fs.readFile(file, 'utf8'), content);
  }
});

test('Lỗi rename được mô phỏng: API 500, hồ sơ/counter không mất; thử lại được', async (t) => {
  let fail = true;
  const io = { ...fs, rename: async (...args) => {
    if (fail) throw new Error('Injected write failure');
    return fs.rename(...args);
  } };
  const { file, request } = await environment(t, { fileSystem: io });
  const before = await fs.readFile(file, 'utf8');
  assert.equal((await request('POST', '/api/students', values)).status, 500);
  assert.equal(await fs.readFile(file, 'utf8'), before);
  assert.equal((await request('DELETE', '/api/students/02400001')).status, 500);
  assert.equal(await fs.readFile(file, 'utf8'), before);
  fail = false;
  assert.equal((await request('POST', '/api/students', values)).status, 201);
});

test('GET báo lỗi đọc JSON giữa phiên, không seed lại; phục hồi file thì GET lại được', async (t) => {
  const { file, request } = await environment(t);
  const before = await fs.readFile(file, 'utf8');
  await fs.writeFile(file, '{broken');
  assert.equal((await request()).status, 500);
  assert.equal(await fs.readFile(file, 'utf8'), '{broken');
  await fs.writeFile(file, before); // Chỉ phục hồi file TEST đã tạo ở trên.
  assert.deepEqual((await request()).body, seed);
});

test('Đường dẫn runtime ngoài thư mục quản lý/seed bị chặn trước ghi file', () => {
  for (const file of ['../Block3/data/students.json', 'src/data/students.seed.json', '../outside.json', '.git/config.json']) {
    assert.throws(() => resolveDataFile(file));
  }
});

test('Seed gốc và runtime thật không bị bộ test sửa; API không render EJS/HTML', async (t) => {
  const seedFile = new URL('../src/data/students.seed.json', import.meta.url);
  const beforeSeed = await fs.readFile(seedFile, 'utf8');
  const readRealRuntime = async () => {
    try { return { bytes: await fs.readFile(defaultDataFile, 'utf8'), mtimeMs: (await fs.stat(defaultDataFile)).mtimeMs }; }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
  const beforeRealRuntime = await readRealRuntime();
  const { request, url } = await environment(t);
  await request('POST', '/api/students', values);
  await request('DELETE', '/api/students/02400001');
  assert.equal(await fs.readFile(seedFile, 'utf8'), beforeSeed);
  assert.equal((await (await fetch(url + '/api/missing')).json()).error, 'API không tồn tại.');
  const html = await (await fetch(url + '/')).text();
  assert.equal(html.includes(seed[0].name), false);
  assert.deepEqual(await readRealRuntime(), beforeRealRuntime);
});
