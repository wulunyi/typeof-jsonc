import * as dtsDom from 'dts-dom';
import * as changeCase from 'change-case';

function addPrefix(name: string) {
    const prefixReg = /\_(\d+)$/;

    if (prefixReg.test(name)) {
        return name.replace(prefixReg, (m, p1) => `_${+p1 + 1}`);
    }

    return `${name}_1`;
}

export default class SingleName {
    // public $map = new Map<string, dtsDom.InterfaceDeclaration>();
    public $nameSet = new Set<string>();

    public getUnicodeName(name: string, flag: boolean = false): string {
        if (this.$nameSet.has(name) && !flag) {
            return this.getUnicodeName(addPrefix(name));
        }

        this.$nameSet.add(name);

        return changeCase.pascalCase(name);
    }
}
