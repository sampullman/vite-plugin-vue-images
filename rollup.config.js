import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json');

const notMin = filename => filename.replace('.min', '');

export default {
  input: 'out-tsc/index.js',
  output: [
    { file: pkg.module, format: 'esm', sourcemap: true, plugins: [terser()] },
    { file: notMin(pkg.module), format: 'esm' },
    { file: pkg.main, format: 'cjs', sourcemap: true, plugins: [terser()] },
    { file: notMin(pkg.main), format: 'cjs' },
  ],
  external: [...Object.keys(pkg.devDependencies), 'debug'],
  plugins: [
    commonjs(),
    resolve(),
    sourceMaps(),
  ],
};
