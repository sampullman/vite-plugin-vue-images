import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  output: {
    exports: 'default',
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },
  external: [...Object.keys(pkg.devDependencies), 'debug'],
  plugins: [
    typescript(),
    commonjs(),
    resolve(),
    sourceMaps(),
  ],
};
