import { StoreInterface } from '../core/store_interface';
import { UninitializedError } from '../errors/uninitialized_error';
import {
    AsyncStorageItem,
    AsyncStorageItemType,
    AsyncStorageItemTypeMap
} from '../types/async_storage_items';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Service } from 'typedi';

const asyncLocalStorage = new AsyncLocalStorage<
    Map<AsyncStorageItemType, AsyncStorageItemTypeMap[keyof AsyncStorageItemTypeMap]>>();

@Service('async-store')
export class AsyncStoreService implements StoreInterface<AsyncStorageItemTypeMap> {
    public init(): void {
        asyncLocalStorage.enterWith(new Map());
    }

    public has<Tkey extends keyof AsyncStorageItemTypeMap>(key: Tkey): boolean {
        const store = asyncLocalStorage.getStore();

        if (!store) {
            throw new UninitializedError('Async store is not initialized, have you called init()?');
        }

        return store.has(key);
    }

    public get<Tkey extends keyof AsyncStorageItemTypeMap>(key: Tkey): AsyncStorageItem<Tkey> {
        const store = asyncLocalStorage.getStore();

        if (!store) {
            throw new UninitializedError('Async store is not initialized, have you called init()?');
        }

        return store.get(key) as AsyncStorageItem<Tkey>;
    }

    public set<Tkey extends keyof AsyncStorageItemTypeMap>(key: Tkey,
        value: AsyncStorageItem<Tkey>): void {
        const store = asyncLocalStorage.getStore();

        if (!store) {
            throw new UninitializedError('Async store is not initialized, have you called init()?');
        }

        store.set(key, value);
    }

    public remove<Tkey extends keyof AsyncStorageItemTypeMap>(key: Tkey): void {
        const store = asyncLocalStorage.getStore();

        if (!store) {
            throw new UninitializedError('Async store is not initialized, have you called init()?');
        }

        store.delete(key);
    }
}
