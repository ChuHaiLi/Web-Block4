import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import seed from '../src/data/students.seed.json' with { type: 'json' };
import majors from '../src/data/majors.json' with { type: 'json' };
import { startFixture } from './fixture.mjs';

const mode = process.argv[2] || 'dev';
const fixture = await startFixture(mode);
const url = fixture.url;
const output = new URL('../docs/evidence/json-persistence/' + mode + '/', import.meta.url);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const requests = [];
const errors = [];
const expectedConsoleErrors = [];
let faultPhase = "";
const checks = [];
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
const network = [];
cdp.on('Network.requestWillBeSent', (event) => network.push({ type: event.type, url: event.request.url, method: event.request.method }));
page.on('request', (request) => requests.push({ type: request.resourceType(), url: request.url(), method: request.method() }));
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() !== 'error') return;
  if (faultPhase && /Failed to load resource.*500/.test(message.text())) expectedConsoleErrors.push({ phase: faultPhase, message: message.text() });
  else errors.push(message.text());
});
const rows = page.locator('tbody tr');
const open = () => page.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
const submit = () => page.locator('.create-form button[type="submit"]').click();
const fill = async (name, email, className) => {
  await page.getByLabel('Họ và tên').fill(name);
  await page.getByLabel('Email', { exact: false }).fill(email);
  await page.getByLabel('Lớp sinh hoạt', { exact: false }).selectOption(className);
};
const formValues = () => page.locator('.create-form').evaluate((form) => Object.fromEntries(new FormData(form)));
const snapshot = () => rows.evaluateAll((elements) => elements.map((row) => [...row.cells].slice(0, 5).map((cell) => cell.textContent.trim())));
const check = (name) => checks.push({ name, status: 'PASS' });

try {
  const response = await page.goto(url);
  await rows.last().waitFor();
  assert.equal(await rows.count(), 40);
  const original = await snapshot();
  const expected = seed.map((student) => [student.id, student.name, student.email, student.className, majors.find((major) => major.code === student.major).name]);
  assert.deepEqual(original, expected);
  assert.equal((await (await context.request.get(url)).text()).includes(seed[0].name), false);
  await page.screenshot({ path: new URL('desktop-before.png', output).pathname.replace(/^\/([A-Z]:)/, '$1'), fullPage: true });
  check('40 seed records đúng dữ liệu/thứ tự; HTTP trả HTML shell');

  await open();
  assert.equal(await page.locator('.create-actions .cancel-button').evaluateAll((controls) => controls.filter((control) => control.getClientRects().length > 0).length), 1);
  await submit();
  assert.match(await page.getByRole('alert').innerText(), /Họ và tên/);
  assert.equal(await rows.count(), 40);
  await fill('Giữ dữ liệu nhập', 'email-sai', '24C11');
  await submit();
  assert.match(await page.getByRole('alert').innerText(), /email hợp lệ/);
  assert.deepEqual(await formValues(), { name: 'Giữ dữ liệu nhập', email: 'email-sai', className: '24C11' });
  check('Validation giữ dữ liệu khi lỗi và không thêm hồ sơ');

  await fill('Giữ form khi lưu lỗi', 'failed.save@example.com', '24C11');
  faultPhase = 'POST 500 được tiêm để kiểm tra lỗi';
  await page.route('**/api/students', (route) => route.request().method() === 'POST'
    ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Không thể lưu trong bài test.' }) })
    : route.continue());
  await submit();
  await page.getByRole('alert').filter({ hasText: 'Không thể lưu trong bài test.' }).waitFor();
  assert.equal(await rows.count(), 40);
  assert.deepEqual(await formValues(), { name: 'Giữ form khi lưu lỗi', email: 'failed.save@example.com', className: '24C11' });
  assert.equal((await fixture.readData()).students.length, 40);
  await page.unroute('**/api/students');
  faultPhase = '';
  check('API POST thất bại (tiêm 500): giữ form/danh sách/JSON, không giả thành công');


  await fill('Nguyễn Minh Anh CSR', 'csr.demo@example.com', '24C11');
  const before = { requests: [...requests], network: [...network], values: await formValues() };
  const navigationBefore = await page.evaluate(() => performance.timeOrigin);
  const requestCountBefore = requests.length;
  const documentCountBefore = network.filter((request) => request.type === 'Document').length;

  let releasePost;
  let reachedPost;
  const pendingPost = new Promise((resolve) => { releasePost = resolve; });
  const postReached = new Promise((resolve) => { reachedPost = resolve; });
  let interceptedPosts = 0;
  await page.route('**/api/students', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    interceptedPosts++;
    reachedPost();
    await pendingPost;
    await route.continue(); // POST thật đến Express, chỉ trì hoãn để kiểm tra trạng thái pending.
  });
  await submit();
  await postReached;
  assert.equal(await rows.count(), 40);
  assert.equal((await fixture.readData()).students.length, 40);
  assert.equal(await page.locator('.create-form button[type="submit"]').isDisabled(), true);
  await page.locator('.create-form').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  releasePost();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 41);
  assert.equal(interceptedPosts, 1);
  await page.unroute('**/api/students');
  assert.equal((await fixture.readData()).students.length, 41);
  check('Pending POST chưa cập nhật State/JSON; double-submit chỉ gửi một request thật');
  assert.deepEqual((await snapshot()).at(-1), ['02410011', 'Nguyễn Minh Anh CSR', 'csr.demo@example.com', '24C11', 'Công nghệ thông tin']);
  assert.equal(await page.evaluate(() => performance.timeOrigin), navigationBefore);
  assert.equal(network.filter((request) => request.type === 'Document').length, documentCountBefore);
  assert.equal(requests.slice(requestCountBefore).filter((request) => request.type === 'document').length, 0);
  assert.equal(requests.slice(requestCountBefore).filter((request) => ['fetch', 'xhr'].includes(request.type) && request.method === 'POST' && request.url.endsWith('/api/students')).length, 1);
  assert.deepEqual(await formValues(), { name: '', email: '', className: '' });
  assert.deepEqual((await snapshot()).slice(0, 40), original);
  const after = { requests: [...requests], network: [...network], values: await formValues(), newStudent: (await snapshot()).at(-1) };
  await fs.writeFile(new URL('network-before-after.json', output), JSON.stringify({ browser: await browser.version(), url, before, after, documentCountBefore, documentCountAfter: network.filter((request) => request.type === 'Document').length, submitRequests: requests.slice(requestCountBefore), unchangedTimeOrigin: true }, null, 2));
  await page.screenshot({ path: new URL('desktop-after-submit.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
  check('Submit thêm ngay, nối cuối, không mutate 40 hồ sơ cũ');
  check('CDP Document count không tăng; Fetch POST JSON được phép; timeOrigin giữ nguyên');
  await open();
  await page.screenshot({ path: new URL('form-reset.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
  assert.deepEqual(await formValues(), { name: '', email: '', className: '' });
  check('Controlled inputs reset cả ba trường; mở lại thấy form trống');

  await fill('Trùng email', 'CSR.DEMO@EXAMPLE.COM', '24C11');
  await submit();
  assert.match(await page.getByRole('alert').innerText(), /đã được sử dụng/);
  assert.equal(await rows.count(), 41);
  assert.equal((await formValues()).name, 'Trùng email');
  check('Email trùng bị từ chối, giữ inputs để sửa');
  await fill('Sinh viên CSR thứ hai', 'csr.second@example.com', '24CNTT1');
  await page.getByLabel('Email', { exact: false }).press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 42);
  assert.equal((await snapshot()).at(-1)[0], '02410012');
  await open();
  await fill('Sinh viên khóa 25', 'csr.cohort25@example.com', '25KHDL1');
  await submit();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 43);
  assert.equal((await snapshot()).at(-1)[0], '02500011');
  assert.equal(new Set((await snapshot()).map((record) => record[0])).size, 43);
  check('Submit bằng Enter, thêm liên tiếp, ID duy nhất và đúng thứ tự/khóa');
  const requestDelete = (id) => rows.filter({ has: page.locator('th', { hasText: id }) }).getByRole('button', { name: /^Xóa sinh viên/ }).click();
  const confirmDelete = () => page.getByRole('dialog').getByRole('button', { name: 'Xác nhận xóa', exact: true }).click();
  const beforeDelete = await snapshot();
  const deleteRequestsStart = requests.length;
  const deleteDocumentBefore = network.filter((request) => request.type === 'Document').length;
  const deleteTimeOrigin = await page.evaluate(() => performance.timeOrigin);
  await requestDelete(seed[0].id);
  const dialog = page.getByRole('dialog', { name: 'Xác nhận xóa sinh viên' });
  assert.equal(await dialog.isVisible(), true);
  assert.deepEqual(await dialog.locator('dd').allTextContents(), expected[0]);
  assert.match(await dialog.innerText(), /không thể hoàn tác/);
  assert.equal(await dialog.getByRole('button', { name: 'Hủy', exact: true }).evaluate((button) => button === document.activeElement), true);
  assert.deepEqual(await snapshot(), beforeDelete);
  await dialog.getByRole('button', { name: 'Hủy', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.deepEqual(await snapshot(), beforeDelete);
  await requestDelete(seed[0].id);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.deepEqual(await snapshot(), beforeDelete);
  check('Delete: đúng hồ sơ xác nhận; mở/Hủy/Escape đều giữ nguyên danh sách');

  await requestDelete('02410010'); // MSSV seed cao nhất của khóa 24.
  await page.screenshot({ path: new URL('delete-confirmation.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });

  faultPhase = 'DELETE 500 được tiêm để kiểm tra lỗi';
  await page.route('**/api/students/*', (route) => route.fulfill({
    status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Không thể xóa trong bài test.' }),
  }));
  await confirmDelete();
  await page.getByRole('dialog').getByRole('alert').waitFor();
  assert.deepEqual(await snapshot(), beforeDelete);
  assert.equal((await fixture.readData()).students.length, 43);
  assert.equal(await page.getByRole('dialog').isVisible(), true);
  await page.unroute('**/api/students/*');
  faultPhase = '';
  check('API DELETE thất bại (tiêm 500): giữ dòng/JSON/dialog, có lỗi và thử lại được');
  await confirmDelete();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 42);
  const afterDelete = await snapshot();
  assert.deepEqual(afterDelete, beforeDelete.filter((record) => record[0] !== '02410010'));
  assert.equal(await page.locator('.student-total strong').innerText(), '42');
  assert.equal(await page.locator('.count-badge').innerText(), '42 hồ sơ');
  assert.match(await page.getByRole('status').innerText(), /Đã xóa sinh viên thành công/);
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.evaluate(() => performance.timeOrigin), deleteTimeOrigin);
  assert.equal(network.filter((request) => request.type === 'Document').length, deleteDocumentBefore);
  assert.equal(requests.slice(deleteRequestsStart).filter((request) => request.type === 'document').length, 0);
  await page.screenshot({ path: new URL('delete-after-confirm.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
  await fs.writeFile(new URL('delete-network-before-after.json', output), JSON.stringify({ url, browser: await browser.version(), before: { rows: beforeDelete.length, docCount: deleteDocumentBefore, timeOrigin: deleteTimeOrigin }, after: { rows: afterDelete.length, docCount: network.filter((request) => request.type === 'Document').length, timeOrigin: await page.evaluate(() => performance.timeOrigin) }, deletedId: '02410010', requests: requests.slice(deleteRequestsStart), preservedOtherRecordsAndOrder: true }, null, 2));
  check('Delete: chỉ xóa hồ sơ đã xác nhận, cập nhật số lượng; giữ hồ sơ/thứ tự còn lại');
  check('Delete: Fetch DELETE lưu JSON, không Document mới, cùng timeOrigin');

  await requestDelete('02410012'); // Xóa hồ sơ mới nhất rồi dùng lại email đã giải phóng.
  await confirmDelete();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 41);
  await open();
  await fill('Thêm lại sau khi xóa', 'csr.second@example.com', '24CNTT1');
  await submit();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 42);
  assert.equal((await snapshot()).at(-1)[0], '02410013');
  assert.deepEqual(await formValues(), { name: '', email: '', className: '' });
  assert.match(await page.getByRole('status').innerText(), /Đã thêm sinh viên thành công/);
  check('Delete + Add: email đã xóa dùng lại được; không tái cấp MSSV mới nhất; form vẫn reset');

  for (const record of await snapshot()) {
    const remainingCount = (await rows.count()) - 1;
    await requestDelete(record[0]);
    await confirmDelete();
    await page.waitForFunction((count) => document.querySelectorAll("tbody tr").length === count, remainingCount);
  }
  assert.equal(await rows.count(), 0);
  assert.equal(await page.getByRole('heading', { name: 'Chưa có sinh viên' }).isVisible(), true);
  assert.equal(await page.locator('.student-total strong').innerText(), '0');
  await page.screenshot({ path: new URL('delete-empty-state.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
  await open();
  await fill('Sinh viên sau danh sách trống', seed[0].email, '24C11');
  await submit();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
  assert.equal((await snapshot())[0][0], '02410014');
  assert.equal(await page.getByRole('heading', { name: 'Chưa có sinh viên' }).count(), 0);
  assert.deepEqual(await formValues(), { name: '', email: '', className: '' });
  assert.equal(await page.evaluate(() => performance.timeOrigin), deleteTimeOrigin);
  assert.equal(network.filter((request) => request.type === 'Document').length, deleteDocumentBefore);
  assert.equal(requests.slice(deleteRequestsStart).filter((request) => request.type === 'document').length, 0);
  check('Delete hết: empty state, Add vẫn hoạt động và không tái cấp mã seed/đã xóa');

  const savedBeforeRefresh = await snapshot();
  const dataBeforeRefresh = await fixture.readData();
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
  assert.deepEqual(await snapshot(), savedBeforeRefresh);
  assert.deepEqual(await fixture.readData(), dataBeforeRefresh);
  check('F5 chủ động tải lại đúng JSON sau Add/Delete, không quay về seed');
  await fixture.restartBackend();
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
  assert.deepEqual(await snapshot(), savedBeforeRefresh);
  assert.deepEqual(await fixture.readData(), dataBeforeRefresh);
  check('Restart tiến trình Express rồi F5 vẫn giữ danh sách/counter đã lưu');
  const mobileStudentId = savedBeforeRefresh[0][0];


  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 640 });
    await page.screenshot({ path: new URL('mobile-'+width+'.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('.table-scroll').evaluate((table) => table.scrollWidth > table.clientWidth), true);
    await open();
    assert.equal(await page.locator('.create-actions .cancel-button').evaluateAll((controls) => controls.filter((control) => control.getClientRects().length > 0).length), 1);
    const bounds = await page.locator('#create-student').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
    assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= (width === 390 ? 844 : 640));
    await page.screenshot({ path: new URL('mobile-form-'+width+'.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#create-student').isVisible(), false);
    await requestDelete(mobileStudentId);
    const deleteBounds = await page.getByRole('dialog').boundingBox();
    assert.ok(deleteBounds.x >= 0 && deleteBounds.x + deleteBounds.width <= width);
    assert.ok(deleteBounds.y >= 0 && deleteBounds.y + deleteBounds.height <= (width === 390 ? 844 : 640));
    await page.screenshot({ path: new URL('mobile-delete-'+width+'.png', output).pathname.replace(/^\/([A-Z]:)/, '$1') });
    await page.getByRole('dialog').getByRole('button', { name: 'Hủy', exact: true }).click();
    assert.equal(await rows.count(), 1);
    assert.equal(await page.getByRole('dialog').count(), 0);
    check('Mobile Delete '+width+'px: dialog trong viewport, cuộn được, Hủy giữ danh sách');
    check('Mobile '+width+'px: không tràn trang, bảng cuộn ngang, popup trong viewport, Esc đóng');
  }

  faultPhase = 'GET 500 được tiêm để kiểm tra loading/error';
  const errorContext = await browser.newContext();
  const errorPage = await errorContext.newPage();
  errorPage.on('pageerror', (error) => errors.push(error.message));
  errorPage.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (faultPhase && /Failed to load resource.*500/.test(message.text())) expectedConsoleErrors.push({ phase: faultPhase, message: message.text() });
    else errors.push(message.text());
  });
  await errorPage.route('**/api/students', (route) => route.fulfill({
    status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Không tải được dữ liệu thử nghiệm.' }),
  }));
  await errorPage.goto(url);
  await errorPage.getByRole('alert').waitFor();
  assert.equal(await errorPage.locator('tbody tr').count(), 0);
  assert.equal(await errorPage.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).count(), 0);
  assert.equal(await errorPage.getByText('Chưa có sinh viên', { exact: true }).count(), 0);
  await errorPage.unroute('**/api/students');
  await errorPage.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await errorPage.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
  await errorContext.close();
  faultPhase = '';
  check('GET thất bại: báo lỗi, không giả seed/empty list; Thử lại tải đúng JSON');
  assert.deepEqual(errors, []);
  check('Không có pageerror/console.error bất ngờ; lỗi 500 tiêm có ghi riêng');
  const report = { testedAt: new Date().toISOString(), url, browser: 'Google Chrome '+await browser.version(), viewport: '1440×1000; 390×844; 320×640', mode, dataFile: fixture.dataFile, checks, errors, expectedConsoleErrors, status: 'PASS' };
  await fs.writeFile(new URL('browser-results.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await fs.writeFile(new URL('browser-results.json', output), JSON.stringify({ status: 'FAIL', checks, errors, failure: error.stack }, null, 2));
  throw error;
} finally {
  await context.close();
  await browser.close();
  await fixture.close();
}
