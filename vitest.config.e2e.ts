import { resolve } from 'path'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '.env.test') })

export default defineConfig({
	test: {
		include: ['**/*.e2e-spec.ts'],
		globals: true,
		root: './',
		setupFiles: ['./src/test/setup-e2e.ts'],
		testTimeout: 100000,
		hookTimeout: 100000,
		sequence: {
			concurrent: false,
		},
	},
	plugins: [
		swc.vite({
			module: { type: 'es6' },
		}),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
})
