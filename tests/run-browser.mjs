import { spawnSync } from 'node:child_process';
for (const mode of ['dev', 'production']) {
  const result = spawnSync(process.execPath, ['tests/browser.mjs', mode], { stdio: 'inherit', windowsHide: true });
  if (result.status !== 0) process.exit(result.status || 1);
}
