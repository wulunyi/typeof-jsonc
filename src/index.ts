import * as dtsDom from 'dts-dom';
import { ParseOptions } from 'jsonc-parser';
import parser from './jsoncParser';

function typeofJsonc(
  jsonc: string,
  name: string = 'IRootType',
  options?: Partial<dtsDom.EmitOptions & ParseOptions>,
): string {
  return parser(jsonc, name, options)
    .map(d => dtsDom.emit(d, options))
    .join('\n');
}

export { parser, typeofJsonc };
