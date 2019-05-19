import { ParseErrorCode, ParseOptions } from 'jsonc-parser';
import { Comment } from './commentsParser';
interface ITravers {
    onObjectBegin?: (name: string) => void;
    onObjectEnd?: () => void;
    onArrayBegin?: (name: string) => void;
    onArrayEnd?: () => void;
    onObjectProperty?: (property: string) => void;
    onSeparator?: (charcter: string) => void;
    onLiteralValue?: (name: string, value: any) => void;
    onComment?: (comment: Comment) => void;
    onError?: (error: ParseErrorCode) => void;
}
interface IParserOptions {
    jsonc: string;
    name: string;
    options?: ParseOptions;
}
export declare function traverse(parserOptions: IParserOptions, travers: ITravers): void;
export {};
