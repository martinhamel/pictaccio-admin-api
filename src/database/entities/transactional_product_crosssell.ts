import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { TransactionalProduct } from '../../database/entities/transactional_product';
import {
    DataTableCreateRequest,
    DataTableEntityMethods,
    DataTableReadRequest, DataTableUpdateRequest
} from '../../database/helpers/data_table';
import { InvalidFormatError } from '../../errors/invalid_format_error';
import { ProductCrosssellOptions } from '../../types/product_cross_sell_options';
import { StaticImplements } from '@pictaccio/shared/types/static_implements';
import { validateInternalNameCharacters } from '@pictaccio/shared/utils/internal_name_constraint';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, In, Index, InsertQueryBuilder, InsertResult, JoinTable, ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn, QueryRunner,
    UpdateDateColumn, UpdateQueryBuilder, UpdateResult
} from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@Entity({ name: 'product_crosssells', schema: 'transactional' })
export class TransactionalProductCrosssell
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalProductCrosssell>,
        typeof TransactionalProductCrosssell> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_crosssells_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('product_crosssells_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public options: ProductCrosssellOptions;

    @AllowOnWire
    @ManyToMany(() => TransactionalProduct,
        { cascade: true, eager: true })
    @JoinTable({
        name: 'product_crosssells_products_map',
        joinColumn: {
            name: 'product_crosssell_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_crosssell_id_fkey'
        },
        inverseJoinColumn: {
            name: 'product_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_id_fkey'
        }
    })
    public products: TransactionalProduct[];

    /* DATATABLE ENTITY METHODS */
    public static async afterCreate(request: DataTableCreateRequest<TransactionalProductCrosssell>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductCrosssell>,
        result: InsertResult): Promise<void> {
        const productColumn = request.values.find(value => value.column === 'products');

        if (productColumn?.value) {
            await query.relation('products')
                .of(result.identifiers[0].id)
                .add(productColumn.value.map(id => ({ id: parseInt(id, 10) })));
        }
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalProductCrosssell>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductCrosssell>,
        result: UpdateResult): Promise<void> {
        const productColumn = request.values.find(value => value.column === 'products');

        if (productColumn?.value) {
            const previousProducts = await query.relation('products')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalProduct>();
            const addedProducts = productColumn.value
                .filter(id => !previousProducts
                    .find(product => parseInt(product.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedProducts = previousProducts
                .filter(product => !productColumn.value.includes(product.id.toString()))
                .map(product => parseInt(product.id.toString(), 10));

            await query.relation('products')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedProducts, removedProducts);
        }
    }

    public static async beforeRead(request: DataTableReadRequest<TransactionalProductCrosssell>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalProductCrosssell>): Promise<void> {
        query.leftJoinAndSelect('TransactionalProductCrosssell.products', 'TransactionalProduct');

        if (request.filters) {
            const productIdFilter = request.filters
                .flat().find(filter => filter.column as string === '_product_id');

            if (productIdFilter) {
                query.andWhere('TransactionalProduct.id = :productId', {
                    productId: productIdFilter.operand
                });
            }
        }
    }

    public static async beforeCreate(request: DataTableCreateRequest<TransactionalProductCrosssell>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductCrosssell>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalProductCrosssell>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductCrosssell>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
