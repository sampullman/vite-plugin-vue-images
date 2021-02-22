import Debug from 'debug';
import fg from 'fast-glob';
import { ResolvedConfig, ViteDevServer, normalizePath } from 'vite';
import { ImageInfo, Options } from './types';
import {
  pascalCase,
  appRelativePath,
  fileInDirs,
  getNameFromFilePath,
  resolveAlias,
  resolveOptions,
  hasExtension,
} from './utils';

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
    this.options = resolveOptions(options, viteConfig);
    const exts = this.extensions;

    if(!exts.length) {
      throw new Error('[vite-plugin-vue-images] extensions are required to search for images');
    }
    if(!this.props.length) {
      throw new Error('[vite-plugin-vue-images] props required to replace images');
    }

    const extsGlob = exts.length === 1 ? exts[0] : `{${exts.join(',')}}`;

    this.globs = (this.dirs || []).map((d: string) =>
        `${d}/**/*.${extsGlob}`
    );
  }

  get root() {
    return this.viteConfig.root;
  }

  get props(): string[] {
    return this.options.props || [];
  }

  get dirs(): string[] {
    return this.options.dirs || [];
  }

  get extensions(): string[] {
    return this.options.extensions || [];
  }

  setServer(server: ViteDevServer) {
    this._server = server;
    server.watcher
      .on('add', (path) => {
        const relPath = appRelativePath(path, this.root);
        if(fileInDirs(this.dirs, relPath) && hasExtension(path, this.extensions)) {
          this.addImages([relPath]);
          this.onUpdate(relPath);
        }
      })
      .on('unlink', (path) => {
        // Remove non-app section of path
        const relPath = appRelativePath(path, this.root);
        if(this.removeImage(relPath)) {
          this.onUpdate(relPath);
        }
      });
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

  addImages(paths: string[]): boolean {

    const size = this._imagePaths.size;
    (paths || []).forEach(p => {
      debug.images('add', p);
      this._imagePaths.add(p);
    });
    if(this._imagePaths.size !== size) {
      this.updateImageNameMap();
      return true;
    }
    return false;
  }

  removeImage(path: string): boolean {
    const deleted = this._imagePaths.delete(path);

    debug.images(`remove(${deleted})`, path);

    if(deleted) {
      this.updateImageNameMap();
    }
    return deleted;
  }

  onUpdate(path: string) {
    if(!this._server) {
      return;
    }
    const name = pascalCase(getNameFromFilePath(path, this.options));

    const update = Object.values(this._imageUsageMap)
      .some((values) => values.has(name));

    if(update) {
      this._server.ws.send({ type: 'full-reload' });
    }
  }

  private updateImageNameMap() {
    this._imageNameMap = {}

    Array
      .from(this._imagePaths)
      .forEach((path) => {
        const name = pascalCase(getNameFromFilePath(path, this.options));
        if(this._imageNameMap[name]) {
          console.warn(`[vite-plugin-vue-images] Ignored "${name}"(${path}), it conflicts with another image.`)
          return;
        }
        this._imageNameMap[name] = {
          name,
          path: `/${normalizePath(path)}`,
        }
      });
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

  resolvePathAlias(path: string) {
    // @ts-expect-error backward compatibility
    return resolveAlias(path, this.viteConfig?.resolve?.alias || this.viteConfig?.alias || []);
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
