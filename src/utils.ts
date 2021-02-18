import { parse, resolve } from 'path';
import minimatch from 'minimatch';
import { ResolvedConfig } from 'vite';
import { ImageInfo, Options } from './types';
import { defaultOptions } from './constants';

export interface ResolveImage { 
  filename: string
  namespace?: string
}

export function pascalCase(str: string) {
  const camel = camelCase(str);
  return camel[0].toUpperCase() + camel.slice(1);
}

export function camelCase(str: string) {
  return str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

export function parseId(id: string) {
  const index = id.indexOf('?');
  if(index < 0) {
    return { path: id, query: {} };
  } else {
    // @ts-ignore
    const query = Object.fromEntries(new URLSearchParams(id.slice(index)));
    return {
      path: id.slice(0, index),
      query,
    };
  }
}

export function isEmpty(value: any) {
  return (!value || value === null || value === undefined || (Array.isArray(value) && Object.keys(value).length <= 0));
}

export function matchGlobs(filepath: string, globs: string[]) {
  for(const glob of globs) {
    if(minimatch(filepath, glob)) {
      return true;
    }
  }
  return false;
}

export function stringifyImageImport({ name, path }: ImageInfo) {
  return `import ${name} from '${path}'`;
}

export function resolveOptions(options: Options, viteConfig: ResolvedConfig): Options {
  const resolvedOptions = Object.assign({}, defaultOptions, options) as Options;
  resolvedOptions.customResolvers = resolvedOptions.customResolvers || [];
  options.dirs = (options.dirs || []).map(d => resolve(viteConfig.root, d));

  return resolvedOptions;
}

export function getNameFromFilePath(filePath: string, options: Options): string {
  const parsedFilePath = parse(filePath);

  let strippedPath = '';

  // remove include directories from filepath
  for(const dir of (options.dirs || [])) {
    if(parsedFilePath.dir.startsWith(dir)) {
      strippedPath = parsedFilePath.dir.slice(dir.length);
      break;
    }
  }

  const folders = strippedPath.slice(1).split('/').filter(Boolean);
  let filename = parsedFilePath.name;

  if(filename.toLowerCase() === 'index') {
    filename = '';
  }

  if(!isEmpty(folders)) {
    // add folders to filename
    filename = [...folders, filename].filter(Boolean).join('-');
  }

  return filename;
}

export function resolveAlias(filepath: string, alias: ResolvedConfig['resolve']['alias'] = []) {
  const result = filepath;
  if(Array.isArray(alias)) {
    for(const { find, replacement } of alias) {
      result.replace(find, replacement);
    }
  }
  return result;
}
