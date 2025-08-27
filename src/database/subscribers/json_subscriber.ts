import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { objectPropertiesIterator } from '@loufa/loufairy';
import { EntityMetadata } from 'typeorm/metadata/EntityMetadata';

@EventSubscriber()
export class JsonSubscriber implements EntitySubscriberInterface<any> {
    public afterLoad(entity: any): void {
        for (const prop of objectPropertiesIterator(entity, /.*_json$/)) {
            try {
                if (typeof entity[prop] === 'object') {
                    entity[prop.slice(0, -5)] = entity[prop];
                    entity[prop] = JSON.stringify(entity[prop]);
                } else {
                    entity[prop.slice(0, -5)] = JSON.parse(entity[prop]);
                }
            } catch (e) {
                // Pass
            }
        }
    }

    public beforeInsert(event: InsertEvent<any>): void {
        this._process(event.entity, event.metadata);
    }

    public beforeUpdate(event: UpdateEvent<any>): void {
        this._process(event.entity, event.metadata);
    }

    /* PRIVATE */
    private _process(entity: any, metadata: EntityMetadata): void {
        for (const prop of objectPropertiesIterator(entity, /.*_json$/)) {
            try {
                const columnMetadata = metadata.columns.find(item => item.propertyName === prop);
                if (columnMetadata.type !== 'json' || typeof entity[prop] !== 'string') {
                    continue;
                }
                entity[prop] = JSON.parse(entity[prop]);
            } catch (e) {
                // Pass
            }
        }
    }
}
