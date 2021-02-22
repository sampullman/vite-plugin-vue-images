import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';

const pkg = require('./package.json');

export default {
  input: 'out-tsc/index.js',
  output: [
    { file: pkg.module, format: 'esm', sourcemap: true },
    { file: pkg.main, format: 'cjs', sourcemap: true },
  ],
  external: [...Object.keys(pkg.devDependencies), 'debug'],
  plugins: [
    commonjs(),
    resolve(),
    sourceMaps(),
  ],
};
