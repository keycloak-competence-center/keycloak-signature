import proxy from 'koa-proxies';
import {esbuildPlugin} from '@web/dev-server-esbuild';

const mode = process.env.MODE || 'dev';
if (!['dev', 'prod'].includes(mode)) {
  throw new Error(`MODE must be "dev" or "prod", was "${mode}"`);
}

export default {
  nodeResolve: {exportConditions: mode === 'dev' ? ['development'] : []},
  preserveSymlinks: true,
  plugins: [esbuildPlugin({ts: true, target: 'ES2020'})],
  middleware: [
    proxy('/realms/master/signature-extension', {
      target: 'http://localhost:8080',
      changeOrigin: true,
      logs: true,
    }),
  ],
};
