import * as t from './types';

export function mergeNormalTJsonc(nodeList: t.NormalTJsonc[]): t.NormalTJsonc {
    return nodeList.slice(1).reduce((pre, cur) => {
        // 数组单普通项，直接把注释给到数组本身
        if (pre.parent && pre.parent.type === t.TJSONC_TYPE.ARRAY) {
            pre.parent.comments.push(...pre.comments.splice(0));
        } else {
            pre.comments = [...new Set(pre.comments.concat(cur.comments))];
        }

        pre.tagCount += cur.tagCount;
        pre.valueType = [...new Set(pre.valueType.concat(cur.valueType))].sort();

        return pre;
    }, nodeList[0]);
}

export function mergeObjectJTsonc(nodeList: t.ObjectTJsonc[]): t.ObjectTJsonc {
    return nodeList.slice(1).reduce((pre, cur) => {
        pre.tagCount += cur.tagCount;
        pre.comments = [...new Set(pre.comments.concat(cur.comments))];
        const map = new Map<string, t.TJsonc>();

        pre.children.concat(cur.children).forEach(cNode => {
            const pCNode = map.get(cNode.name);

            if (!pCNode) return map.set(cNode.name, cNode);

            if (t.isNormalTJsonc(cNode) && t.isNormalTJsonc(pCNode)) {
                map.set(cNode.name, mergeNormalTJsonc([cNode, pCNode]));
            }

            if (t.isArrayTJsonc(cNode) && t.isArrayTJsonc(pCNode)) {
                cNode.tagCount += pCNode.tagCount;
                cNode.children = cNode.children.concat(pCNode.children);
                cNode.comments = [...new Set(cNode.comments.concat(pCNode.comments))];

                map.set(cNode.name, mergeArrayTJsonc(cNode));
            }

            if (t.isObjectTJsonc(cNode) && t.isObjectTJsonc(pCNode)) {
                map.set(cNode.name, mergeObjectJTsonc([cNode, pCNode]));
            }
        });

        pre.children = [...map.values()];

        return pre;
    }, nodeList[0]);
}

export function mergeArrayTJsonc(node: t.ArrayTJsonc): t.ArrayTJsonc {
    const normalTJsoncChildren = node.children.filter(t.isNormalTJsonc);
    const arrayTJsoncChildren = node.children.filter(t.isArrayTJsonc);
    const objectTJsoncChildren = node.children.filter(t.isObjectTJsonc);

    node.children = [];

    if (normalTJsoncChildren.length > 0) {
        node.children.push(mergeNormalTJsonc(normalTJsoncChildren));
    }

    if (objectTJsoncChildren.length > 0) {
        node.children.push(merge(mergeObjectJTsonc(objectTJsoncChildren)));
    }

    if (arrayTJsoncChildren.length > 0) {
        node.children.push(...arrayTJsoncChildren.map(mergeArrayTJsonc));
    }

    return node;
}

export function merge(node: t.ObjectTJsonc): t.ObjectTJsonc {
    node.children = node.children.map(cNode => {
        if (t.isObjectTJsonc(cNode)) return merge(cNode);
        if (t.isArrayTJsonc(cNode)) return mergeArrayTJsonc(cNode);

        return cNode;
    });

    return node;
}
