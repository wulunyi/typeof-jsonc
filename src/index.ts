import { ParseOptions } from 'jsonc-parser';
import { format } from './utils';
import { parser } from './parser';
import { render } from './render';
import { RenderOptions } from './render/types';

export type Options = Partial<RenderOptions & ParseOptions>;

function typeofJsonc(jsonc: string, name = 'RootType', options?: Options): string {
    return render(parser(format(jsonc), name, options), options);
}

export { parser, typeofJsonc, format };

export default typeofJsonc;
