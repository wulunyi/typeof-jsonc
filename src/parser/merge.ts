import * as t from './types';

export function uniq<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

export function mergeNormalTJsonc(nodes: t.NormalTJsonc[]): t.NormalTJsonc {
    return nodes.slice(1).reduce((mergedNode, curNode) => {
        // 数组单普通项，直接把注释给到数组本身
        if (t.isArrayTJsonc(mergedNode.parent)) {
            mergedNode.parent.comments.push(...mergedNode.comments.splice(0));
        } else {
            mergedNode.comments = uniq([...mergedNode.comments, ...curNode.comments]);
        }

        mergedNode.tagCount += curNode.tagCount;
        mergedNode.valueType = uniq([...mergedNode.valueType, ...curNode.valueType]);

        return mergedNode;
    }, nodes[0]);
}

export function mergeObjectJTsonc(nodes: t.ObjectTJsonc[]): t.ObjectTJsonc {
    return mergeObjectTJsoncChildren(
        nodes.slice(1).reduce((mergedNode, curNode) => {
            mergedNode.tagCount += curNode.tagCount;
            mergedNode.comments = uniq([...mergedNode.comments, ...curNode.comments]);

            const map = new Map<string, t.TJsonc>();

            mergedNode.children.concat(curNode.children).forEach(childNode => {
                const savedNode = map.get(childNode.name);

                if (!savedNode) return map.set(childNode.name, childNode);

                if (t.isNormalTJsonc(childNode) && t.isNormalTJsonc(savedNode)) {
                    map.set(childNode.name, mergeNormalTJsonc([savedNode, childNode]));
                } else if (t.isArrayTJsonc(childNode) && t.isArrayTJsonc(savedNode)) {
                    map.set(childNode.name, mergeArrayLikeTJsonc([savedNode, childNode]));
                } else if (t.isObjectTJsonc(childNode) && t.isObjectTJsonc(savedNode)) {
                    map.set(childNode.name, mergeObjectJTsonc([savedNode, childNode]));
                } else if (t.isUnionTJsonc(savedNode)) {
                    savedNode.children.push(childNode);
                    savedNode.tagCount += childNode.tagCount;
                    map.set(childNode.name, mergeArrayLikeTJsoncChildren(savedNode));
                } else {
                    const unionTjsonc = t.unionTJsonc(childNode.name, mergedNode);

                    unionTjsonc.tagCount = childNode.tagCount + savedNode.tagCount;
                    savedNode.parent = unionTjsonc;
                    childNode.parent = unionTjsonc;

                    unionTjsonc.children = [savedNode, childNode];

                    map.set(childNode.name, unionTjsonc);
                }
            });

            mergedNode.children = [...map.values()];

            return mergedNode;
        }, nodes[0]),
    );
}

export function mergeArrayLikeTJsonc<T extends t.ArrayLikeTJsonc>(nodes: T[]): T {
    if (nodes.length === 0) {
        throw new Error('merge array tjsonc not allow empty!');
    }

    return mergeArrayLikeTJsoncChildren(
        nodes.slice(1).reduce((mergedNode, curNode) => {
            mergedNode.tagCount += curNode.tagCount;
            mergedNode.comments = uniq([...mergedNode.comments, ...curNode.comments]);

            mergedNode.children.push(...curNode.children);

            return mergedNode;
        }, nodes[0]),
    );
}

export function mergeArrayLikeTJsoncChildren<T extends t.ArrayLikeTJsonc>(node: T): T {
    const normalTJsoncChildren = node.children.filter(t.isNormalTJsonc);
    const arrayTJsoncChildren = node.children.filter(t.isArrayTJsonc);
    const objectTJsoncChildren = node.children.filter(t.isObjectTJsonc);

    node.children = [];

    if (normalTJsoncChildren.length > 0) {
        node.children.push(mergeNormalTJsonc(normalTJsoncChildren));
    }

    if (objectTJsoncChildren.length > 0) {
        node.children.push(mergeObjectJTsonc(objectTJsoncChildren));
    }

    if (arrayTJsoncChildren.length > 0) {
        node.children.push(mergeArrayLikeTJsonc(arrayTJsoncChildren));
    }

    return node;
}

export function mergeObjectTJsoncChildren(node: t.ObjectTJsonc): t.ObjectTJsonc {
    node.children = node.children.map(childNode => {
        if (t.isObjectTJsonc(childNode)) return mergeObjectTJsoncChildren(childNode);
        if (t.isArrayTJsonc(childNode)) return mergeArrayLikeTJsoncChildren(childNode);

        return childNode;
    });

    return node;
}
