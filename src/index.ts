import * as core from '@actions/core'
import { setupToolchain, validateToolchain } from './toolchain'
import { installTools, validateTools } from './tools'

async function run(): Promise<void> {
  try {
    const toolchain = await setupToolchain()
    await validateToolchain(toolchain)
    await installTools(toolchain)
    await validateTools(toolchain)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
