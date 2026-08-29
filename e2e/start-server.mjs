/* global process, URL */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const server = spawn(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)),
    '--host',
    '127.0.0.1',
    '--port',
    '4173',
    '--strictPort',
  ],
  {
    env: {
      ...process.env,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? 'https://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY:
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_e2e',
    },
    stdio: 'inherit',
  },
)

const stopServer = () => {
  if (!server.killed) {
    server.kill('SIGTERM')
  }
}

process.on('SIGINT', stopServer)
process.on('SIGTERM', stopServer)
process.on('exit', stopServer)

server.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
