import * as dtsDom from 'dts-dom';
import parser from './jsoncParser';

export function typeofJsonc(jsonc: string, name?: string): string {
  return parser(jsonc, name)
    .map(d => dtsDom.emit(d))
    .join('\n');
}

export default { parser };
