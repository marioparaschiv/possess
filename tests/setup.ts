import { beforeEach } from 'bun:test';


class ExampleClass {
	public example: boolean;

	constructor(example) {
		this.example = example;
	}

	isExample() {
		return this.example;
	}
};

declare global {
	var exampleModule: {
		exampleFunction: (name: string) => string;
		exampleClass: typeof ExampleClass;
	};
}

beforeEach(() => {
	const module = {
		exampleFunction: (name: string) => `Hello ${name}!`,
		exampleClass: ExampleClass
	};

	global.exampleModule = module;
});