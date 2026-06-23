import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const runWindowsCommand = async (command) => {
  return execFileAsync('powershell.exe', ['-NoProfile', '-Command', command], {
    windowsHide: true,
  })
}

export const isWindows = process.platform === 'win32'

export const freePort = async (port) => {
  if (!isWindows) {
    return
  }

  let stdout = ''
  try {
    const result = await runWindowsCommand(
      `netstat -ano -p tcp | Select-String ':${port}\\s' | ForEach-Object { ($_ -split '\\s+')[-1] }`,
    )
    stdout = result.stdout
  } catch (error) {
    console.warn(`[dev] Unable to auto-release port ${port}: ${error.message}`)
    return
  }

  const pids = [...new Set(stdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))]
  for (const pid of pids) {
    if (pid !== '0') {
      try {
        await runWindowsCommand(`taskkill /PID ${pid} /F | Out-Null`)
      } catch (error) {
        console.warn(`[dev] Unable to stop PID ${pid}: ${error.message}`)
      }
    }
  }
}

export const killViteProcesses = async () => {
  if (!isWindows) {
    return
  }

  const script = [
    "$targets = Get-CimInstance Win32_Process | Where-Object {",
    "  $_.Name -eq 'node.exe' -and ($_.CommandLine -match 'vite' -or $_.CommandLine -match 'npm run dev')",
    '};',
    "foreach ($proc in $targets) { Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue }",
  ].join(' ')

  try {
    await runWindowsCommand(script)
  } catch (error) {
    console.warn(`[dev] Unable to stop existing Vite processes: ${error.message}`)
  }
}
