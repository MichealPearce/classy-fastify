export type ClassType<
	I extends object,
	P extends any[] = any[],
	S extends object = object,
> = {
	[Prop in keyof S]: S[Prop]
} & (new (...args: P) => I)

export type FunctionType<P extends any[] = any[], R = any, T = any> = (
	this: T,
	...args: P
) => R

export type ObjectMethodNames<Obj extends object> = {
	[Key in keyof Obj]: Obj[Key] extends FunctionType ? Key : never
}[keyof Obj]

export type ObjectMethods<Obj extends object> = {
	[Key in ObjectMethodNames<Obj>]: Obj[Key]
}
