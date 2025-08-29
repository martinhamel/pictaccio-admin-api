import { isMainThread, threadId } from 'worker_threads';
import { LoaderInterface } from '../bootstrap/loader_interface';
import { LoaderState } from '../bootstrap/loader_state';
import { logger } from '../core/logger';

export const loaderState: LoaderState = new LoaderState();

export class Bootstraper {
    private _loaders: LoaderInterface[];
    /**
     * @param loaders Array of loaders to load
     */
    constructor(loaders: LoaderInterface[]) {
        this._loaders = loaders;
    }

    /**
     * Load the loaders in parallel
     *
     * @returns Promise that is resolved when all the loaders have finished loading
     */
    public run(): Promise<any> {
        return this._runInSequence();
    }

    /* PRIVATE */

    /**
     * Actually does the parallel loading of the loaders
     *
     * @returns Promise that is resolved when all the loaders have finished loading
     * @private
     */
    private async _runInSequence(): Promise<any> {
        for (const loader of this._loaders) {
            const threadString = isMainThread
                ? 'the main thread'
                : `thread ${threadId}`;
            logger.info(`Loading module ${loader.name.replace('Loader', '')} in ${threadString}`, {
                area: 'bootstrap',
                subarea: 'bootstrap',
                action: 'loading-module',
                module: loader.name.replace('Loader', ''),
                threadId
            });
            await loader(loaderState);
        }
    }
}
