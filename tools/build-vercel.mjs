import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
const nxPackagePath = require.resolve('nx/package.json');
const nxCli = resolve(dirname(nxPackagePath), require(nxPackagePath).bin.nx);
const outputDirectory = resolve(workspaceRoot, 'dist/vercel');
const remoteNames = ['adminDashboard', 'roseApp'];

// Build the host first: its dependency builds must not overwrite remote base URLs.
for (const name of ['shell', ...remoteNames]) {
  const baseHref = name === 'shell' ? '/' : `/remotes/${name}/`;
  const result = spawnSync(
    process.execPath,
    [
      nxCli,
      'build',
      name,
      '--configuration=production',
      `--baseHref=${baseHref}`,
    ],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: { ...process.env, NX_DAEMON: 'false' },
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (relative(workspaceRoot, outputDirectory) !== join('dist', 'vercel')) {
  throw new Error('Deployment output must stay within dist/vercel.');
}
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(join(workspaceRoot, 'dist/apps/shell'), outputDirectory, {
  recursive: true,
});

const remotes = {};
for (const name of remoteNames) {
  await cp(
    join(workspaceRoot, 'dist/apps', name),
    join(outputDirectory, 'remotes', name),
    { recursive: true },
  );
  remotes[name] = `/remotes/${name}/mf-manifest.json`;
}
await writeFile(
  join(outputDirectory, 'module-federation.manifest.json'),
  JSON.stringify(remotes, null, 2) + '\n',
);
console.log(`Vercel deployment ready: ${outputDirectory}`);
