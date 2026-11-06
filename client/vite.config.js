import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	server: {
		// Local dev without Docker: `npm run dev` here + `npm run dev` in the root.
		proxy: { '/v1': 'http://localhost:4000' },
	},
});
