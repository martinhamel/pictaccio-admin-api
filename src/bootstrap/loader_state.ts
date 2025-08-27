import { createPromiseTimeout } from '@pictaccio/admin-api/core/utils';
import { LoaderError } from '@pictaccio/admin-api/errors/loader_error';

type Offers = { [index: string]: (...args: any[]) => unknown }
type WaitingOnOffers = [{ valueName: string, args: any[], resolve: (value: any) => void, reject: (value: any) => void }];

export class LoaderState {
    private readonly _offers: Offers;
    private _waitingOnOffers: WaitingOnOffers;

    constructor() {
        this._offers = {};
        this._waitingOnOffers = <WaitingOnOffers><unknown>[];
    }

    /**
     * Offer a state
     * @param offerName Name of the value on offer
     * @param callback Callback to calculate the current value
     */
    public offer(offerName: string, callback: (...args) => unknown): void {
        if (this._offers[offerName] !== undefined) {
            throw new LoaderError(`${offerName} already on offer`);
        }

        this._offers[offerName] = callback;

        for (let i = this._waitingOnOffers.length - 1; i >= 0; --i) {
            if (this._waitingOnOffers[i].valueName === offerName) {
                this._waitingOnOffers[i].resolve(callback(...this._waitingOnOffers[i].args || []));
                this._waitingOnOffers.slice(i, 1);
            }
        }
    }

    /**
     * Request a state
     * @param valueName Name of the value requested
     * @param args? [Optional] Any argument to be password the the value callback
     */
    public async request(valueName: string, ...args: unknown[]): Promise<any> {
        if (this._offers[valueName] !== undefined) {
            return Promise.resolve(this._offers[valueName](...args));
        } else {
            try {
                return await createPromiseTimeout(30000, new Promise<any>((resolve, reject) => {
                    this._waitingOnOffers.push({
                        valueName,
                        args,
                        resolve,
                        reject
                    });
                }));
            } catch (error) {
                if (error === 'timeout') {
                    throw new LoaderError(`Timout: Unmet dependency '${valueName}'`);
                }

                throw new Error(error);
            }
        }
    }
}
