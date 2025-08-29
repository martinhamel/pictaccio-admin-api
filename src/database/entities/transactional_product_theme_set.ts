import { ConfigSchema } from '../../core/config_schema';
import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { TransactionalProduct } from '../../database/entities/transactional_product';
import { TransactionalProductTypeTheme } from '../../database/entities/transactional_product_type_theme';
import {
    DataTableCreateRequest,
    DataTableEntityMethods,
    DataTableUpdateRequest
} from '../../database/helpers/data_table';
import { InvalidFormatError } from '../../errors/invalid_format_error';
import { LocalizedString } from '../../types/localized_string';
import { StaticImplements } from '@pictaccio/shared/types/static_implements';
import { validateInternalNameCharacters } from '@pictaccio/shared/utils/internal_name_constraint';
import { Container } from 'typedi';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, Index, InsertQueryBuilder,
    PrimaryGeneratedColumn,
    QueryRunner,
    UpdateQueryBuilder
} from 'typeorm';

@Entity({ name: 'product_theme_sets', schema: 'transactional' })
export class TransactionalProductThemeSet
    extends BaseEntity
    implements StaticImplements<
        DataTableEntityMethods<TransactionalProductThemeSet>, typeof TransactionalProductThemeSet> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_theme_sets_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('product_theme_sets_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public themes: { [key: string]: LocalizedString };

    @AllowOnWire
    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    public scrubFlag: boolean;

    /* DATATABLE ENTITY METHODS */
    public static async beforeCreate(request: DataTableCreateRequest<TransactionalProductThemeSet>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalProductThemeSet>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalProductThemeSet>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalProductThemeSet>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }

        const scrub = request.values.find(item => item.column === 'scrubFlag')?.value;
        const themeId = request.filters.flat().find(filter => filter.column === 'id').operand.toString();
        let themes: Record<string, LocalizedString>;

        try {
            themes = request.values.find(item => item.column === 'themes')?.value;
        } catch {
            // Pass
        }

        if (!scrub) {
            return;
        }

        const original = await TransactionalProductThemeSet.findOne({ where: { id: themeId } });
        const affectedThemedProducts = await TransactionalProduct.createQueryBuilder()
            .select()
            .leftJoinAndSelect('TransactionalProduct.theme', 'TransactionalProductTypeTheme')
            .leftJoinAndSelect('TransactionalProductTypeTheme.themeSet', 'TransactionalProductThemeSet')
            .where('TransactionalProduct.type = :type', { type: 'themed' })
            .andWhere(`TransactionalProductThemeSet.id = :themeId`, { themeId })
            .getMany();
        const themeChanged: string[] = [];

        for (const [id, theme] of Object.entries(original.themes)) {
            if ((themes[id] && JSON.stringify(themes[id]) !== JSON.stringify(theme)) || !themes[id]) {
                themeChanged.push(id);
            }
        }

        for (const themedProduct of affectedThemedProducts) {
            for (const theme of themeChanged) {
                delete themedProduct.images[themedProduct.theme.themes_map[theme]];
                delete themedProduct.theme.themes_map[theme];
            }
            await themedProduct.save();
        }
    }
}
