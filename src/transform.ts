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

    const sfcPath = ctx.resolvePathAlias(path);
    debug(sfcPath);

    const head: string[] = [];
    let no = 0;
    const imagePaths: string[] = [];

    // TODO -- decide whether to include specific cases, instead of replacing all _ctx vars
    // const props = ctx.props.join('|');
    // const regex = new RegExp(`{ (${props}): _ctx\.(.+?) }`, 'g');
    const regex = new RegExp(`_ctx\.${ctx.searchRegex}`, 'g');

    let transformed = code.replace(regex, (str, name) => {
      if(name && !name.startsWith('_')) {
        debug(`| ${name}`);
        const pascalName = pascalCase(name);
        imagePaths.push(pascalName);
        const image = ctx.findImage(pascalName, [sfcPath]);
        if(image) {
          const varName = `__vite_images_${no}`;
          head.push(stringifyImageImport({ ...image, name: varName }));
          no += 1;
          // return `\{ ${prop}: ${varName} }`;
          return varName;
        }
      }
      return str;
    });
    debug(`^ (${no})`);

    ctx.updateUsageMap(sfcPath, imagePaths);

    transformed = `${head.join('\n')}\n${transformed}`;

    return transformed;
  }
}
