import { EmitOptions } from 'dts-dom';

export interface RenderOptions extends EmitOptions {
    /** 前缀 */
    prefix: string;
    /** 自定义名字规范 */
    onName: (name: string) => string;
    /** 添加 export 导出 */
    addExport: boolean;
}

export function defaultRenderOptions() {
    return {
        prefix: '',
        onName(name: string) {
            return `${this.prefix}${name.replace(/(l|L)ist$/, 'Item').replace(/s$/, '')}`;
        },
        addExport: false,
    };
}
