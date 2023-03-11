import { ClassType, Rollable } from '@michealpearce/utils'
import {
	FastifyRequest,
	FastifyReply,
	FastifyInstance,
	FastifyPluginOptions,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
} from 'fastify'
import { Endpoint } from './classes'

export type MiddlewareDefinition = (
	request: FastifyRequest,
	reply: FastifyReply,
) => Rollable

export type PluginDefinition<
	Instance extends FastifyInstance,
	Options extends FastifyPluginOptions,
> = (instance: Instance, options: Options) => Rollable

export interface EndpointDefinition {
	body?: unknown
	query?: unknown
	params?: unknown
	headers?: unknown
}

export type EndpointDefToGeneric<Def extends EndpointDefinition> = {
	Body: Def['body']
	Querystring: Def['query']
	Params: Def['params']
	Headers: Def['headers']
}

export type EndpointRequest<Def extends EndpointDefinition> = FastifyRequest<
	EndpointDefToGeneric<Def>
>
export type EndpointReply<Def extends EndpointDefinition> = FastifyReply<
	RawServerDefault,
	RawRequestDefaultExpression,
	RawReplyDefaultExpression,
	EndpointDefToGeneric<Def>
>

export type EndpointClass<EP extends Endpoint = Endpoint> = ClassType<
	EP,
	ConstructorParameters<typeof Endpoint>,
	typeof Endpoint
>
