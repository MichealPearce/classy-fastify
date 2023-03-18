import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: '@michealpearce/classy-fastify',
			fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs'),
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: ['fastify', 'path', '@michealpearce/utils'],
		},
	},
})
