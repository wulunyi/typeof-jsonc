import * as dtsDom from 'dts-dom';
import { ParseOptions } from 'jsonc-parser';
import parser from './jsoncParser';
declare function typeofJsonc(jsonc: string, name?: string, options?: Partial<dtsDom.EmitOptions & ParseOptions>): string;
export { parser, typeofJsonc };
