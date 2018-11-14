import { TSDocParser } from '@microsoft/tsdoc';

export enum CommentKind {
  Leading,
  Trailing,
  JsDoc,
  Other,
}

export interface IComment {
  kind: CommentKind;
  content: string[];
}

const leadingReg = /\s*\n\s*?\/\/([^\n]*)/;
const trailingReg = /\s*\/\/([^\n]*)/;
const jsDocReg = /\/\*(\s|.)*?\*\//;

export function getCommentKind(comment: string): CommentKind {
  return leadingReg.test(comment)
    ? CommentKind.Leading
    : trailingReg.test(comment)
    ? CommentKind.Trailing
    : jsDocReg.test(comment)
    ? CommentKind.JsDoc
    : CommentKind.Other;
}

function getLineComment(comment: string, reg: RegExp): string[] {
  return comment
    .match(reg)!
    .slice(1, 2)
    .map(c => c.trim())
    .filter(c => !!c);
}

export function getLeadingComment(comment: string): string[] {
  return getLineComment(comment, leadingReg);
}

export function getTrailingComment(comment: string): string[] {
  return getLineComment(comment, trailingReg);
}

export function getJsDoc(comment: string) {
  const commentParser = new TSDocParser();
  const result = commentParser.parseString(comment);

  return result.lines.map(({ buffer, end, pos }) => buffer.slice(pos, end));
}

const contentHandler: {
  [key in CommentKind]: (comment: string) => string[]
} = {
  [CommentKind.Leading]: getLeadingComment,
  [CommentKind.Trailing]: getTrailingComment,
  [CommentKind.JsDoc]: getJsDoc,
  [CommentKind.Other]: (c: any) => [],
};

export function parser(comment: string): IComment {
  const result = {} as IComment;

  result.kind = getCommentKind(comment);
  result.content = contentHandler[result.kind](comment);

  return result;
}
