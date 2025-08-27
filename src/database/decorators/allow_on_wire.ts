import { getMetadata } from '@pictaccio/admin-api/database/decorators/metadata';
import { BaseEntity } from 'typeorm';

export function AllowOnWire(target: any, propertyKey: string): void {
    const modelMetadata = getMetadata(target.constructor);
    modelMetadata.allowedOnWire.push(propertyKey as keyof BaseEntity);
}
