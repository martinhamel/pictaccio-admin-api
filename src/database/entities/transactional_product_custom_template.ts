import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { DataTableCreateRequest, DataTableUpdateRequest } from '@pictaccio/admin-api/database/helpers/data_table';
import { InvalidFormatError } from '@pictaccio/admin-api/errors/invalid_format_error';
import { CustomProductOptions } from '@pictaccio/admin-api/types/custom_product_options';
import { validateInternalNameCharacters } from '@pictaccio/shared/src/utils/internal_name_constraint';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    InsertQueryBuilder,
    PrimaryGeneratedColumn,
    QueryRunner, UpdateQueryBuilder
} from 'typeorm';

@Entity({ name: 'product_custom_templates', schema: 'transactional' })
export class TransactionalProductCustomTemplate extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_custom_templates_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('product_custom_templates_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public options: CustomProductOptions;

    @AllowOnWire
    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    public static async beforeCreate(request: DataTableCreateRequest<TransactionalProductCustomTemplate>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductCustomTemplate>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalProductCustomTemplate>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductCustomTemplate>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
