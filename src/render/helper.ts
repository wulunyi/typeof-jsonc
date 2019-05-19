import * as dtsDom from 'dts-dom';

export function isPropertyDeclaration(pdts: dtsDom.ObjectTypeMember): pdts is dtsDom.PropertyDeclaration {
    return pdts.kind === 'property';
}

export function getInterfaceDeclarationId(dts: dtsDom.InterfaceDeclaration) {
    const members = dts.members.filter(isPropertyDeclaration).map(pdts => `${pdts.name}_${JSON.stringify(pdts.type)}`);

    return `${dts.name}_${members.join('_')}`;
}
