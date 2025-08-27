import { BadRequestError } from '@loufa/routing-controllers';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { AllowUploads } from '@pictaccio/admin-api/database/decorators/allow_uploads';
import { AdminDanglingAsset } from '@pictaccio/admin-api/database/entities/admin_dangling_asset';
import { AdminTag } from '@pictaccio/admin-api/database/entities/admin_tag';
import { TransactionalProductCatalog } from '@pictaccio/admin-api/database/entities/transactional_product_catalog';
import { TransactionalProductCategory } from '@pictaccio/admin-api/database/entities/transactional_product_category';
import {
    TransactionalProductCustomTemplate
} from '@pictaccio/admin-api/database/entities/transactional_product_custom_template';
import { TransactionalProductThemeSet } from '@pictaccio/admin-api/database/entities/transactional_product_theme_set';
import {
    TransactionalProductTypeCustom
} from '@pictaccio/admin-api/database/entities/transactional_product_type_custom';
import { TransactionalProductTypeTheme } from '@pictaccio/admin-api/database/entities/transactional_product_type_theme';
import {
    DataTableCreateRequest,
    DataTableDeleteRequest,
    DataTableEntityMethods,
    DataTableOverrideResult,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
import {
    formatTags,
    queryObjectsByTag, queryObjectsByTags,
    queryTagObjects,
    queryTagsForObjects
} from '@pictaccio/admin-api/database/helpers/object_tags';
import { floatTransformer } from '@pictaccio/admin-api/database/helpers/transformers/float_transformer';
import { InvalidFormatError } from '@pictaccio/admin-api/errors/invalid_format_error';
import { LocalizedString } from '@pictaccio/admin-api/types/localized_string';
import { ProductOptions } from '@pictaccio/shared/src/types/product_options';
import { ProductType, ProductTypes } from '@pictaccio/shared/src/types/product_type';
import { StaticImplements } from '@pictaccio/shared/src/types/static_implements';
import { isTag } from '@pictaccio/shared/src/utils/guards/is_tag';
import { validateInternalNameCharacters } from '@pictaccio/shared/src/utils/internal_name_constraint';
import { Container } from 'typedi';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteQueryBuilder,
    Entity,
    In,
    Index,
    InsertQueryBuilder,
    InsertResult,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    QueryRunner,
    Relation,
    UpdateDateColumn,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

@Entity({ name: 'products', schema: 'transactional' })
export class TransactionalProduct
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalProduct>, typeof TransactionalProduct> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'products_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('products_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public name_locale: LocalizedString;

    @AllowOnWire
    @Index('products_archived_idx')
    @Column({ type: 'boolean' })
    public archived: boolean;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public description_locale: LocalizedString;

    @AllowOnWire
    @AllowUploads({ path: config.app.dirs.products, mimes: 'image/*', prefix: 'product' })
    @Column({ type: 'jsonb' })
    public images: { [key: string]: string };

    @AllowOnWire
    @Column({ type: 'jsonb', default: '{}' })
    public options: ProductOptions;

    @AllowOnWire
    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: floatTransformer })
    public price: number;

    @AllowOnWire
    @Column({ type: 'int' })
    public priority: number;

    @AllowOnWire
    @Index('products_type_idx')
    @Column({ type: 'enum', default: 'normal', enum: ProductTypes })
    public type: ProductType;

    @AllowOnWire
    @Column({ type: 'int' })
    public weight: number;

    @AllowOnWire
    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @AllowOnWire
    @UpdateDateColumn({ type: 'timestamp' })
    public modified_on: Date;

    @ManyToMany(() => TransactionalProductCatalog, productCatalog => productCatalog.products)
    public catalogs: TransactionalProductCatalog[];

    @ManyToOne(() => TransactionalProductCategory, { cascade: true })
    @JoinColumn({ name: 'category_id', foreignKeyConstraintName: 'product_category_id_fkey' })
    public category: TransactionalProductCategory;

    @AllowOnWire
    public tags: AdminTag[];

    @OneToOne(() => TransactionalProductTypeTheme,
        { cascade: true, nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'theme_id', foreignKeyConstraintName: 'product_theme_id_fkey' })
    public theme: Relation<TransactionalProductTypeTheme>;

    @OneToOne(() => TransactionalProductTypeCustom,
        { cascade: true, nullable: true })
    @JoinColumn({ name: 'custom_id', foreignKeyConstraintName: 'product_custom_id_fkey' })
    public custom: Relation<TransactionalProductTypeCustom>;

    /* DATATABLE ENTITY METHODS */
    public static async afterCreate(request: DataTableCreateRequest<TransactionalProduct>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProduct>,
        result: InsertResult): Promise<void> {
        const productCatalogColumn = request.values.find(value => value.column === 'catalogs');
        const productCategoryColumn = request.values.find(value => value.column === 'category');
        const productTypeColumn = request.values.find(value => value.column === 'type');
        const productInsertId = result.identifiers[0].id;
        const tags = request.values.find(value => value.column === '_tags')?.value;

        if (productCatalogColumn?.value) {
            await query.relation('catalogs')
                .of(productInsertId)
                .add(productCatalogColumn.value.map(id => ({ id: parseInt(id, 10) })));
        }

        if (productCategoryColumn?.value) {
            await query.relation('category')
                .of(productInsertId)
                .set(parseInt(productCategoryColumn.value, 10));
        }

        if (productTypeColumn?.value === 'themed') {
            const productDefaultThemeColumn = request.values.find(value => value.column === '_default_theme');
            const productThemeMapColumn = request.values.find(value => value.column === '_themes_map');
            const productThemeSetColumn = request.values.find(value => value.column === '_themeSet');
            const themedProduct = runner.manager.getRepository(TransactionalProductTypeTheme).create();

            if (!productThemeMapColumn?.value || !productThemeSetColumn?.value) {
                throw new InvalidFormatError('Theme map or theme set');
            }

            themedProduct.product = { id: productInsertId } as TransactionalProduct;
            themedProduct.default_theme = productDefaultThemeColumn.value ?? null;
            themedProduct.themes_map = productThemeMapColumn.value;
            themedProduct.themeSet = { id: productThemeSetColumn.value } as TransactionalProductThemeSet;

            await themedProduct.save();
            await query.relation('theme').of(productInsertId).set(themedProduct);
        }

        if (productTypeColumn?.value === 'custom') {
            const productCustomTemplateColumn = request.values.find(value => value.column === '_customTemplate');
            const customProduct = runner.manager.getRepository(TransactionalProductTypeCustom).create();

            if (!productCustomTemplateColumn?.value) {
                throw new InvalidFormatError('Custom template');
            }

            customProduct.product = { id: productInsertId } as TransactionalProduct;
            customProduct.customTemplate = { id: productCustomTemplateColumn.value } as TransactionalProductCustomTemplate;

            await customProduct.save();
            await query.relation('custom').of(productInsertId).set(customProduct);
        }

        if (tags) {
            if (!Array.isArray(tags) || !tags.every(tag => isTag(tag))) {
                throw new BadRequestError('Invalid tags');
            }

            await queryTagObjects(
                runner,
                result.identifiers.map(i => ({ id: i.id }) as TransactionalProduct),
                tags.map(tag => ({ ...tag, id: tag.id.toString() }))
            );
        }
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalProduct>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProduct>,
        result: UpdateResult): Promise<void> {
        const catalogColumn = request.values.find(value => value.column === 'catalogs');
        const categoryColumn = request.values.find(value => value.column === 'category');
        const themeColumn = request.values.find(value => value.column === '_themeSet');
        const customColumn = request.values.find(value => value.column === '_customTemplate');
        const tags = request.values.find(value => value.column === '_tags')?.value;

        if (catalogColumn?.value) {
            const previousProductCatalogs = await query.relation('catalogs')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalProductCatalog>();
            const addedProductCatalogs = catalogColumn.value
                .filter(id => !previousProductCatalogs
                    .find(catalog => parseInt(catalog.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedProductCatalogs = previousProductCatalogs
                .filter(catalog => !catalogColumn.value.includes(catalog.id.toString()))
                .map(catalog => parseInt(catalog.id.toString(), 10));

            await query.relation('catalogs')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedProductCatalogs, removedProductCatalogs);
        }

        if (categoryColumn?.value) {
            await query.relation('category')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .set(parseInt(categoryColumn.value, 10));
        }

        if (themeColumn?.value) {
            const previousProductTheme = await query.relation('theme')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadOne<TransactionalProductTypeTheme>();
            const productTheme = await runner.manager.getRepository(TransactionalProductTypeTheme)
                .findOneOrFail({
                    where: {
                        id: previousProductTheme.id
                    }
                });

            if (!previousProductTheme) {
                throw new InvalidFormatError('Theme');
            }

            productTheme.default_theme = request.values.find(value => value.column === '_default_theme')?.value ?? null;
            productTheme.themes_map = request.values.find(value => value.column === '_themes_map').value;
            productTheme.themeSet = { id: themeColumn.value } as TransactionalProductThemeSet;

            await productTheme.save();
        }

        if (customColumn?.value) {
            const previousProductCustom = await query.relation('custom')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadOne<TransactionalProductTypeCustom>();
            const productCustom = await runner.manager.getRepository(TransactionalProductTypeCustom)
                .findOneOrFail({
                    where: {
                        id: previousProductCustom.id
                    }
                });

            if (!previousProductCustom) {
                throw new InvalidFormatError('Custom');
            }

            productCustom.customTemplate = { id: customColumn.value } as TransactionalProductCustomTemplate;

            await productCustom.save();
        }

        if (tags) {
            const requestId = request.values.find(i => i.column === 'id')?.value;

            if (!Array.isArray(tags) || !tags.every(tag => isTag(tag))) {
                throw new BadRequestError('Invalid tags');
            }

            if (!requestId) {
                throw new BadRequestError('Invalid request missing id');
            }

            await queryTagObjects(
                runner,
                [({ id: requestId } as TransactionalProduct)],
                tags.map(tag => ({ ...tag, id: tag.id.toString() }))
            );
        }
    }

    public static async beforeCreate(request: DataTableCreateRequest<TransactionalProduct>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProduct>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }

        if (!query.expressionMap.valuesSet['price']) {
            throw new InvalidFormatError('Price');
        }

        if (!query.expressionMap.valuesSet['weight']) {
            query.expressionMap.valuesSet['weight'] = '0';
        }

        if (!query.expressionMap.valuesSet['priority']) {
            query.expressionMap.valuesSet['priority'] = '0';
        }

        if (query.expressionMap.valuesSet['options'].usePriceScale) {
            query.expressionMap.valuesSet['options'].priceScale
                = query.expressionMap.valuesSet['options'].priceScale.map(price => parseInt(price, 10));
        }
    }

    public static async beforeRead(request: DataTableReadRequest<TransactionalProduct>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalProduct>): Promise<void> {
        query.leftJoinAndSelect('TransactionalProduct.catalogs', 'TransactionalProductCatalog')
            .leftJoinAndSelect('TransactionalProduct.category', 'TransactionalProductCategory')
            .leftJoinAndSelect('TransactionalProduct.theme', 'TransactionalProductTypeTheme')
            .leftJoinAndSelect('TransactionalProduct.custom', 'TransactionalProductTypeCustom')
            .leftJoinAndSelect('TransactionalProductTypeTheme.themeSet', 'TransactionalProductThemeSet')
            .leftJoinAndSelect('TransactionalProductTypeCustom.customTemplate', 'TransactionalProductCustomTemplate');

        queryTagsForObjects(query, TransactionalProduct, 'product');

        if (request.filters) {
            const productCategoryFilter = request.filters
                .flat().find(filter => filter.column === 'category');
            const productTypeFilter = request.filters
                .flat().find(filter => filter.column === 'type');
            const tagsFilter = request.filters
                .flat().find(filter => filter.column === '_tags');

            if (productTypeFilter) {
                query.andWhere('TransactionalProduct.type = :type', {
                    type: productTypeFilter.operand
                });
            }

            if (productCategoryFilter) {
                query.andWhere('TransactionalProduct.category = :category', {
                    category: productCategoryFilter.operand
                });
            }

            if (tagsFilter) {
                tagsFilter.operand.length === 1
                    ? queryObjectsByTag(query,
                        TransactionalProduct,
                        formatTags(tagsFilter.operand[0].map(o => o.toString()), 'product')[0])
                    : queryObjectsByTags(query,
                        TransactionalProduct,
                        formatTags(tagsFilter.operand[0].map(o => o.toString()), 'product'));
            }
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalProduct>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProduct>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }

        if (request.values.find(value => value.column === 'images')) {
            const newImages: string[] = Object.values(request.values.find(value => value.column === 'images').value);
            const idFilter = request.filters.flat().find(filter => filter.column === 'id');
            const affected = await runner.manager.getRepository(TransactionalProduct).find({
                where: {
                    id: idFilter.operator === 'IN'
                        ? In(idFilter.operand.map(id => id.toString()))
                        : idFilter.operand.toString()
                }
            });

            const danglingAssets: AdminDanglingAsset[] = [];

            for (const product of affected) {
                if (Object.values(product.images).every(image => newImages.includes(image))) {
                    continue;
                }

                for (const image of Object.values(product.images)) {
                    if (!newImages.includes(image)) {
                        const danglingAsset = new AdminDanglingAsset();

                        danglingAsset.type = 'product';
                        danglingAsset.path = image;

                        danglingAssets.push(danglingAsset);
                    }
                }
            }

            await runner.manager.getRepository(AdminDanglingAsset).save(danglingAssets);
        }
    }

    public static async overrideDelete(request: DataTableDeleteRequest<TransactionalProduct>,
        runner: QueryRunner,
        query: DeleteQueryBuilder<TransactionalProduct>)
        : Promise<DataTableOverrideResult<TransactionalProduct>> {
        const idFilter = request.filters.flat().find(filter => filter.column === 'id');
        const result = await TransactionalProduct.update({
            id: idFilter.operator === 'IN'
                ? In(idFilter.operand.map(id => parseInt(id, 10)))
                : idFilter.operand.toString()
        }, {
            archived: true
        });

        return {
            operation: 'update',
            affected: result.affected
        };
    }

    /* PRIVATE */
    private static _getProductCatalogIds(request: DataTableUpdateRequest<TransactionalProduct> |
        DataTableCreateRequest<TransactionalProduct>): number[] {
        return request.values.find(value => value.column === 'options').value['productCatalog']
            .map(i => parseInt(i.toString(), 10));
    }

    private static _getCreatedProductId(result: InsertResult) {
        return result.identifiers.find(i => Object.keys(i).includes('id'))['id'];
    }
}
