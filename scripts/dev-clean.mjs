import { execSync, spawn } from 'node:child_process'

const DEV_PORT = 5173

const killPortOnWindows = (port) => {
  try {
    execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force }"`,
      {
        stdio: ['ignore', 'ignore', 'ignore'],
      },
    )
  } catch {
    // Ignore cleanup errors and let strictPort give the final signal if the port stays occupied.
  }
}

if (process.platform === 'win32') {
  killPortOnWindows(DEV_PORT)
}

const command = process.platform === 'win32' ? 'npm run dev' : 'npm run dev'

const child = spawn(command, {
  stdio: 'inherit',
  env: { ...process.env },
  shell: true,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
