import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { TransactionalDeliveryOption } from '@pictaccio/admin-api/database/entities/transactional_delivery_option';
import {
    DataTableCreateRequest,
    DataTableEntityMethods,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
import { InvalidFormatError } from '@pictaccio/admin-api/errors/invalid_format_error';
import { StaticImplements } from '@pictaccio/shared/src/types/static_implements';
import { validateInternalNameCharacters } from '@pictaccio/shared/src/utils/internal_name_constraint';
import {
    BaseEntity,
    Column,
    Entity, Index,
    InsertQueryBuilder,
    InsertResult,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn, QueryRunner,
    SelectQueryBuilder,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';

@Entity({ name: 'delivery_option_groups', schema: 'transactional' })
export class TransactionalDeliveryOptionGroup
    extends BaseEntity
    implements StaticImplements<
        DataTableEntityMethods<TransactionalDeliveryOptionGroup>, typeof TransactionalDeliveryOptionGroup> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'delivery_option_groups_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('delivery_option_groups_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @ManyToMany(() => TransactionalDeliveryOption, { cascade: true })
    @JoinTable({
        name: 'delivery_option_groups_delivery_options_map',
        joinColumn: {
            name: 'delivery_option_group_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'delivery_option_group_id_fkey'
        },
        inverseJoinColumn: {
            name: 'delivery_option_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'delivery_option_id_fkey'
        }
    })
    public deliveryOptions: number[];

    /* DATATABLE ENTITY METHODS */
    public static async afterCreate(request: DataTableCreateRequest<TransactionalDeliveryOptionGroup>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalDeliveryOptionGroup>,
        result: InsertResult): Promise<void> {

        const deliveryOptionColumn = request.values.find(item => item.column === 'deliveryOptions');

        if (deliveryOptionColumn?.value) {
            await query.relation('deliveryOptions')
                .of(result.identifiers[0].id)
                .add(deliveryOptionColumn.value.map(id => ({ id: parseInt(id, 10) })));
        }
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalDeliveryOptionGroup>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalDeliveryOptionGroup>,
        result: UpdateResult): Promise<void> {
        const deliveryOptionsColumn = request.values.find(value => value.column === 'deliveryOptions');

        if (deliveryOptionsColumn?.value) {
            const previousDeliveries = await query.relation('deliveryOptions')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalDeliveryOption>();
            const addedDeliveries = deliveryOptionsColumn.value
                .filter(id => !previousDeliveries
                    .find(delivery => parseInt(delivery.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedDeliveries = previousDeliveries
                .filter(delivery => !deliveryOptionsColumn.value.includes(delivery.id.toString()))
                .map(delivery => parseInt(delivery.id.toString(), 10));

            await query.relation('deliveryOptions')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedDeliveries, removedDeliveries);
        }
    }

    public static async beforeRead(request: DataTableReadRequest<TransactionalDeliveryOptionGroup>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalDeliveryOptionGroup>): Promise<void> {
        query.leftJoinAndSelect('TransactionalDeliveryOptionGroup.deliveryOptions', 'TransactionalDeliveryOption');

        if (request.filters) {
            const deliveryOptionIdFilter = request.filters
                .flat().find(filter => filter.column as string === '_delivery_option_id');

            if (deliveryOptionIdFilter) {
                query.andWhere('TransactionalDeliveryOption.id = :deliveryOptionId', {
                    deliveryOptionId: deliveryOptionIdFilter.operand
                });
            }
        }
    }

    public static async beforeCreate(request: DataTableCreateRequest<TransactionalDeliveryOptionGroup>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalDeliveryOptionGroup>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalDeliveryOptionGroup>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalDeliveryOptionGroup>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
