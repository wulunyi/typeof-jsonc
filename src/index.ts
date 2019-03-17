import * as dtsDom from 'dts-dom';
import { ParseOptions } from 'jsonc-parser';
import parser from './jsoncParser';

function typeofJsonc(
  jsonc: string,
  name: string = 'IRootType',
  options?: Partial<dtsDom.EmitOptions & ParseOptions & { export: boolean }>,
): string {
  return parser(jsonc, name, options)
    .map(d => {
      // 支持导出写法
      if (options && options.export) {
        return dtsDom.emit(d, options).replace('interface', 'export interface');
      }

      return dtsDom.emit(d, options);
    })
    .join('\n');
}

export { parser, typeofJsonc };
