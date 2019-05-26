export function safeFn<T>(fn: T) {
    if (typeof fn === 'function') {
        return fn;
    }

    return () => void 0;
}
