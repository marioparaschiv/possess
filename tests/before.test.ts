import { describe, expect, it } from 'bun:test';

import { before } from '../src';


describe('before patches', () => {
	it('should modify arguments through context', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = before(exampleModule, 'exampleFunction', (ctx) => {
			ctx.args[0] = 'Jeff';
		});

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Jeff!');

		unpatch();
	});

	it('should modify arguments through the return value of the patch callback', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = before(exampleModule, 'exampleFunction', () => {
			return ['Jeff'];
		});

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Jeff!');

		unpatch();
	});
});
