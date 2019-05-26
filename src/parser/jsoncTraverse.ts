import { visit, ParseErrorCode, ParseOptions, JSONVisitor } from 'jsonc-parser';
import { parser, Comment } from './commentsParser';
import { add, safeFn } from '../utils';

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

export function traverse(parserOptions: IParserOptions, travers: ITravers) {
    const {
        jsonc = '{}',
        name = 'root',
        options = {
            disallowComments: false,
            allowTrailingComma: true,
        },
    } = parserOptions;

    const nameStack: string[] = [name];

    function getName() {
        return nameStack.pop() || '';
    }

    // 辅助变量
    // preOffset 用来处理注释获取（onComment 获取不到换行数据）
    let preOffset: number = 0;

    // 计算当前处理的前置 offset 为注释做铺垫
    function walkOffset(...args: number[]) {
        preOffset = add(...args.slice(0, 2));
    }

    visit(
        jsonc,
        {
            onObjectBegin(...params) {
                walkOffset(...params);

                safeFn(travers.onObjectBegin)(getName());
            },
            onObjectEnd(...params) {
                walkOffset(...params);

                safeFn(travers.onObjectEnd)();
            },
            onArrayBegin(...params) {
                walkOffset(...params);

                safeFn(travers.onArrayBegin)(getName());
            },
            onArrayEnd(...params) {
                walkOffset(...params);

                safeFn(travers.onArrayEnd)();
            },
            onObjectProperty(property: string, ...params) {
                walkOffset(...params);

                nameStack.push(property);

                safeFn(travers.onObjectProperty)(property);
            },
            onLiteralValue(value: any, ...params) {
                walkOffset(...params);

                safeFn(travers.onLiteralValue)(getName(), value);
            },
            onSeparator(charcter: string, ...params) {
                walkOffset(...params);

                safeFn(travers.onSeparator)(charcter);
            },
            onComment(...params) {
                const comment = jsonc.substr(preOffset, add(...params.slice(0, 2)) - preOffset);

                const commentResult = parser(comment);

                safeFn(travers.onComment)(commentResult);
                walkOffset(...params);
            },
            onError(error: ParseErrorCode, ...params) {
                walkOffset(...params);

                safeFn(travers.onError)(error);
            },
        },
        options,
    );
}
