import * as core from '@actions/core'
import * as io from '@actions/io'
import nodeFs from 'fs'
import nodeChildProcess from 'child_process'
import { Toolchain } from './toolchain'

export async function installTools(toolchain: Toolchain): Promise<void> {
  await core.group('Installing Tools', async () => {
    await installTool(toolchain, 'golang.org/x/lint/golint@latest')
  })
}

export async function validateTools(toolchain: Toolchain): Promise<void> {
  await core.group('Validating Tools', async () => {
    core.info(nodeFs.readdirSync(toolchain.GOBIN).join('\n'))
    await io.rmRF(toolchain.tempPath)
  })
}

async function installTool(toolchain: Toolchain, pkg: string): Promise<void> {
  core.info(pkg)
  nodeChildProcess.execSync(`${toolchain.go} get ${pkg}`, { cwd: toolchain.tempPath })
}
