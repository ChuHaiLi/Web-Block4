import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const url = process.env.TEST_URL || 'http://127.0.0.1:5173';
const output = new URL('../docs/evidence/', import.meta.url);
const temp = new URL('../.tools/videos/', import.meta.url);
await fs.mkdir(output, { recursive: true });
await fs.mkdir(temp, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--remote-debugging-port=9337', '--remote-debugging-address=127.0.0.1', '--remote-allow-origins=devtools://devtools'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const toolsContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
// Chỉ tạo khoảng dừng để người xem quan sát thao tác thật trong recording.
const pause = () => page.waitForTimeout(1200);
const screenshot = (target, name) => target.screenshot({ path: fileURLToPath(new URL(name, output)) });
let report;
try {
  await page.goto(url);
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 40);
  await pause();
  const targets = await (await fetch('http://127.0.0.1:9337/json/list')).json();
  const target = targets.find((target) => target.url === url + '/' || target.url === url);
  assert.ok(target);
  const devtools = await toolsContext.newPage();
  await devtools.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9337/devtools/page/' + target.id);
  await devtools.getByRole('button', { name: 'Toggle screencast', exact: true }).click();
  await devtools.getByRole('tab', { name: 'Network', exact: true }).click();
  await devtools.getByRole('checkbox', { name: 'Keep log', exact: true }).check();
  await devtools.getByRole('checkbox', { name: 'Disable cache', exact: true }).check();
  await devtools.getByRole('option', { name: 'Doc', exact: true }).click();
  await devtools.getByRole('button', { name: 'Clear network log - Ctrl + L', exact: true }).click();
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 40);
  const docRows = devtools.getByRole('row').filter({ hasText: 'document' });
  await docRows.first().waitFor();
  assert.equal(await docRows.count(), 1);
  const before = { studentCount: await page.locator('tbody tr').count(), docCount: await docRows.count(), timeOrigin: await page.evaluate(() => performance.timeOrigin) };
  await screenshot(devtools, 'devtools-doc-before.png');
  await fs.writeFile(new URL('devtools-doc-before.txt', output), await devtools.locator('body').ariaSnapshot());
  await pause();
  await page.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
  await page.getByLabel('Họ và tên').pressSequentially('Nguyễn Minh Anh CSR', { delay: 65 });
  await page.getByLabel('Email', { exact: false }).pressSequentially('csr.demo@example.com', { delay: 65 });
  await page.getByLabel('Lớp sinh hoạt', { exact: false }).selectOption('24C11');
  await pause();
  await screenshot(page, 'recording-form-filled.png');
  await page.locator('.create-form button[type="submit"]').click();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 41);
  await pause();
  await screenshot(page, 'recording-student-added.png');
  const after = { studentCount: await page.locator('tbody tr').count(), docCount: await docRows.count(), timeOrigin: await page.evaluate(() => performance.timeOrigin), lastRow: await page.locator('tbody tr').last().innerText() };
  assert.equal(after.docCount, before.docCount);
  assert.equal(after.timeOrigin, before.timeOrigin);
  await screenshot(devtools, 'devtools-doc-after.png');
  await fs.writeFile(new URL('devtools-doc-after.txt', output), await devtools.locator('body').ariaSnapshot());
  await page.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
  const reset = await page.locator('.create-form').evaluate((form) => Object.fromEntries(new FormData(form)));
  assert.deepEqual(reset, { name: '', email: '', className: '' });
  await screenshot(page, 'recording-form-reset.png');
  await pause();
  await page.keyboard.press('Escape');
  await page.locator('tbody tr').last().scrollIntoViewIfNeeded();
  await pause();
  report = { recordedAt: new Date().toISOString(), source: 'Live Google Chrome, Playwright video; actual Chrome DevTools frontend, Network/Doc', browser: await browser.version(), url, keepLog: true, disableCache: true, before, after, reset, checks: { newStudentImmediately: after.studentCount === 41, noNewDocumentRequest: after.docCount === before.docCount, sameDocument: after.timeOrigin === before.timeOrigin, formReset: true }, status: 'PASS' };
} finally {
  await toolsContext.close();
  await context.close();
  // Browser đóng sau khi quay phiên riêng, tránh screencast DevTools ảnh hưởng video.

}
const recordingContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, recordVideo: { dir: fileURLToPath(temp), size: { width: 1440, height: 1000 } } });
const recordingPage = await recordingContext.newPage();
const video = recordingPage.video();
try {
  await recordingPage.goto(url);
  await recordingPage.waitForFunction(() => document.querySelectorAll('tbody tr').length === 40);
  const beforeTimeOrigin = await recordingPage.evaluate(() => performance.timeOrigin);
  await recordingPage.waitForTimeout(1800);
  await recordingPage.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
  await recordingPage.getByLabel('Họ và tên').pressSequentially('Nguyễn Minh Anh CSR', { delay: 80 });
  await recordingPage.getByLabel('Email', { exact: false }).pressSequentially('csr.demo@example.com', { delay: 80 });
  await recordingPage.getByLabel('Lớp sinh hoạt', { exact: false }).selectOption('24C11');
  await recordingPage.waitForTimeout(1500);
  await recordingPage.locator('.create-form button[type="submit"]').click();
  await recordingPage.waitForFunction(() => document.querySelectorAll('tbody tr').length === 41);
  await recordingPage.waitForTimeout(2200);
  await recordingPage.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
  const reset = await recordingPage.locator('.create-form').evaluate((form) => Object.fromEntries(new FormData(form)));
  assert.deepEqual(reset, { name: '', email: '', className: '' });
  assert.equal(await recordingPage.evaluate(() => performance.timeOrigin), beforeTimeOrigin);
  await recordingPage.waitForTimeout(2200);
  await recordingPage.keyboard.press('Escape');
  await recordingPage.locator('tbody tr').last().scrollIntoViewIfNeeded();
  await recordingPage.waitForTimeout(1200);
  report.recordingSession = { studentsBefore: 40, studentsAfter: await recordingPage.locator('tbody tr').count(), sameDocument: true, reset, edited: false };
} finally {
  await recordingContext.close();
  await video.saveAs(fileURLToPath(new URL('add-student.webm', output)));
  await browser.close();
}
await fs.writeFile(new URL('recording-and-devtools-results.json', output), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
