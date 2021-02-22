import type { Plugin } from 'vite';
import { Options, Transformer } from './types';
import { Context } from './context';
import { parseId } from './utils';
import { makeTransform } from './transform';

function VitePluginImages(options: Options = {}): Plugin {
  let ctx: Context;
  let transformer: Transformer;

  return {
    name: 'vite-plugin-vue-images',
    enforce: 'post',
    configResolved(config) {
      ctx = new Context(options, config);
      transformer = makeTransform(ctx);
    },
    configureServer(server) {
      ctx.setServer(server);
    },
    transform(code, id) {
      const { path, query } = parseId(id);
      return transformer(code, id, path, query);
    },
  }
}

export * from './types';
export { camelCase, pascalCase } from './utils';
export default VitePluginImages;
