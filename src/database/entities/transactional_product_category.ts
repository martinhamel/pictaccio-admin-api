import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { DataTableCreateRequest, DataTableUpdateRequest } from '@pictaccio/admin-api/database/helpers/data_table';
import { InvalidFormatError } from '@pictaccio/admin-api/errors/invalid_format_error';
import { LocalizedString } from '@pictaccio/admin-api/types/localized_string';
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    InsertQueryBuilder,
    PrimaryGeneratedColumn,
    QueryRunner,
    UpdateQueryBuilder
} from 'typeorm';
import { validateInternalNameCharacters } from '@pictaccio/shared/src/utils/internal_name_constraint';

@Entity({ name: 'product_categories', schema: 'transactional' })
export class TransactionalProductCategory extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_categories_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('product_categories_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public name_locale: LocalizedString;

    @AllowOnWire
    @Column({ type: 'int' })
    public priority: number;

    /* DATATABLE ENTITY METHODS */
    public static async beforeCreate(request: DataTableCreateRequest<TransactionalProductCategory>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductCategory>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalProductCategory>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductCategory>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
