import typescript from 'rollup-plugin-typescript2';
import es3 from 'rollup-plugin-es3';

export default {
  input: './src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    es3(),
  ],
};
