export type ImageResolveResult = string | { path: string; }

export type ImageResolver = (name: string) => ImageResolveResult | null | undefined | void;

export type Transformer = (code: string, id: string, path: string, query: Record<string, string>) => string;

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
   * Pass a function to resolve the image import path from the image name.
   *
   * Image names are always in PascalCase
   */
  customResolvers?: ImageResolver[]

  /**
   * Custom Regex used to search for variable names.
   * For example, to ensure only capitalized variables are replaced: '([A-Z][a-zA-Z0-9]+)'
   * It MUST include a group
   * @default '([a-zA-Z0-9]+)'
   */
  customSearchRegex?: string
}

export interface ImageInfo {
  name: string
  path: string
}

export type ImagesImportMap = Record<string, string[] | undefined>
