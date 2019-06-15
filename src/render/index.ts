import * as t from '../parser/types';
import * as dtsDom from 'dts-dom';
import { pascalCase } from 'change-case';
import SingleName from '../utils/singleName';
import { RenderOptions, defaultRenderOptions } from './types';
import { mergeObjectJTsonc } from 'src/parser/merge';

type Dts = dtsDom.InterfaceDeclaration;
type HolderDts = '';

interface CacheValue {
    index: number;
    dts: Dts;
    node: t.ObjectTJsonc;
}

export function isPropertyDeclaration(dts: dtsDom.ObjectTypeMember): dts is dtsDom.PropertyDeclaration {
    return dts.kind === 'property';
}

export function isHolderDts(dts: any): dts is HolderDts {
    return dts === '';
}

/**
 * 合并两棵 interface 树
 * @param aDts
 * @param bDts
 */
export function mergeInterfaceDeclaration(
    aDts: dtsDom.InterfaceDeclaration,
    bDts: dtsDom.InterfaceDeclaration,
): dtsDom.InterfaceDeclaration {
    const aMembers: dtsDom.PropertyDeclaration[] = aDts.members.filter(isPropertyDeclaration);
    const bMembers: dtsDom.PropertyDeclaration[] = bDts.members.filter(isPropertyDeclaration);

    aDts.members = aMembers.map(aItem => {
        const bItem = bMembers.find(item => item.name === aItem.name);

        if (bItem) {
            if (aItem.jsDocComment || bItem.jsDocComment) {
                aItem.jsDocComment = [aItem.jsDocComment, bItem.jsDocComment].filter(item => !!item).join('\n');
            }
        }

        return aItem;
    });

    return aDts;
}

export function render(root: t.ObjectTJsonc, options?: Partial<RenderOptions>) {
    const renderOptions = Object.assign(defaultRenderOptions(), options);
    const result: Array<Dts | dtsDom.TypeAliasDeclaration | HolderDts> = [];
    const singleTypeName = new SingleName();
    const nameCacheMap = new Map<string, CacheValue>();
    const idCacheMap = new Map<string, CacheValue>();

    function pushDtsToResult(name: string, dts: Dts, node: t.ObjectTJsonc) {
        const typeName = singleTypeName.getUnicodeName(name);

        const nameCache = nameCacheMap.get(name);
        const nodeId = t.getObjectTJsoncId(node);
        const idCache = idCacheMap.get(nodeId);

        if (nameCache) {
            // 同名同结构合并
            // 合并后返回该名字
            if (t.sameObjectTJsoncStruct(nameCache.node, node)) {
                // 清除之前生成的记录
                nameCacheMap.delete(name);
                // 通过占位符删除掉之前的结果
                result.splice(nameCache.index, 1, '');

                if (idCache) {
                    idCacheMap.delete(nodeId);
                }

                renderObjectTJsonc(mergeObjectJTsonc([nameCache.node, node]));

                return name;
            }

            dts.name = typeName;
        } else if (idCache) {
            // 不同名同结构的合并
            if (t.sameObjectTJsoncStruct(idCache.node, node, false)) {
                result.splice(idCache.index, 1, mergeInterfaceDeclaration(idCache.dts, dts));

                result.push(dtsDom.create.alias(typeName, idCache.dts.name as dtsDom.Type));

                return typeName;
            }

            dts.name = typeName;
        } else {
            const cacheNode = {
                node,
                dts,
                index: result.length,
            };

            // 存储结构方便查找
            nameCacheMap.set(name, cacheNode);
            idCacheMap.set(nodeId, cacheNode);
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
        const typeName = renderOptions.onName(pascalCase(node.name));
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
                if (cNode.children.length === 0) {
                    createProperty(cNode.name, dtsDom.type.object);
                } else {
                    createProperty(cNode.name, renderObjectTJsonc(cNode));
                }
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
            if (!isHolderDts(dts)) {
                // 支持导出写法
                if (renderOptions.addExport || renderOptions.export) {
                    return dtsDom
                        .emit(dts, Object.assign({}, options, { rootFlags: 1 }))
                        .replace('interface', 'export interface');
                }

                return dtsDom.emit(dts, renderOptions);
            }

            return '';
        })
        .filter(str => !!str)
        .reverse()
        .join('');
}
