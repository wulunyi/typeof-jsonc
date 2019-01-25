import * as dtsDom from 'dts-dom';
import { visit, ParseErrorCode, ParseOptions } from 'jsonc-parser';
import * as helper from './helper';
import * as jsoncComment from './commentParser';
import { StackNode, CanAddCommentNode } from './types';
import { mergeInterfaceDec } from './mergeDec';
import SingleName from './singleName';
import ArrayType from './arrayType';

export default function parser(
  jsonc: string,
  name: string,
  options?: ParseOptions,
): dtsDom.TopLevelDeclaration[] {
  const result: dtsDom.TopLevelDeclaration[] = [];

  // 辅助变量
  let preOffset: number = 0;
  const nameStack: string[] = [name];
  const dtsStack: StackNode[] = [];
  const comments: string[] = [];
  const singleTypeName = new SingleName();

  // 辅助函数
  function walkOffset(...params: number[]) {
    preOffset = helper.add(...params);
  }

  function popAllComments() {
    return comments.splice(0, comments.length);
  }

  function addComment<T extends CanAddCommentNode>(node: T): T {
    if (!helper.isEmpty(comments)) {
      node.jsDocComment = [node.jsDocComment || '']
        .concat(popAllComments())
        .filter(coment => !!coment)
        .join('\n');
    }

    return node;
  }

  function walkTopDts(handler: {
    onGenArrTypeFn: (dts: ArrayType) => void;
    onDts: (dts: dtsDom.InterfaceDeclaration) => void;
  }) {
    if (!helper.isEmpty(dtsStack)) {
      const topDts = helper.topItem(dtsStack);

      if (helper.isArrCreateNode(topDts)) {
        handler.onGenArrTypeFn(topDts);
      } else if (helper.isInterfaceNode(topDts)) {
        handler.onDts(topDts);
      }
    }
  }

  function getName(): string {
    if (!helper.isEmpty(dtsStack)) {
      const topDts = helper.topItem(dtsStack);

      if (topDts && helper.isArrCreateNode(topDts)) {
        return topDts.name;
      }

      return nameStack.pop()!;
    }

    return nameStack.pop()!;
  }

  function getCaseName(pName: string): string {
    if (!helper.isEmpty(dtsStack)) {
      const topDts = helper.topItem(dtsStack);

      if (topDts && helper.isArrCreateNode(topDts)) {
        return topDts.caseName;
      }

      return singleTypeName.getUnicodeName(pName);
    }

    return singleTypeName.getUnicodeName(pName);
  }

  visit(
    jsonc,
    {
      onObjectBegin(...params) {
        walkOffset(...params);

        const pName = getName();
        const casePName = getCaseName(pName);
        const iDec = dtsDom.create.interface(casePName);

        walkTopDts({
          onGenArrTypeFn(topDts) {
            topDts.childrenType.add(casePName as dtsDom.Type);
            topDts.jsDocComments.push(...popAllComments());

            // 对于数组对象元素有注释，则对象加上注释，且数组属性加上注释
            if (topDts.jsDocComments.length > 0) {
              iDec.jsDocComment = topDts.jsDocComments.join('\n');
            }
          },
          onDts(topDts) {
            topDts.members.push(
              addComment(
                dtsDom.create.property(pName, casePName as dtsDom.Type),
              ),
            );
          },
        });

        // 推入 interface
        dtsStack.push(iDec);
      },
      onObjectEnd(...params) {
        walkOffset(...params);
        const topDts = dtsStack.pop() as dtsDom.InterfaceDeclaration;
        const nowTopDts = helper.topItem(dtsStack);

        if (nowTopDts && helper.isArrCreateNode(nowTopDts)) {
          nowTopDts.childrenIDec.add(topDts);
        } else {
          result.push(topDts);
        }
      },

      onArrayBegin(...params) {
        walkOffset(...params);

        const genArrType = new ArrayType();

        walkTopDts({
          onGenArrTypeFn(dts) {
            genArrType.name = dts.name;
            genArrType.type = 'arrItem';
          },
          onDts() {
            genArrType.name = nameStack.pop() || '';
            genArrType.type = 'property';
            genArrType.jsDocComments.push(...popAllComments());
          },
        });
        genArrType.caseName = singleTypeName.getUnicodeName(genArrType.name);
        dtsStack.push(genArrType);
      },
      onArrayEnd(...params) {
        walkOffset(...params);

        if (!helper.isEmpty(dtsStack)) {
          const genArrType = dtsStack.pop() as ArrayType;
          const nodeType = genArrType.emit();

          // 获取现在的顶部元素
          const topDts = helper.topItem(dtsStack);

          if (helper.isArrCreateNode(topDts)) {
            // 顶部是 ArrayType 的话，nodeType 一定是 ArrayTypeReference
            topDts.childrenType.add(nodeType as dtsDom.ArrayTypeReference);
          } else if (helper.isInterfaceNode(topDts)) {
            // 顶部是 InterfaceDeclaration 的话，nodeType 一定是 PropertyDeclaration
            (topDts as dtsDom.InterfaceDeclaration).members.push(
              nodeType as dtsDom.PropertyDeclaration,
            );
          }

          // merge array object Item
          if ([...genArrType.childrenIDec].length > 0) {
            result.push(mergeInterfaceDec([...genArrType.childrenIDec]));
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
          const dts = helper.topItem(dtsStack);

          if (helper.isArrCreateNode(dts)) {
            dts.childrenType.add(typeof value as dtsDom.Type);
          } else if (helper.isInterfaceNode(dts)) {
            const propertyDec = dtsDom.create.property(
              nameStack.pop()!,
              typeof value as dtsDom.Type,
            );

            (dts as dtsDom.InterfaceDeclaration).members.push(
              addComment(propertyDec),
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
          helper.topItem(dtsStack) &&
          (helper.topItem(dtsStack) as dtsDom.InterfaceDeclaration).members
            .length > 0
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
    },
    options,
  );

  return result;
}
