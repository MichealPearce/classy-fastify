import { FunctionType } from '@michealpearce/utils'
import {
	HTTPMethods,
	FastifySchema,
	FastifySchemaCompiler,
	LogLevel,
	FastifyContext,
	FastifyInstance,
	FastifyError,
	FastifyRequest,
	FastifyReply,
	onRequestHookHandler,
	preParsingHookHandler,
	preValidationHookHandler,
	preHandlerHookHandler,
	preSerializationHookHandler,
	onSendHookHandler,
	onResponseHookHandler,
	onErrorHookHandler,
	onTimeoutHookHandler,
} from 'fastify'
import {
	FastifySerializerCompiler,
	FastifySchemaValidationError,
} from 'fastify/types/schema'
import { EndpointDefinition, EndpointRequest, EndpointReply } from './types'

abstract class StaticEndpoint {
	declare static method: HTTPMethods
	declare static url: string
	declare static handler: FunctionType

	declare static schema?: FastifySchema // originally FastifySchema
	declare static attachValidation?: boolean
	declare static exposeHeadRoute?: boolean

	declare static validatorCompiler?: FastifySchemaCompiler<FastifySchema>
	declare static serializerCompiler?: FastifySerializerCompiler<FastifySchema>
	declare static bodyLimit?: number
	declare static logLevel?: LogLevel
	declare static config?: FastifyContext<any>['config']
	declare static version?: string
	declare static constraints?: { [name: string]: any }
	declare static prefixTrailingSlash?: 'slash' | 'no-slash' | 'both'
	declare static errorHandler?: (
		this: FastifyInstance,
		error: FastifyError,
		request: FastifyRequest,
		reply: FastifyReply,
	) => void

	declare static schemaErrorFormatter?: (
		errors: FastifySchemaValidationError[],
		dataVar: string,
	) => Error

	declare static onRequest?: onRequestHookHandler | onRequestHookHandler[]
	declare static preParsing?: preParsingHookHandler | preParsingHookHandler[]
	declare static preValidation?:
		| preValidationHookHandler
		| preValidationHookHandler[]
	declare static preHandler?: preHandlerHookHandler | preHandlerHookHandler[]
	declare static preSerialization?:
		| preSerializationHookHandler<any>
		| preSerializationHookHandler<any>[]
	declare static onSend?: onSendHookHandler<any> | onSendHookHandler<any>[]
	declare static onResponse?: onResponseHookHandler | onResponseHookHandler[]
	declare static onError?: onErrorHookHandler | onErrorHookHandler[]
	declare static onTimeout?: onTimeoutHookHandler | onTimeoutHookHandler[]

	static register?(instance: FastifyInstance): void
}

export abstract class Endpoint<
	Def extends EndpointDefinition = EndpointDefinition,
> extends StaticEndpoint {
	get params() {
		return this.request.params
	}

	get query() {
		return this.request.query
	}

	get body() {
		return this.request.body
	}

	get headers() {
		return this.request.headers
	}

	get console() {
		return this.request.log
	}

	constructor(
		protected readonly instance: FastifyInstance,
		protected readonly request: EndpointRequest<Def>,
		protected readonly reply: EndpointReply<Def>,
	) {
		super()
	}

	middleware?(): void | Promise<void>

	abstract handle(): any
}
