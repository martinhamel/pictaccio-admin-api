import { LoaderState } from '../bootstrap/loader_state';

/**
 * Decorate a method meant to be offered as a LoaderState state
 * @param state LoaderState where the state will be offered
 */
export function exportState(state: LoaderState): any {
    return (object: any, propertyName: string): any => {
        const objectName =
            typeof object.constructor === 'function' && object.constructor.name !== 'Function' ?
                object.constructor.name :
                object.name;
        state.offer(
            `${objectName}.${propertyName}`,
            (args) => {
                return object[propertyName](...args || []);
            });
    };
}
