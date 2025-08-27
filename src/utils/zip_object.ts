export function zipOpject(keys: (number | string | symbol)[], values: any[]): {[key: number | string | symbol]: any} {
    if (keys.length !== values.length) {
        throw new Error('Arrays length mismatch');
    }

    const object = {};

    for (let i = 0; i < keys.length; i++) {
        object[keys[i]] = values[i];
    }

    return object;
}
