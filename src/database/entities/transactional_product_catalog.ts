import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { TransactionalProduct } from '../../database/entities/transactional_product';
import {
    TransactionalProductCatalogRank
} from '../../database/entities/transactional_product_catalog_rank';
import {
    DataTableCreateRequest,
    DataTableEntityMethods,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '../../database/helpers/data_table';
import { InvalidFormatError } from '../../errors/invalid_format_error';
import { LocalizedString } from '../../types/localized_string';
import { StaticImplements } from '@pictaccio/shared/types/static_implements';
import { validateInternalNameCharacters } from '@pictaccio/shared/utils/internal_name_constraint';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    InsertQueryBuilder,
    InsertResult,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    QueryRunner,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@Entity({ name: 'product_catalogs', schema: 'transactional' })
export class TransactionalProductCatalog
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalProductCatalog>,
        typeof TransactionalProductCatalog> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_catalogs_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('product_catalogs_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public name_locale: LocalizedString;

    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @AllowOnWire
    @ManyToMany(() => TransactionalProductCatalogRank, order => order.catalogs, { cascade: true })
    @JoinTable({
        name: 'product_catalog_product_catalog_ranks_map',
        joinColumn: {
            name: 'product_catalog_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_catalog_id_fkey'
        },
        inverseJoinColumn: {
            name: 'product_catalog_rank_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_catalog_rank_id_fkey'
        }
    })
    public ranks: TransactionalProductCatalogRank[];

    @AllowOnWire
    @ManyToMany(() => TransactionalProduct, product => product.catalogs, { cascade: true })
    @JoinTable({
        name: 'product_catalogs_products_map',
        joinColumn: {
            name: 'product_catalog_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_catalog_id_fkey'
        },
        inverseJoinColumn: {
            name: 'product_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_id_fkey'
        }
    })
    public products: TransactionalProduct[];

    /* DATATABLE ENTITY METHODS */
    public static async afterCreate(request: DataTableCreateRequest<TransactionalProductCatalog>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductCatalog>,
        result: InsertResult): Promise<void> {
        const productColumn = request.values.find(value => value.column === 'products');

        if (productColumn?.value) {
            let ranks: TransactionalProductCatalogRank[] = [];

            for (let i = 0; i < productColumn.value.length; i++) {
                const rank = new TransactionalProductCatalogRank();

                rank.rank = i;
                rank.product_id = productColumn.value[i];
                ranks.push(rank);
            }

            ranks = await TransactionalProductCatalogRank.save(ranks);

            await query.relation('products')
                .of(result.identifiers[0].id)
                .add(productColumn.value.map(id => ({ id: parseInt(id, 10) })));

            await query.relation('ranks')
                .of(result.identifiers[0].id)
                .add(ranks);
        }
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalProductCatalog>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductCatalog>,
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
                .filter(product => !productColumn.value.includes(parseInt(product.id.toString(), 10)))
                .map(product => parseInt(product.id.toString(), 10));
            const oldRanks = await query.relation('ranks')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalProductCatalogRank>();
            let newRanks: TransactionalProductCatalogRank[] = [];

            for (let i = 0; i < productColumn.value.length; i++) {
                const rank = new TransactionalProductCatalogRank();

                rank.rank = i;
                rank.product_id = productColumn.value[i];
                newRanks.push(rank);
            }

            newRanks = await TransactionalProductCatalogRank.save(newRanks);

            await query.relation('products')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedProducts, removedProducts);
            await query.relation('ranks')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(newRanks, oldRanks);
            await runner.manager.getRepository(TransactionalProductCatalogRank).remove(oldRanks);
        }
    }

    public static async beforeRead(request: DataTableReadRequest<TransactionalProductCatalog>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalProductCatalog>): Promise<void> {
        query.leftJoinAndSelect('TransactionalProductCatalog.products', 'TransactionalProduct');
        query.leftJoinAndSelect('TransactionalProductCatalog.ranks', 'TransactionalProductCatalogRank');

        if (request.filters) {
            const productIdFilter = request.filters
                .flat().find(filter => filter.column === '_product_id');

            if (productIdFilter) {
                query.andWhere('TransactionalProduct.id = :productId', {
                    productId: productIdFilter.operand
                });
            }
        }
    }

    public static async beforeCreate(request: DataTableCreateRequest<TransactionalProductCatalog>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductCatalog>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalProductCatalog>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductCatalog>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
