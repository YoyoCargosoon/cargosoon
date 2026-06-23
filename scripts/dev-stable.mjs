import { spawn } from 'node:child_process'
import { freePort } from './dev-utils.mjs'

await freePort(5173)

const child = spawn('npm run dev', {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
