// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPromiseLike(maybePromise: any): maybePromise is Promise<any> {
    return maybePromise !== null &&
        maybePromise !== undefined &&
        typeof maybePromise === 'object' &&
        typeof maybePromise.then === 'function';
}
