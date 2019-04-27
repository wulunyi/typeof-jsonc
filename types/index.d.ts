import * as dtsDom from 'dts-dom';
import { format } from './format';
import parser from './jsoncParser';
import { IParseOptions } from './types';
export declare type Options = Partial<dtsDom.EmitOptions & IParseOptions>;
declare function typeofJsonc(jsonc: string, name?: string, options?: Options): string;
export { parser, typeofJsonc, format };
export default typeofJsonc;
