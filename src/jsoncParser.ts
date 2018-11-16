import * as dtsDom from 'dts-dom';
import { visit, ParseErrorCode } from 'jsonc-parser';
import * as changeCase from 'change-case';

import MapSet from './mapSet';
import * as helper from './helper';
import * as jsoncComment from './commentParser';
import { HalfCreateTypeFn, StackNode, CanAddCommentNode } from './types';
import { mergeInterfaceDec } from './mergeDec';

export default function parser(
  jsonc: string,
  name: string = 'RootType',
): dtsDom.TopLevelDeclaration[] {
  const result: dtsDom.TopLevelDeclaration[] = [];

  // 辅助变量
  let preOffset: number = 0;
  const nameStack: string[] = [name];
  const dtsStack: StackNode[] = [];
  const comments: string[] = [];
  const arrItemMap = new MapSet<dtsDom.Type>();
  const arrItemIMap = new MapSet<dtsDom.InterfaceDeclaration>();
  const commentsMap = new MapSet<string>();

  // 辅助函数
  function walkOffset(...params: number[]) {
    preOffset = helper.add(...params);
  }

  function addComment<T extends CanAddCommentNode>(node: T): T {
    if (!helper.isEmpty(comments)) {
      node.jsDocComment = [node.jsDocComment || '']
        .concat(comments.splice(0, comments.length))
        .filter(coment => !!coment)
        .join('\n');
    }

    return node;
  }

  visit(jsonc, {
    onObjectBegin(...params) {
      walkOffset(...params);

      const objName = helper.topItem(nameStack);
      const caseObjName = changeCase.pascalCase(objName);
      const objDts = dtsDom.create.interface(caseObjName);

      if (!helper.isEmpty(dtsStack)) {
        const topNode = helper.topItem(dtsStack);

        if (helper.isArrCreateNode(topNode)) {
          // 对于数组对象元素有注释，则对象加上注释，且数组属性加上注释
          if (comments.length > 0) {
            objDts.jsDocComment = comments.join('\n');
          }

          // 将类型名推入数组选项中
          arrItemMap.add(topNode, caseObjName as dtsDom.Type);
          // 将注释推入数组注释列表中
          commentsMap.add(
            topNode,
            comments.splice(0, comments.length).join('\n'),
          );
        } else if (helper.isInterfaceNode(topNode)) {
          (topNode as dtsDom.InterfaceDeclaration).members.push(
            addComment(
              dtsDom.create.property(objName, caseObjName as dtsDom.Type),
            ),
          );
        }
      }

      // 推入 interface
      dtsStack.push(objDts);
    },
    onObjectEnd(...params) {
      walkOffset(...params);
      const topNode = dtsStack.pop() as dtsDom.InterfaceDeclaration;

      if (helper.isArrCreateNode(helper.topItem(dtsStack))) {
        arrItemIMap.add(helper.topItem(dtsStack), topNode);
      } else {
        result.push(topNode);
      }
    },

    onArrayBegin(...params) {
      walkOffset(...params);

      if (!helper.isEmpty(dtsStack)) {
        const topNode = helper.topItem(dtsStack);

        if (helper.isArrCreateNode(topNode)) {
          dtsStack.push((type: dtsDom.Type) => dtsDom.create.array(type));
        } else if (helper.isInterfaceNode(topNode)) {
          dtsStack.push((type: dtsDom.Type) =>
            addComment(
              dtsDom.create.property(
                nameStack.pop()!,
                dtsDom.create.array(type),
              ),
            ),
          );
        }
      }
    },
    onArrayEnd(...params) {
      walkOffset(...params);

      if (!helper.isEmpty(dtsStack)) {
        const createTypeFn = dtsStack.pop() as HalfCreateTypeFn;
        const childTypes = arrItemMap.get(createTypeFn);
        let nodeType!: dtsDom.PropertyDeclaration | dtsDom.ArrayTypeReference;

        if (childTypes.length === 1) {
          nodeType = createTypeFn(childTypes[0]);
        } else if (childTypes.length > 1) {
          nodeType = createTypeFn(dtsDom.create.union(childTypes));
        } else {
          nodeType = dtsDom.create.array(dtsDom.type.any);
        }

        const topNode = helper.topItem(dtsStack);

        if (helper.isArrCreateNode(topNode)) {
          arrItemMap.add(
            topNode as HalfCreateTypeFn,
            nodeType as dtsDom.ArrayTypeReference,
          );
        } else if (helper.isInterfaceNode(topNode)) {
          if (commentsMap.get(createTypeFn).length > 0) {
            (nodeType as dtsDom.PropertyDeclaration).jsDocComment = commentsMap
              .get(createTypeFn)
              .join('\n');
          }
          (topNode as dtsDom.InterfaceDeclaration).members.push(
            nodeType as dtsDom.PropertyDeclaration,
          );
        }

        // merge array object Item
        const arrItemIList = arrItemIMap.get(createTypeFn);

        if (arrItemIList.length > 0) {
          result.push(mergeInterfaceDec(arrItemIList));
        }
      }
    },
    onObjectProperty(property: string, ...params) {
      walkOffset(...params);

      nameStack.push(property);
    },
    onLiteralValue(value: any, ...params) {
      walkOffset(...params);

      if (!helper.isEmpty(dtsStack)) {
        const topNode = helper.topItem(dtsStack);

        if (helper.isArrCreateNode(topNode)) {
          arrItemMap.add(
            topNode as HalfCreateTypeFn,
            typeof value as dtsDom.Type,
          );
        } else if (helper.isInterfaceNode(topNode)) {
          const propertyNode = dtsDom.create.property(
            nameStack.pop()!,
            typeof value as dtsDom.Type,
          );

          (topNode as dtsDom.InterfaceDeclaration).members.push(
            addComment(propertyNode),
          );
        }
      }
    },
    onSeparator(charcter: string, ...params) {
      walkOffset(...params);
    },
    onComment(...params) {
      const comment = jsonc.substr(
        preOffset,
        helper.add(...params) - preOffset,
      );

      const commentResult = jsoncComment.parser(comment);

      comments.push(...commentResult.content);

      if (
        commentResult.kind === jsoncComment.CommentKind.Trailing &&
        helper.topItem(dtsStack)
      ) {
        addComment(helper.topItem(
          (helper.topItem(dtsStack) as dtsDom.InterfaceDeclaration).members,
        ) as dtsDom.PropertyDeclaration);
      }

      walkOffset(...params);
    },
    onError(error: ParseErrorCode, ...params) {
      walkOffset(...params);
    },
  });

  return result;
}
