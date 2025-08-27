import { BaseEntity } from 'typeorm';

const metadata = new WeakMap<BaseEntityConstraint<BaseEntity>, ModelMetadata<any>>();

interface BaseEntityConstraint<T extends BaseEntity> {
    new (): T;
}

class Upload<T extends BaseEntity> {
    public allowedMimes: RegExp[] = [];
    public allowMultiple: boolean;
    public maxSizeInBytes: number;
    public path: string;
    public prefix: string;
}

export class ModelMetadata<T extends BaseEntity> {
    public allowedOnWire: (keyof T)[] = [] as (keyof T)[];
    public allowedUploads: {[Property in keyof T]: Upload<T>} = {} as {[Property in keyof T]: Upload<T>};
}

export function getMetadata<T extends BaseEntity>(model: BaseEntityConstraint<T>): ModelMetadata<T> {
    if (!metadata.has(model)) {
        metadata.set(model, new ModelMetadata<T>());
    }

    return metadata.get(model);
}
