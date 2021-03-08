import * as core from '@actions/core'
import * as io from '@actions/io'
import * as toolCache from '@actions/tool-cache'
import nodeChildProcess from 'child_process'
import nodeFs from 'fs'
import nodeOS from 'os'
import nodePath from 'path'
import { v4 as uuid } from 'uuid'

export interface Toolchain {
  GOPATH: string
  GOBIN: string
  go: string
  tempPath: string
}

export async function setupToolchain(): Promise<Toolchain> {
  const goVersion = core.getInput('go-version')
  const os = getOs()
  const arch = getArch()
  const ext = getExt(arch)

  return core.group(`Setting up Go ${goVersion} Toolchain`, async () => {
    const downloadUrl = `https://storage.googleapis.com/golang/go${goVersion}.${os}-${arch}.${ext}`
    core.info(`Downloading package from "${downloadUrl}"...`)
    const downloadPath = await toolCache.downloadTool(downloadUrl)

    core.info('Extracting package...')
    const extractFunc = arch === 'windows' ? toolCache.extractZip : toolCache.extractTar
    const installPath = await extractFunc(downloadPath)

    core.info('Finalizing setup...')
    core.exportVariable('GOROOT', nodePath.join(installPath, 'go'))
    core.exportVariable('GO111MODULE', 'on')
    core.addPath(nodePath.join(installPath, 'go', 'bin'))

    core.info('Adding $GOPATH/bin to $PATH...')
    const GOPATH = (nodeChildProcess.execSync('go env GOPATH') || '').toString().trim()
    const GOBIN = nodePath.join(GOPATH, 'bin')
    if (GOPATH) {
      if (!nodeFs.existsSync(GOBIN)) {
        await io.mkdirP(GOBIN)
      }
      core.addPath(GOBIN)
    }

    core.info('Preparing for tools...')
    const tempPath = nodePath.join(process.env.RUNNER_TEMP!, uuid())
    await io.mkdirP(tempPath)
    const go = await io.which('go')
    nodeChildProcess.execSync(`${go} mod init tools`, { cwd: tempPath })

    return {
      GOPATH,
      GOBIN,
      go,
      tempPath,
    }
  })
}

export async function validateToolchain(toolchain: Toolchain): Promise<void> {
  await core.group(`Validating Go Toolchain`, async () => {
    core.info((nodeChildProcess.execSync(`${toolchain.go} version`) || '').toString().trim())
    core.info((nodeChildProcess.execSync(`${toolchain.go} env`) || '').toString().trim())
  })
}

function getOs(): string {
  const os = nodeOS.platform()
  return os === 'win32' ? 'windows' : os
}

function getArch(): string {
  const arch = nodeOS.arch()
  return arch === 'x64' ? 'amd64' : arch === 'x32' ? '386' : arch
}

function getExt(arch: string): string {
  return arch === 'windows' ? 'zip' : 'tar.gz'
}
