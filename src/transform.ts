import Debug from 'debug';
import { Transformer } from './types';
import { Context } from './context';
import { pascalCase, stringifyImageImport } from './utils';

const debug = Debug('vite-plugin-vue-images:transform');

export function makeTransform(ctx: Context): Transformer {
  return (code, id, path, query) => {
    if(!path.endsWith('.vue')) {
      return code;
    }

    ctx.searchGlob();

    const sfcPath = ctx.normalizePath(path);
    debug(sfcPath);

    const head: string[] = [];
    let no = 0;
    const imagePaths: string[] = [];

    let transformed = code.replace(/_createVNode\("img", { src: _ctx\.(.+?) }/g, (str, match) => {
      if(match && !match.startsWith('_')) {
        debug(`| ${match}`);
        const name = pascalCase(match);
        imagePaths.push(name);
        const image = ctx.findImage(name, [sfcPath]);
        if(image) {
          const varName = `__vite_images_${no}`;
          head.push(stringifyImageImport({ ...image, name: varName }));
          no += 1;
          return `_createVNode\("img", { src: ${varName} }`;
        }
      }
      return str;
    })

    debug(`^ (${no})`);

    ctx.updateUsageMap(sfcPath, imagePaths);

    transformed = `${head.join('\n')}\n${transformed}`;

    return transformed;
  }
}
