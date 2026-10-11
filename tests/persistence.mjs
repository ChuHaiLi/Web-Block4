import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import seed from '../src/data/students.seed.json' with { type: 'json' };
import { startFixture } from './fixture.mjs';

const output = new URL('../docs/evidence/json-persistence/e2e/', import.meta.url);
await fs.mkdir(output, { recursive: true });
const fixture = await startFixture('production');
const launch = () => chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
let browser;
let page;
const checks = [];
const errors = [];
const network = [];
const check = (name) => checks.push({ name, status: 'PASS' });
const openPage = async () => {
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('request', (request) => network.push({ type: request.resourceType(), method: request.method(), url: request.url() }));
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(fixture.url);
};
const docs = () => network.filter((request) => request.type === 'document').length;
const count = (length) => page.waitForFunction((length) => document.querySelectorAll('tbody tr').length === length, length);
const screenshot = (name) => page.screenshot({ path: fileURLToPath(new URL(name, output)) });
const state = {};
try {
  await openPage();
  await count(40);
  assert.deepEqual((await fixture.readData()).students, seed);
  check('Mở frontend production CSR: 40 seed từ API/JSON');
  await page.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
  await page.getByLabel('Họ và tên').fill('Nguyễn Minh Anh Persistence');
  await page.getByLabel('Email', { exact: false }).fill('persistence.e2e@example.com');
  await page.getByLabel('Lớp sinh hoạt', { exact: false }).selectOption('24C11');
  const beforeAdd = { docCount: docs(), timeOrigin: await page.evaluate(() => performance.timeOrigin) };
  await page.locator('.create-form button[type="submit"]').click();
  await count(41);
  const afterAdd = await fixture.readData();
  const student = afterAdd.students.at(-1);
  assert.equal(student.id, '02410011');
  assert.equal(student.email, 'persistence.e2e@example.com');
  assert.deepEqual(afterAdd.students.slice(0, 40), seed);
  assert.equal(await page.locator('tbody tr').last().getByText(student.id, { exact: true }).count(), 1);
  check('Add sinh viên 41: UI và JSON cùng hồ sơ; 40 seed được giữ nguyên');
  state.add = { before: beforeAdd, after: { docCount: docs(), timeOrigin: await page.evaluate(() => performance.timeOrigin), students: 41, student } };
  assert.equal(state.add.after.docCount, beforeAdd.docCount);
  assert.equal(state.add.after.timeOrigin, beforeAdd.timeOrigin);
  check('Fetch POST không tạo Document navigation');
  assert.deepEqual(await page.locator('.create-form').evaluate((form) => Object.fromEntries(new FormData(form))), { name: '', email: '', className: '' });
  check('Controlled inputs reset sau phản hồi lưu thành công');

  await page.reload(); // F5 có chủ đích, ngoài khoảng đo submit.
  await count(41);
  assert.deepEqual(await fixture.readData(), afterAdd);
  assert.equal(await page.locator('tbody tr').last().getByText(student.id, { exact: true }).count(), 1);
  await page.locator('tbody tr').last().scrollIntoViewIfNeeded();
  await screenshot('after-add-f5.png');
  check('F5 sau Add vẫn có sinh viên 41; JSON không đổi');

  await browser.close(); // Đóng hẳn Chrome, khởi động tiến trình mới.
  await openPage();
  await count(41);
  assert.equal(await page.locator('tbody tr').last().getByText(student.id, { exact: true }).count(), 1);
  check('Đóng/mở lại tiến trình Chrome vẫn đọc đúng 41 sinh viên');
  const beforeDelete = { docCount: docs(), timeOrigin: await page.evaluate(() => performance.timeOrigin) };
  await page.locator('tbody tr').last().getByRole('button', { name: /^Xóa sinh viên/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận xóa', exact: true }).click();
  await count(40);
  const afterDelete = await fixture.readData();
  assert.deepEqual(afterDelete.students, seed);
  assert.equal(afterDelete.counters['024'], 10011);
  state.delete = { before: beforeDelete, after: { docCount: docs(), timeOrigin: await page.evaluate(() => performance.timeOrigin), students: 40 } };
  assert.equal(state.delete.after.docCount, beforeDelete.docCount);
  assert.equal(state.delete.after.timeOrigin, beforeDelete.timeOrigin);
  check('Delete lưu JSON và xóa UI, không Document navigation');
  await page.reload();
  await count(40);
  assert.equal(await page.getByRole('cell', { name: student.email, exact: true }).count(), 0);
  assert.deepEqual(await fixture.readData(), afterDelete);
  await screenshot('after-delete-f5.png');
  check('F5 sau Delete không làm sinh viên đã xóa xuất hiện lại');

  await fixture.restartBackend();
  await page.reload();
  await count(40);
  assert.deepEqual(await fixture.readData(), afterDelete);
  await screenshot('after-backend-restart.png');
  check('Restart tiến trình Express rồi F5 vẫn giữ dữ liệu/counter đã lưu');
  assert.deepEqual(errors, []);
  check('Không có pageerror hoặc console.error trong E2E thật');

  const report = {
    testedAt: new Date().toISOString(), url: fixture.url, browser: await browser.version(), dataFile: fixture.dataFile,
    checks, network, measuredSubmitWindows: state, errors,
    runtimeAfterAdd: { students: afterAdd.students.length, lastStudent: student, sha256: createHash('sha256').update(JSON.stringify(afterAdd)).digest('hex') },
    runtimeAfterDeleteAndRestart: { students: afterDelete.students.length, counters: afterDelete.counters, sha256: createHash('sha256').update(JSON.stringify(afterDelete)).digest('hex') },
    actualBrowserProcessRestarted: true, actualBackendProcessRestarted: true, realUserRuntimeUsed: false, status: 'PASS',
  };
  await fs.writeFile(new URL('results.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await fs.writeFile(new URL('results.json', output), JSON.stringify({ status: 'FAIL', checks, errors, failure: error.stack }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  await fixture.close();
}
