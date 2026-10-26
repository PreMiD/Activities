import type { ActivityTester } from '../ActivityTester.js'
import process from 'node:process'
import readline from 'node:readline'
import chalk from 'chalk'
import { printSummary } from './reporter.js'

export interface DevTestLoopDeps {
  service: string
  send: () => Promise<void>
  tester: Pick<ActivityTester, 'run' | 'isSupported'>
  hasTests: () => Promise<boolean>
  log: (line: string) => void
  debounceMs?: number
}

const UNSUPPORTED = `Your extension doesn't support tests yet, or developer mode is off`

// Runs the activity tests after every build. Only the newest run reports, and a run
// that a newer build cancels prints nothing.
export class DevTestLoop {
  private readonly debounceMs: number
  private timer: ReturnType<typeof setTimeout> | undefined
  private generation = 0
  private chain: Promise<void> = Promise.resolve()
  private controller: AbortController | undefined
  private supported = false
  private unsupportedLogged = false
  private isPaused = false

  constructor(private readonly deps: DevTestLoopDeps) {
    this.debounceMs = deps.debounceMs ?? 300
  }

  get paused(): boolean {
    return this.isPaused
  }

  onBuild(): void {
    if (this.isPaused)
      return

    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.timer = undefined
      if (!this.isPaused)
        this.execute(false)
    }, this.debounceMs)
  }

  runNow(): void {
    clearTimeout(this.timer)
    this.timer = undefined
    this.execute(true)
  }

  togglePause(): void {
    this.isPaused = !this.isPaused
    if (this.isPaused) {
      this.controller?.abort()
      this.deps.log('PAUSED, press p to resume')
      return
    }

    this.deps.log('Resumed')
    this.onBuild()
  }

  private execute(interactive: boolean): void {
    const generation = ++this.generation
    this.controller?.abort()
    this.chain = this.chain.then(() => this.cycle(generation, interactive))
  }

  private async cycle(generation: number, interactive: boolean): Promise<void> {
    // Debounced builds stay silent while paused. A manual run (`t`) still goes ahead.
    const skip = () => generation !== this.generation || (!interactive && this.isPaused)
    if (skip())
      return

    let controller: AbortController | undefined
    try {
      await this.deps.send()
      if (skip())
        return
      if (!(await this.checkSupported()))
        return
      if (!(await this.deps.hasTests()))
        return
      if (skip())
        return

      controller = new AbortController()
      this.controller = controller
      const results = await this.deps.tester.run({ signal: controller.signal, interactive })
      if (controller.signal.aborted)
        return

      printSummary(results, this.deps.log)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.deps.log(chalk.red(`✗ ${this.deps.service}: ${message}`))
    }
    finally {
      if (controller && this.controller === controller)
        this.controller = undefined
    }
  }

  // Only a supported result is cached, so an extension that connects later is picked up.
  private async checkSupported(): Promise<boolean> {
    if (this.supported)
      return true

    this.supported = await this.deps.tester.isSupported()
    if (!this.supported && !this.unsupportedLogged) {
      this.unsupportedLogged = true
      this.deps.log(chalk.yellow(UNSUPPORTED))
    }
    return this.supported
  }
}

// Keys only work in a terminal. `p` pauses or resumes, `t` runs the tests now, Ctrl+C exits.
export function listenForKeys(loop: Pick<DevTestLoop, 'togglePause' | 'runNow'>): void {
  if (!process.stdin.isTTY)
    return

  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.on('keypress', (_input, key) => {
    if (key?.ctrl && key.name === 'c')
      process.exit(0)
    if (key?.ctrl)
      return
    if (key?.name === 'p')
      loop.togglePause()
    if (key?.name === 't')
      loop.runNow()
  })
}
