import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import {
  terser,
} from 'rollup-plugin-terser';

export default [
  // Commonjs
  {
    input: './src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      indent: false,
      exports: 'named',
    },
    external: ['dts-dom', 'jsonc-parser', 'change-case', 'esprima'],
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
  // ES for Browsers
  {
    input: './src/index.ts',
    output: {
      file: 'lib/index.es.js',
      format: 'es',
      indent: false,
    },
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main'],
      }),
      commonjs({
        // 解决采用 exports.xxx = xxx 这种导出方式
        namedExports: {
          'esprima': ['tokenize'],
        },
      }),
      typescript({
        useTsconfigDeclarationDir: true,
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
  // UMD
  {
    input: './src/index.ts',
    output: {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'typeofJsonc',
      exports: 'named',
      indent: false,
    },
    plugins: [
      nodeResolve({
        mainFields: ['module', 'main'],
      }),
      commonjs({
        // 解决采用 exports.xxx = xxx 这种导出方式
        namedExports: {
          'esprima': ['tokenize'],
        },
      }),
      typescript({
        useTsconfigDeclarationDir: true,
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
];
