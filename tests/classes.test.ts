import './setup';

import { describe, expect, it } from 'bun:test';

import { before, instead, after } from '../src';


describe('constructor patches', () => {
	it('should patch constructor before instantiation', () => {
		const unpatch = before(exampleModule, 'exampleClass', () => {
			return [false];
		});

		const instance = new exampleModule.exampleClass(true);
		expect(instance.example).toBe(false);

		unpatch();
	});

	it('should patch constructor with instead', () => {
		const unpatch = instead(exampleModule, 'exampleClass', (ctx) => {
			const instance = ctx.original(false);
			instance.example = !instance.example;
			return instance;
		});

		const instance = new exampleModule.exampleClass(true);
		expect(instance.example).toBe(true);

		unpatch();
	});

	it('should patch constructor after instantiation', () => {
		const unpatch = after(exampleModule, 'exampleClass', (ctx) => {
			const instance = ctx.result;
			instance.example = !instance.example;
			return instance;
		});

		const instance = new exampleModule.exampleClass(true);
		expect(instance.example).toBe(false);

		unpatch();
	});
});