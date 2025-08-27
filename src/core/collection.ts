import { readDir } from '@loufa/loufairy-server';
import { EventEmitter } from 'events';
import path from 'path';
import { logger } from '@pictaccio/admin-api/core/logger';

export interface CollectionItem {
    file: string;
    obj?: any;
    imported: boolean;
    instance?: any;
}

export interface CollectionOptions {
    filter: RegExp,
    factory?: (file: string) => any
}

export class Collection extends EventEmitter {
    private _collection: { [key: string]: CollectionItem } = {};

    constructor(
        private _directory: string,
        private _options: CollectionOptions) {

        super();

        if (typeof this._options.factory !== 'function') {
            this._options.factory = async (file) => (await import(file)).default;
        }

        this._loadCollection().then(() => this.emit('ready', this));
    }

    /**
     * Iterate over the imports of the collection. Items that aren't imported will be skipped.
     */
    public *each(): Generator<CollectionItem> {
        for (const item of Object.values(this._collection)) {
            if (item.imported) {
                yield item;
            }
        }
    }

    /**
     * Call callable with each item in the collection
     * @param callable The function to call
     */
    public execEach(callable: (item: any) => void): void {
        for (const item of this.each()) {
            callable(item);
        }
    }

    /**
     * Import all files in the collection
     */
    public async importAll(): Promise<void> {
        for (const [name, item] of Object.entries(this._collection)) {
            logger.debug(`Importing ${item.file} from ${this._directory}`, {
                area: 'core',
                subarea: 'collection',
                action: 'loading-script',
                path: path.join(this._directory, item.file)
            });

            this._collection[name].obj = await this._options.factory(path.join(this._directory, item.file));
            this._collection[name].imported = true;
        }

        this.emit('imported-all', this);
    }

    /* PRIVATE */
    private async _loadCollection(): Promise<void> {
        for await (const file of readDir(this._directory, this._options.filter)) {
            this._collection[path.basename(file.name)] = { file: file.name, imported: false };
        }
    }
}
