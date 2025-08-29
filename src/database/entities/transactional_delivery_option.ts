import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { DataTableCreateRequest, DataTableUpdateRequest } from '../../database/helpers/data_table';
import { floatTransformer } from '../../database/helpers/transformers/float_transformer';
import { InvalidFormatError } from '../../errors/invalid_format_error';
import { LocalizedString } from '../../types/localized_string';
import { DeliveryMethod, DeliveryMethods } from '@pictaccio/shared/types/delivery_method';
import { DeliveryMethodOptions } from '@pictaccio/shared/types/delivery_method_options';
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
import { validateInternalNameCharacters } from '@pictaccio/shared/utils/internal_name_constraint';

@Entity({ name: 'delivery_options', schema: 'transactional' })
export class TransactionalDeliveryOption extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'delivery_options_id_pkey' })
    public id: string;

    @AllowOnWire
    @Column({ type: 'text', unique: true })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public name_locale: LocalizedString;

    @AllowOnWire
    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: floatTransformer })
    public base_price: string;

    @AllowOnWire
    @Column({ type: 'int' })
    public lead_time: number;

    @AllowOnWire
    @Index('delivery_options_method_idx')
    @Column({ type: 'enum', enum: DeliveryMethods })
    public method: DeliveryMethod;

    @AllowOnWire
    @Column({ type: 'jsonb', nullable: true })
    public options: DeliveryMethodOptions;

    /* DATATABLE ENTITY METHODS */
    public static async beforeCreate(request: DataTableCreateRequest<TransactionalDeliveryOption>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalDeliveryOption>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalDeliveryOption>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalDeliveryOption>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
