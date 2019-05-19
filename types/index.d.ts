import { ParseOptions } from 'jsonc-parser';
import { format } from './utils';
import { parser } from './parser';
import { RenderOptions } from './render/types';
export declare type Options = Partial<RenderOptions & ParseOptions>;
declare function typeofJsonc(jsonc: string, name?: string, options?: Options): string;
export { parser, typeofJsonc, format };
export default typeofJsonc;
