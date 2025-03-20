import { describe, expect, it } from 'bun:test';

import { instead } from '../src';


describe('instead patches', () => {
	it('should modify the result through the return value of the patch callback', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = instead(exampleModule, 'exampleFunction', (ctx) => {
			return `Overriden ${ctx.args[0]}`;
		});

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Overriden Bob');

		unpatch();
	});

	it('should call the original function and return its result', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = instead(exampleModule, 'exampleFunction', (ctx) => {
			return ctx.original(...ctx.args);
		});

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		unpatch();
	});

	it('should call the original function with modified arguments and return its result', () => {
		let result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Bob!');

		const unpatch = instead(exampleModule, 'exampleFunction', (ctx) => {
			return ctx.original(`Changed ${ctx.args.at(0)}`);
		});

		result = exampleModule.exampleFunction('Bob');

		expect(result).toBe('Hello Changed Bob!');

		unpatch();
	});
});
