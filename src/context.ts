import { relative } from 'path';
import Debug from 'debug';
import fg from 'fast-glob';
import { HmrContext, ResolvedConfig, UpdatePayload, ViteDevServer } from 'vite';
import { ImageInfo, Options } from './types';
import { pascalCase, getNameFromFilePath, resolveAlias, resolveOptions, matchGlobs } from './utils';

const debug = {
  images: Debug('vite-plugin-vue-images:context:images'),
  search: Debug('vite-plugin-vue-images:context:search'),
  hmr: Debug('vite-plugin-vue-images:context:hmr'),
}

export function searchImages(ctx: Context) {
  debug.search(`started with: [${ctx.globs.join(', ')}]`);
  const root = ctx.root;

  const files = fg.sync(ctx.globs, {
    ignore: ['node_modules'],
    onlyFiles: true,
    cwd: root,
  });

  if(!files.length && !ctx.options.customResolvers?.length) {
    console.warn('[vite-plugin-vue-images] no images found');
  }

  debug.search(`${files.length} images found.`);

  ctx.addImages(files);
}


export class Context {
  readonly options: Options
  readonly globs: string[]

  private _imagePaths = new Set<string>()
  private _imageNameMap: Record<string, ImageInfo> = {}
  private _imageUsageMap: Record<string, Set<string>> = {}
  private _server: ViteDevServer | undefined

  constructor(
    options: Options,
    public readonly viteConfig: ResolvedConfig,
  ) {
    this.options = resolveOptions(options, viteConfig)
    const { extensions, dirs } = this.options
    const exts = extensions || [];

    if(!exts.length) {
      throw new Error('[vite-plugin-vue-images] extensions are required to search for images');
    }

    const extsGlob = exts.length === 1 ? exts[0] : `{${exts.join(',')}}`

    this.globs = (dirs || []).map((d: string) =>
        `${d}/**/*.${extsGlob}`
    );

    if(viteConfig.command === 'serve') {
      /*
      chokidar.watch(dirs, { ignoreInitial: true })
        .on('unlink', (path) => {
          if(matchGlobs(path, this.globs)) {
            this.removeImages(path)
            this.onUpdate(path)
          }
        })
        .on('add', (path) => {
          if(matchGlobs(path, this.globs)) {
            this.addImages(path)
            this.onUpdate(path)
          }
        })
      */
    }
  }

  get root() {
    return this.viteConfig.root;
  }

  setServer(server: ViteDevServer) {
    this._server = server;
  }

  /**
   * Record the usage of images
   * @param path
   * @param paths paths of used images
   */
  updateUsageMap(path: string, paths: string[]) {
    if(!this._imageUsageMap[path]) {
      this._imageUsageMap[path] = new Set();
    }

    paths.forEach((p) => {
      this._imageUsageMap[path].add(p);
    });
  }

  addImages(paths: string[]) {
    debug.images('add', paths)

    const size = this._imagePaths.size;
    (paths || []).forEach(p => this._imagePaths.add(p));
    if(this._imagePaths.size !== size) {
      this.updateImageNameMap();
      return true;
    }
    return false;
  }

  removeImages(paths: string[]) {
    debug.images('remove', paths)

    const size = this._imagePaths.size;
    (paths || []).forEach(p => this._imagePaths.delete(p));
    if(this._imagePaths.size !== size) {
      this.updateImageNameMap();
      return true;
    }
    return false;
  }

  onUpdate(path: string) {
    if(!this._server) {
      return;
    }

    const payload: UpdatePayload = {
      type: 'update',
      updates: [],
    }
    const timestamp = +new Date()
    const name = pascalCase(getNameFromFilePath(path, this.options))

    Object.entries(this._imageUsageMap)
      .forEach(([key, values]) => {
        if(values.has(name)) {
          const r = `/${relative(this.viteConfig.root, key)}`
          payload.updates.push({
            acceptedPath: r,
            path: r,
            timestamp,
            type: 'js-update',
          })
        }
      });

    if(payload.updates.length) {
      this._server.ws.send(payload);
    }
  }

  private updateImageNameMap() {
    this._imageNameMap = {}

    Array
      .from(this._imagePaths)
      .forEach((path) => {
        const name = pascalCase(getNameFromFilePath(path, this.options))
        if(this._imageNameMap[name]) {
          console.warn(`[vite-plugin-vue-images] image "${name}"(${path}) has naming conflicts with other images, ignored.`)
          return
        }
        debug.search(`Special name ${name}`);
        this._imageNameMap[name] = {
          name,
          absolute: path,
          path: `/${this.relative(path)}`,
        }
      })
  }

  findImage(name: string, excludePaths: string[] = []): ImageInfo | undefined {
    // resolve from fs
    const info = this._imageNameMap[name];
    if(info && !excludePaths.includes(info.path) && !excludePaths.includes(info.path.slice(1))) {
      return info;
    }

    // custom resolvers
    for(const resolver of (this.options.customResolvers || [])) {
      let path = resolver(name);
      if(path) {
        if(typeof path !== 'string') {
          path = path.path;
        }
        return { name, path };
      }
    }
    return undefined;
  }

  normalizePath(path: string) {
    // @ts-expect-error backward compatibility
    return resolveAlias(path, this.viteConfig?.resolve?.alias || this.viteConfig?.alias || []);
  }

  relative(path: string) {
    if(path.startsWith('/') && !path.startsWith(this.root)) {
      return path.slice(1).replace(/\\/g, '/');
    }
    return relative(this.root, path).replace(/\\/g, '/');
  }

  _searched = false

  /**
   * Search for images
   * Called multiple times to ensure file loaded, should normally run only once.
   */
  searchGlob() {
    if(this._searched) {
      return;
    }

    searchImages(this);
    debug.search(this._imageNameMap);
    this._searched = true;
  }
}
