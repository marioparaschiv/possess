import { describe, expect, it } from 'bun:test';

import { after, before, createPatcher, type AnyFunction } from "../src";


describe('unpatches', () => {
	it('should unpatch all patches by a caller', () => {
		const patcher = createPatcher('example-caller');

		patcher.before(exampleModule, 'exampleFunction', (ctx) => (ctx.args[0] = `Modified ${ctx.args[0]}`));
		patcher.after(exampleModule, 'exampleFunction', (ctx) => ctx.result = ctx.result.slice(0, ctx.result.length - 1));

		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Modified Bob');

		patcher.unpatchAll();

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');
	});

	it('should remove a singular patch', () => {
		const patcher = createPatcher('example-caller');

		const unpatch = patcher.before(exampleModule, 'exampleFunction', (ctx) => (ctx.args[0] = `Modified ${ctx.args[0]}`));
		patcher.after(exampleModule, 'exampleFunction', (ctx) => ctx.result = ctx.result.slice(0, ctx.result.length - 1));

		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Modified Bob');

		unpatch();

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob');
	});

	it('should remove multiple patches', () => {
		const unpatches: AnyFunction[] = [];

		unpatches.push(before(exampleModule, 'exampleFunction', (ctx) => ['Jeff']));
		unpatches.push(after(exampleModule, 'exampleFunction', (ctx) => ctx.result + '!'));

		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Jeff!!');

		unpatches.map(u => u());

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');
	});
});