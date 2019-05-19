export declare function safeFn<T>(fn: T): (T & Function) | (() => undefined);
