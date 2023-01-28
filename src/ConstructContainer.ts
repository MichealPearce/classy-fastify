import { ConstructContext } from './ConstructContext'
import { ConstructInstance, ConstructInstanceClass } from './ConstructInstance'

export class ConstructContainer {
	public readonly dependants = new Map<
		ConstructInstanceClass<any>,
		ConstructInstance
	>()

	constructor(public readonly context = new ConstructContext()) {}

	derive() {
		return new ConstructContainer(this.context)
	}

	instance<I extends ConstructInstance>(
		InstanceClass: ConstructInstanceClass<I>,
	): I {
		if (this.dependants.has(InstanceClass))
			return this.dependants.get(InstanceClass) as I

		if (this.context.instances.has(InstanceClass)) {
			const instance = this.context.instances.get(InstanceClass) as I

			this.dependants.set(InstanceClass, instance)
			return instance
		}

		const instance = InstanceClass.instance(this.derive())

		this.dependants.set(InstanceClass, instance)
		this.context.instances.set(InstanceClass, instance)

		if (
			InstanceClass.name in instance &&
			typeof instance[InstanceClass.name] === 'function'
		)
			instance[InstanceClass.name]()

		return instance
	}
}
