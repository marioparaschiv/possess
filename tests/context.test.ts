import { describe, expect, it } from 'bun:test';

import { after, before } from '../src';


describe('context', () => {
	it('should maintain the correct context inside a patch', () => {
		let res;

		const unpatch = before(exampleModule, 'exampleFunction', (ctx) => {
			res = ctx.this;
		});

		exampleModule.exampleFunction.call('custom context', 'Bob');
		expect(res).toBe('custom context');

		unpatch();
	});

	it('should maintain the correct arguments inside a patch', () => {
		let res;

		const unpatch = before(exampleModule, 'exampleFunction', (ctx) => {
			res = ctx.args;
		});

		exampleModule.exampleFunction('Bob');
		expect(res).toEqual(['Bob']);

		unpatch();
	});

	it('should maintain the correct result inside a patch', () => {
		let res;

		const unpatch = after(exampleModule, 'exampleFunction', (ctx) => {
			res = ctx.result;
		});

		exampleModule.exampleFunction('Bob');
		expect(res).toBe('Hello Bob!');

		unpatch();
	});
});