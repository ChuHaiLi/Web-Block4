import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { startFixture } from './fixture.mjs';

const fixture = await startFixture('dev');
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const session = await page.context().newCDPSession(page);
  const scripts = [];
  session.on('Debugger.scriptParsed', (script) => scripts.push(script));
  await session.send('Debugger.enable');
  await page.goto(fixture.url);
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 40);
  const script = scripts.find((item) => item.url.includes('/src/App.jsx'));
  assert.ok(script);
  const { scriptSource } = await session.send('Debugger.getScriptSource', { scriptId: script.scriptId });
  const lineNumber = scriptSource.split('\n').findIndex((line) => line.includes('const pendingStudent ='));
  assert.ok(lineNumber >= 0);
  const trace = [];
  const errors = [];
  session.on('Debugger.paused', async ({ callFrames }) => {
    try {
      const frame = callFrames.find((frame) => frame.functionName === 'App');
      assert.ok(frame);
      const result = await session.send('Debugger.evaluateOnCallFrame', {
        callFrameId: frame.callFrameId,
        expression: "JSON.stringify({owner:'App',count:students.length,ids:students.map(s=>s.id)})",
        returnByValue: true,
      });
      assert.ok(!result.exceptionDetails);
      trace.push(JSON.parse(result.result.value));
    } catch (error) { errors.push(error.message); }
    finally { await session.send('Debugger.resume'); }
  });
  await session.send('Debugger.setBreakpoint', { location: { scriptId: script.scriptId, lineNumber } });
  await page.locator('tbody tr').first().getByRole('button').click();
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await page.getByRole('button', { name: '+ Thêm sinh viên', exact: true }).click();
  await page.getByLabel('Họ và tên').fill('Quan sát React State');
  await page.getByLabel('Email', { exact: false }).fill('state.observe@example.com');
  await page.getByLabel('Lớp sinh hoạt', { exact: false }).selectOption('24C11');
  await page.locator('.create-form button[type=submit]').click();
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 41);
  assert.deepEqual(errors, []);
  assert.ok(trace.some((item) => item.count === 40));
  assert.ok(trace.some((item) => item.count === 41));
  const report = { status: 'PASS', source: 'Chrome CDP Debugger, evaluated actual App call-frame students variable', browser: await browser.version(), url: fixture.url, dataFile: fixture.dataFile, breakpointGeneratedLine: lineNumber + 1, trace, errors };
  await fs.writeFile(new URL('../docs/evidence/json-persistence/react-state-log.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, counts: trace.map((item) => item.count) }));
} finally {
  await browser?.close();
  await fixture.close();
}
