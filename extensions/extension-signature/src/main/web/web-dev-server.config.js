import {legacyPlugin} from '@web/dev-server-legacy';
import proxy from 'koa-proxies';

const mode = process.env.MODE || 'dev';
if (!['dev', 'prod'].includes(mode)) {
  throw new Error(`MODE must be "dev" or "prod", was "${mode}"`);
}

export default {
  nodeResolve: {exportConditions: mode === 'dev' ? ['development'] : []},
  preserveSymlinks: true,
  plugins: [
    legacyPlugin({
      polyfills: {
        // Manually imported in index.html file
        webcomponents: false,
      },
    }),
  ],
  middleware: [
    proxy('/realms/master/signature-extension', {
      target: 'http://localhost:8080',
      changeOrigin: true,
      logs: true,
    }),
  ],
};
