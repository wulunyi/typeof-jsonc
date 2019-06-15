import { EmitOptions } from 'dts-dom';

export interface RenderOptions extends EmitOptions {
    /** 前缀 */
    prefix: string;
    /** 自定义名字规范 */
    onName: (name: string) => string;
    /** 添加 export 导出 */
    addExport: boolean;
    /** 向下兼容 */
    export: boolean;
}

export function defaultRenderOptions() {
    return {
        prefix: '',
        onName(name: string) {
            let finallyName = name;

            if (!Number.isNaN(+name)) {
                finallyName = `Object_${name}`;
            }

            return `${this.prefix}${finallyName.replace(/(l|L)ist$/, 'Item').replace(/s$/, '')}`;
        },
        addExport: false,
    };
}
