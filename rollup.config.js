import typescript from 'rollup-plugin-typescript2'

export default {
	external: ['chalk', 'lodash', 'xlsx'],
	input: './src/main.ts',
	output: {
		dir: 'dist',
		format: 'cjs'
	},
	plugins: [typescript()]
}
