import { ConstructInstance, ConstructInstanceClass } from './ConstructInstance'

export class ConstructContext {
	constructor(
		public readonly instances = new WeakMap<
			ConstructInstanceClass<any>,
			ConstructInstance
		>(),
	) {}
}
