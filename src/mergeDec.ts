import * as dtsDom from 'dts-dom';
import { topTypeNode } from './helper';
import MapSet from './mapSet';

export function mergeInterfaceTypeNodes(
    interfaceTypeNodes: dtsDom.InterfaceDeclaration[],
    name?: string,
) {
    if (interfaceTypeNodes.length === 0) {
        throw new Error('dtsList not allow empty');
    }

    if (interfaceTypeNodes.length === 1) {
        return topTypeNode(interfaceTypeNodes);
    }

    const pMapSet = new MapSet<dtsDom.PropertyDeclaration>();
    const pNameSet = new Set();

    interfaceTypeNodes.forEach(typeNode =>
        typeNode.members.forEach(node => {
            // 只对属性做处理
            if (node.kind === 'property') {
                pNameSet.add(node.name);
                pMapSet.add(node.name, node);
            }
        }),
    );

    const iResult = dtsDom.create.interface(
        name || topTypeNode(interfaceTypeNodes).name,
    );

    [...pNameSet].forEach(pName => {
        const pArr = pMapSet.get(pName);
        const mergedP = mergePropertyTypeNodes(pArr, pName);

        if (pArr.length !== interfaceTypeNodes.length) {
            mergedP.flags = dtsDom.DeclarationFlags.Optional;
        }

        iResult.members.push(mergedP);
    });

    return iResult;
}

/**
 * merge same name PropertyDeclaration
 * @param propertyTypeNodes PropertyDeclaration[]
 */
export function mergePropertyTypeNodes(
    propertyTypeNodes: dtsDom.PropertyDeclaration[],
    name?: string,
): dtsDom.PropertyDeclaration {
    if (propertyTypeNodes.length === 0) {
        throw new Error('dtsList not allow empty');
    }

    if (propertyTypeNodes.length === 1) {
        return topTypeNode(propertyTypeNodes);
    }

    const typeSet = new Set();
    const jsDocSet = new Set();
    const flagsSet = new Set();

    propertyTypeNodes.forEach(dts => {
        if (dts.flags) {
            flagsSet.add(dts.flags);
        }

        if (dts.jsDocComment) {
            jsDocSet.add(dts.jsDocComment);
        }
        typeSet.add(dts.type);
    });

    let ptype: dtsDom.Type = dtsDom.type.any;

    if (typeSet.size === 1) {
        ptype = topTypeNode([...typeSet]);
    } else if (typeSet.size > 1) {
        ptype = dtsDom.create.union([...typeSet]);
    }

    const pResult = dtsDom.create.property(
        name || topTypeNode(propertyTypeNodes).name,
        ptype,
    );

    if (jsDocSet.size > 0) {
        pResult.jsDocComment = [...jsDocSet].join('\n');
    }

    if (flagsSet.size > 0) {
        pResult.flags = [...flagsSet].pop();
    }

    return pResult;
}
