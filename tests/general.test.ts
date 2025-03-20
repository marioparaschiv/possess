import { describe, expect, it } from 'bun:test';

import { after, before, instead, type AnyFunction } from '../src';


describe('general functionality', () => {
	it('should run all patches in the correct order', () => {
		const order: string[] = [];

		const unpatches: AnyFunction[] = [];

		unpatches.push(before(exampleModule, 'exampleFunction', (ctx) => {
			order.push('before');
			return ctx.original(...ctx.args);
		}));

		unpatches.push(instead(exampleModule, 'exampleFunction', (ctx) => {
			order.push('instead');
			return ctx.original(...ctx.args);
		}));

		unpatches.push(after(exampleModule, 'exampleFunction', (ctx) => {
			order.push('after');
			return ctx.original(...ctx.args);
		}));

		exampleModule.exampleFunction('Bob');

		expect(order).toEqual(['before', 'instead', 'after']);

		unpatches.map(unpatch => unpatch());
	});
});
