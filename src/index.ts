import * as dtsDom from 'dts-dom';
import { format } from './format';
import parser from './jsoncParser';
import { IParseOptions } from './types';

const defaultOptions = {
    prefix: '',
    onName(name: string) {
        return `${this.prefix}${name}`;
    },
    addExport: false,
    // 向下兼容
    export: false,
    rootFlags: dtsDom.ContextFlags.None,
    disallowComments: true,
    allowTrailingComma: true,
};

export type Options = Partial<dtsDom.EmitOptions & IParseOptions>;

function typeofJsonc(
    jsonc: string,
    name = 'RootType',
    options?: Options,
): string {
    const assignOptions = Object.assign({}, defaultOptions, options);
    const formatJsonc = format(jsonc);

    return parser(formatJsonc, name, assignOptions)
        .reverse()
        .map(d => {
            // 支持导出写法
            if (assignOptions.addExport || assignOptions.export) {
                return dtsDom
                    .emit(d, Object.assign({}, options, { rootFlags: 1 }))
                    .replace('interface', 'export interface');
            }

            return dtsDom.emit(d, options);
        })
        .join('');
}

export { parser, typeofJsonc, format };

export default typeofJsonc;
