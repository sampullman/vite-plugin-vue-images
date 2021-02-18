export type ImageResolveResult = string | { path: string; }

export type ImageResolver = (name: string) => ImageResolveResult | null | undefined | void

export type Matcher = (id: string) => boolean | null | undefined

export type Transformer = (code: string, id: string, path: string, query: Record<string, string>) => string

/**
 * Plugin options.
 */
export interface Options {
  /**
   * Relative paths to the directory to search for images.
   * @default 'src/assets/img'
   */
  dirs?: string[]

  /**
   * Valid file extensions for images.
   * @default ['jpg', 'jpeg', 'png', 'svg', 'webp']
   */
  extensions?: string[]

  /**
   * View component properties used for substitution
   * @default ['src']
   */
  props?: string[]

  /**
   * Pass a function to resolve the image import path from the image name.
   *
   * Image names are always in PascalCase
   */
  customResolvers?: ImageResolver[]
}

export interface ImageInfo {
  name: string
  path: string
  absolute?: string
}

export type ImagesImportMap = Record<string, string[] | undefined>
