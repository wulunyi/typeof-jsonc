import * as t from '../parser/types';
import * as dtsDom from 'dts-dom';
// import * as hashJS from 'hash.js';
import { pascalCase } from 'change-case';
import SingleName from '../utils/singleName';
import { RenderOptions, defaultRenderOptions } from './types';
// import { getInterfaceDeclarationId } from './helper';
import uniq from 'lodash/uniq';
import mergeWith from 'lodash/mergeWith';

type Dts = dtsDom.InterfaceDeclaration;

// function hash(content: string): string {
//     return (hashJS as any)
//         .sha1()
//         .update(content)
//         .digest('hex');
// }

function stringifyDts(dts: Dts) {
    return JSON.stringify(dts, (key, value) => {
        if (key === 'jsDocComment') {
            return;
        }

        if (key === 'members') {
            return (value as dtsDom.PropertyDeclaration[]).sort((a, b) => {
                if (a.name > b.name) {
                    return 1;
                }

                if (a.name < b.name) {
                    return -1;
                }

                return 0;
            });
        }

        return value;
    });
}

function isEqual(aDts: Dts, bDts: Dts): boolean {
    return stringifyDts(aDts) === stringifyDts(bDts);
}

function mergeDts(aDts: Dts, bDts: Dts) {
    mergeWith(aDts, bDts, (aValue, bValue, pName) => {
        if (pName === 'jsDocComment') {
            return uniq([aValue, bValue]).join('\n');
        }
    });

    return aDts;
}

export function render(root: t.ObjectTJsonc, options?: Partial<RenderOptions>) {
    const renderOptions = Object.assign(defaultRenderOptions(), options);
    const result: Dts[] = [];
    const singleDtsName = new SingleName();
    const resultMap = new Map<string, Dts>();

    function pushDtsToResult(name: string, dts: Dts) {
        const uniName = singleDtsName.getUnicodeName(name);

        if (resultMap.has(name)) {
            // 同名同结构合并
            if (isEqual(resultMap.get(name)!, dts)) {
                mergeDts(resultMap.get(name)!, dts);

                return name;
            }

            dts.name = uniName;
        } else {
            resultMap.set(name, dts);
        }

        result.unshift(dts);

        return uniName;
    }

    function renderNormalTJsonc(node: t.NormalTJsonc) {
        return node.valueType.length > 1 ? dtsDom.create.union(node.valueType) : (node.valueType[0] as dtsDom.Type);
    }

    function renderArrayTJsonc(node: t.ArrayTJsonc): dtsDom.ArrayTypeReference {
        const types = node.children.map(cNode => {
            if (t.isArrayTJsonc(cNode)) {
                return renderArrayTJsonc({
                    ...cNode,
                    name: `sub-${node.name}`,
                });
            }

            if (t.isObjectTJsonc(cNode)) {
                return renderObjectTJsonc({
                    ...cNode,
                    name: node.name,
                });
            }

            return renderNormalTJsonc(cNode);
        });

        if (types.length === 0) {
            return dtsDom.create.array(dtsDom.type.any);
        }

        if (types.length === 1) {
            return dtsDom.create.array(types[0]);
        }

        return dtsDom.create.array(dtsDom.create.union(types));
    }

    function renderObjectTJsonc(node: t.ObjectTJsonc): dtsDom.Type {
        const dtsName = pascalCase(renderOptions.onName(node.name));
        const dts = dtsDom.create.interface(dtsName);

        dts.jsDocComment = node.comments.join('\n');

        dts.members = node.children.map(cNode => {
            let propertyTypeNode!: dtsDom.PropertyDeclaration;

            const createProperty = (name: string, type: dtsDom.Type) => {
                if (cNode.tagCount < node.tagCount) {
                    propertyTypeNode = dtsDom.create.property(name, type, dtsDom.DeclarationFlags.Optional);
                } else {
                    propertyTypeNode = dtsDom.create.property(name, type);
                }
            };

            if (t.isObjectTJsonc(cNode)) {
                createProperty(cNode.name, renderObjectTJsonc(cNode));
            } else if (t.isArrayTJsonc(cNode)) {
                createProperty(cNode.name, renderArrayTJsonc(cNode));
            } else {
                createProperty(cNode.name, renderNormalTJsonc(cNode));
            }

            if (cNode.comments.length > 0) {
                propertyTypeNode.jsDocComment = cNode.comments.join('\n');
            }

            return propertyTypeNode;
        });

        return pushDtsToResult(dtsName, dts) as dtsDom.Type;
    }

    renderObjectTJsonc(root);

    return result
        .map(dts => {
            // 支持导出写法
            if (renderOptions.addExport) {
                return dtsDom
                    .emit(dts, Object.assign({}, options, { rootFlags: 1 }))
                    .replace('interface', 'export interface');
            }

            return dtsDom.emit(dts);
        })
        .join('\n');
}
