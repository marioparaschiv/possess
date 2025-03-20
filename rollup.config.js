import swc from 'rollup-plugin-swc3';
import dts from 'rollup-plugin-dts';


const config = [
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.js',
			format: 'es'
		},
		plugins: [swc({ minify: true })]
	},
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.d.ts',
			format: 'es'
		},
		plugins: [dts()]
	}
];

export default config;