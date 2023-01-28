import { ConstructHook } from './ConstructHook'

const hook = new ConstructHook<{
	test(name: string, age: number): string
}>()

hook.on('test', event => {
	const [name, age] = event.params
	event.result = `${name} is ${age} years old`
})

hook.on('test', event => {
	const [name, age] = event.params
	event.result = `${name} is ${age} years old the fucker`
	event.stop()
})

hook.on(
	'test',
	event => {
		console.log('test after stop')
	},
	9,
)

console.log(hook.trigger('test', 'Jimmy', 10))
