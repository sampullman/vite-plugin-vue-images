import { Options } from './types'

export const MODULE_NAME = 'vite-plugin-vue-images'
export const RESOLVER_EXT = '.vite-plugin-vue-images'
export const DISABLE_COMMENT = '/* vite-plugin-vue-images disabled */'

export const defaultOptions: Required<Options> = {
  dirs: ['src/assets/img'],
  extensions: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
  props: ['src'],
  customResolvers: [],
};
