import * as dtsDom from 'dts-dom';
import parser from './jsoncParser';

export function typeofJsonc(
  jsonc: string,
  name: string = 'IRootType',
  options?: dtsDom.EmitOptions,
): string {
  return parser(jsonc, name)
    .map(d => dtsDom.emit(d, options))
    .join('\n');
}

export default { parser, typeof: typeofJsonc };
