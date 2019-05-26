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
export declare function defaultRenderOptions(): {
    prefix: string;
    onName(name: string): string;
    addExport: boolean;
};
