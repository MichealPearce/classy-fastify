import {
	assign,
	defaults,
	FunctionType,
	isFunction,
	noop,
	Rollable,
} from '@michealpearce/utils'
import {
	FastifyInstance,
	FastifyPluginAsync,
	FastifyPluginCallback,
	FastifyPluginOptions,
	HTTPMethods,
} from 'fastify'
import { join } from 'path'
import { isPromise } from 'util/types'
import { MiddlewareDefinition, PluginDefinition, EndpointClass } from './types'

export function defineMiddleware(handler: MiddlewareDefinition) {
	return function handle(req: any, res: any) {
		const result = handler(req, res)

		if (isPromise(result)) return result.then(noop)
		return Promise.resolve()
	}
}

export function definePlugin<
	Options extends FastifyPluginOptions,
	Instance extends FastifyInstance = FastifyInstance,
>(
	def: PluginDefinition<Instance, Options>,
	options: { name?: string; global?: boolean } = {},
) {
	const opts = defaults(options, {
		name: def.name,
		global: false,
	})

	function register(this: any, instance: Instance, options: Options) {
		const result = def.call(this, instance, options)

		if (isPromise(result)) return result
		return Promise.resolve()
	}

	register[Symbol.for('skip-override')] = opts.global
	register[Symbol.for('plugin-meta')] = opts
	register[Symbol.for('fastify.display-name')] = opts.name

	return register
}

export function usePlugin<Options extends FastifyPluginOptions>(
	plugin: FastifyPluginAsync<Options> | FastifyPluginCallback<Options>,
	options: Options = {} as any,
) {
	function register(this: any, ...args: any[]) {
		const opts = args[1] ? { ...args[1], ...options } : options

		if (args[1]?.prefix && options.prefix)
			opts.prefix = join(args[1].prefix, options.prefix)

		return plugin(args[0], opts, args[2]!)
	}

	const meta = plugin[Symbol.for('plugin-meta')] ?? {
		name: plugin.name,
	}

	register[Symbol.for('plugin-meta')] = meta
	register[Symbol.for('skip-override')] = plugin[Symbol.for('skip-override')]
	register[Symbol.for('fastify.display-name')] =
		plugin[Symbol.for('fastify.display-name')]

	return register
}

export function defineRoute(
	path: string,
	onRegister?: (instance: FastifyInstance) => Rollable,
) {
	const endpoints = new Set<EndpointClass>()
	const middlewares = new Set<FunctionType>()
	const plugins = new Set<FunctionType>()

	function endpoint(method: HTTPMethods, subPath?: string) {
		return function decorateEndpoint(Target: any) {
			Target.method = method
			Target.url = subPath ? join(path, subPath) : path
			Target.handler = async function (request: any, reply: any) {
				const endpoint = new Target(this, request, reply)

				for (const middleware of middlewares)
					await middleware.call(this, request, reply)

				if (isFunction(endpoint.middleware)) await endpoint.middleware()

				return endpoint.handle()
			}

			endpoints.add(Target)
		}
	}

	const register = definePlugin(
		async instance => {
			for (const plugin of plugins)
				await instance.register(plugin, {
					prefix: path,
				})

			if (onRegister) await onRegister(instance)

			for (const Endpoint of endpoints) {
				if (Endpoint.register) await Endpoint.register(instance)

				instance.log.info(`Registering ${Endpoint.method} ${Endpoint.url}`)
				instance.route(Endpoint)
			}
		},
		{
			name: `route [${path}]`,
		},
	)

	return assign(register, {
		endpoint,
		middleware: middlewares,
		plugins,
	})
}
