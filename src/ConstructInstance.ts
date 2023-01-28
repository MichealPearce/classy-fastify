import { ConstructContainer } from './ConstructContainer'
import { ClassType } from './types'

export abstract class ConstructInstance {
	static instance<T extends ConstructInstance>(
		this: ConstructInstanceClass<T>,
		container: ConstructContainer = new ConstructContainer(),
	): T {
		return new this(container)
	}

	constructor(protected container: ConstructContainer) {}
}

export type ConstructInstanceClass<I extends ConstructInstance> = ClassType<
	I,
	ConstructorParameters<typeof ConstructInstance>,
	typeof ConstructInstance
>
