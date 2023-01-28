import { FunctionType } from './types'

export type Hookables = {
	[key: string]: FunctionType
}

type HookMap = Map<any, Map<number, Set<FunctionType>>>

export class HookEvent<Hook extends FunctionType> {
	#stopped = false

	get stopped() {
		return this.#stopped
	}

	constructor(
		public name: any,
		public params: Parameters<Hook>,
		public result: ReturnType<Hook> | undefined = undefined,
	) {}

	stop() {
		this.#stopped = true
	}
}

export type HookHandler<Hook extends FunctionType> = (
	event: HookEvent<Hook>,
) => ReturnType<Hook> extends Promise<any> ? Promise<void> | void : void

export class ConstructHook<Hooks extends Hookables> {
	constructor(protected readonly hooks: HookMap = new Map()) {}

	on<Hook extends keyof Hooks>(
		hook: Hook,
		handler: HookHandler<Hooks[Hook]>,
		level = 10,
	) {
		if (!this.hooks.has(hook)) this.hooks.set(hook, new Map())

		const handlers = this.hooks.get(hook)!

		if (!handlers.has(level)) handlers.set(level, new Set())

		const levelSet = handlers.get(level)!

		levelSet.add(handler)
		return () => levelSet.delete(handler)
	}

	trigger<Hook extends keyof Hooks>(
		hook: Hook,
		...params: Parameters<Hooks[Hook]>
	): ReturnType<Hooks[Hook]> | undefined {
		const event = new HookEvent<Hooks[Hook]>(hook, params)

		const listeners = this.hooks.get(hook)
		if (!listeners) throw new Error(`No listeners for hook ${String(hook)}`)

		const levels = Array.from(listeners.entries()).sort(([a], [b]) => a - b)

		let rolling: any
		for (const [, levelSet] of levels) {
			for (const handler of levelSet) {
				if (event.stopped) break

				const call = () => handler(event)

				if (rolling instanceof Promise) rolling = rolling.then(call)
				else rolling = call()
			}
		}

		if (rolling instanceof Promise)
			return rolling.then(() => event.result) as any
		else return event.result as any
	}
}
