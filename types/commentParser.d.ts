export declare enum CommentKind {
    Leading = 0,
    Trailing = 1,
    JsDoc = 2,
    Other = 3
}
export interface IComment {
    kind: CommentKind;
    content: string[];
}
export declare function getCommentKind(comment: string): CommentKind;
export declare function getLeadingComment(comment: string): string[];
export declare function getTrailingComment(comment: string): string[];
export declare function getJsDoc(comment: string): string[];
export declare function parser(comment: string): IComment;
