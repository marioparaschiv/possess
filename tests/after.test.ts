import { describe, expect, it } from 'bun:test';

import { after } from '../src';


describe('after patches', () => {
	it('should modify the result through the return value of the patch callback', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = after(exampleModule, 'exampleFunction', () => {
			return 'Overriden';
		});

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Overriden');

		unpatch();
	});

	it('should modify the result through context', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = after(exampleModule, 'exampleFunction', (ctx) => {
			ctx.result = 'Overriden';
		});

		result = exampleModule.exampleFunction('Jeff');

		expect(result).toBe('Overriden');

		unpatch();
	});
});
