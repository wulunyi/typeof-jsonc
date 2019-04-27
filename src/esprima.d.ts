declare module 'esprima' {
    import * as ESTree from 'estree';

    export const version: string;

    export function parseScript(
        input: string,
        config?: IParseOptions,
        delegate?: (node: ESTree.Node, meta: any) => void,
    ): IProgram;
    export function parseModule(
        input: string,
        config?: IParseOptions,
        delegate?: (node: ESTree.Node, meta: any) => void,
    ): IProgram;
    export function tokenize(
        input: string,
        config?: ITokenizeOptions,
    ): IToken[];

    export interface IProgram extends ESTree.Program {
        tokens?: IToken[];
    }

    export interface IToken {
        type: string;
        value: string;
        range: [number, number];
    }

    export interface IParseOptions {
        jsx?: boolean;
        range?: boolean;
        loc?: boolean;
        tolerant?: boolean;
        tokens?: boolean;
        comment?: boolean;
    }

    export interface ITokenizeOptions {
        tolerant?: boolean;
        range?: boolean;
        loc?: boolean;
        comment?: boolean;
    }
}
