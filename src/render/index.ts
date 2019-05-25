import * as t from '../parser/types';
import * as dtsDom from 'dts-dom';
import { pascalCase } from 'change-case';
import SingleName from '../utils/singleName';
import { RenderOptions, defaultRenderOptions } from './types';
import { mergeObjectJTsonc } from 'src/parser/merge';

type Dts = dtsDom.InterfaceDeclaration;

interface MapValue {
    index: number;
    dts: Dts;
    node: t.ObjectTJsonc;
}

export function render(root: t.ObjectTJsonc, options?: Partial<RenderOptions>) {
    const renderOptions = Object.assign(defaultRenderOptions(), options);
    const result: Dts[] = [];
    const singleTypeName = new SingleName();
    const resultMap = new Map<string, MapValue>();

    function pushDtsToResult(name: string, dts: Dts, node: t.ObjectTJsonc) {
        const typeName = singleTypeName.getUnicodeName(name);

        const savedMapValue = resultMap.get(name);

        if (savedMapValue) {
            // 同名同结构合并
            if (t.isSameStructObjectTJsonc(savedMapValue.node, node)) {
                // 清除之前生成的记录
                resultMap.delete(name);
                result.splice(savedMapValue.index, 1);

                // if (
                //     savedMapValue.node.parent !== node.parent &&
                //     t.isSameStructTJsonc(savedMapValue.node.parent, node.parent, false)
                // ) {
                //     debugger;
                // }

                renderObjectTJsonc(mergeObjectJTsonc([savedMapValue.node, node]));

                return name;
            }

            dts.name = typeName;
        } else {
            // 存储结构方便查找
            resultMap.set(name, {
                node,
                dts,
                index: result.length,
            });
        }

        result.push(dts);

        return typeName;
    }

    function renderNormalTJsonc(node: t.NormalTJsonc) {
        return node.valueType.length > 1 ? dtsDom.create.union(node.valueType) : (node.valueType[0] as dtsDom.Type);
    }

    function renderUnionTJsonc(node: t.UnionTJsonc): dtsDom.UnionType {
        const types = node.children.map(cNode => {
            if (t.isArrayTJsonc(cNode)) {
                return renderArrayTJsonc({
                    ...cNode,
                    name: `union-${node.name}`,
                });
            }

            if (t.isObjectTJsonc(cNode)) {
                return renderObjectTJsonc({
                    ...cNode,
                    name: node.name,
                });
            }

            if (t.isUnionTJsonc(cNode)) {
                return renderUnionTJsonc(cNode);
            }

            return renderNormalTJsonc(cNode);
        });

        return dtsDom.create.union(types);
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

            if (t.isUnionTJsonc(cNode)) {
                return renderUnionTJsonc(cNode);
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
        const typeName = pascalCase(renderOptions.onName(node.name));
        const dts = dtsDom.create.interface(typeName);

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
            } else if (t.isUnionTJsonc(cNode)) {
                createProperty(cNode.name, renderUnionTJsonc(cNode));
            } else {
                createProperty(cNode.name, renderNormalTJsonc(cNode));
            }

            if (cNode.comments.length > 0) {
                propertyTypeNode.jsDocComment = cNode.comments.join('\n');
            }

            return propertyTypeNode;
        });

        return pushDtsToResult(typeName, dts, node) as dtsDom.Type;
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
