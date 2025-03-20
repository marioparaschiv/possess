import { beforeEach } from 'bun:test';


declare global {
	var exampleModule: {
		exampleFunction: (name: string) => string;
	};
}

beforeEach(() => {
	const module = {
		exampleFunction: (name: string) => `Hello ${name}!`
	};

	global.exampleModule = module;
});