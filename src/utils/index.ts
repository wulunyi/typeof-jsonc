export function isEmpty<T>(list: T[]) {
    return list.length === 0;
}

export function topItem<T>(list: T[]) {
    return list.slice(-1)[0] || undefined;
}

export function add(...params: number[]): number {
    return params.reduce((total, cur) => {
        return total + cur;
    }, 0);
}

export { format } from './format';

export { safeFn } from './safeFn';
