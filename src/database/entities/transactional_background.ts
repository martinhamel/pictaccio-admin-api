import { BadRequestError } from '@loufa/routing-controllers';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { AllowUploads } from '@pictaccio/admin-api/database/decorators/allow_uploads';
import { AdminDanglingAsset } from '@pictaccio/admin-api/database/entities/admin_dangling_asset';
import { AdminTag } from '@pictaccio/admin-api/database/entities/admin_tag';
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
import { PubsubService } from '@pictaccio/admin-api/services/pubsub_service';
import { LocalizedString } from '@pictaccio/admin-api/types/localized_string';
import { AllProductionIdentifier } from '@pictaccio/shared/src/types/all_production_identifier';
import { StaticImplements } from '@pictaccio/shared/src/types/static_implements';
import { isTag } from '@pictaccio/shared/src/utils/guards/is_tag';
import { Container } from 'typedi';
import {
    BaseEntity,
    Column,
    DeleteQueryBuilder,
    Entity,
    In,
    Index,
    InsertQueryBuilder,
    InsertResult,
    PrimaryGeneratedColumn,
    QueryRunner,
    SelectQueryBuilder,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

@Entity({ name: 'backgrounds', schema: 'transactional' })
export class TransactionalBackground
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalBackground>, typeof TransactionalBackground> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'backgrounds_id_pkey' })
    public id: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public name_locale: LocalizedString;

    @AllowOnWire
    @Index('backgrounds_archived_idx')
    @Column({ type: 'boolean' })
    public archived: boolean;

    @AllowOnWire
    @Index('backgrounds_categories_idx', { synchronize: false })
    @Column({ type: 'jsonb' })
    public categories: number[];

    @AllowOnWire
    @Index('backgrounds_featured_idx')
    @Column({ type: 'boolean' })
    public featured: boolean;

    @AllowOnWire
    @AllowUploads({ path: config.app.dirs.backgrounds, mimes: 'image/*' })
    @Column({ type: 'text' })
    public image: string;

    @AllowOnWire
    public tags: AdminTag[];

    @AllowOnWire
    @Index('backgrounds_production_identifier_key', { unique: true })
    @Column({ type: 'int', width: 3 })
    public production_identifier: number;

    /* DATATABLE ENTITY METHODS */
    public static async afterCreate(request: DataTableCreateRequest<TransactionalBackground>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalBackground>,
        result: InsertResult): Promise<void> {
        const tags = request.values.find(value => value.column === '_tags')?.value;

        if (tags) {
            if (!Array.isArray(tags) || !tags.every(tag => isTag(tag))) {
                throw new BadRequestError('Invalid tags');
            }

            await queryTagObjects(
                runner,
                result.identifiers.map(i => ({ id: i.id }) as TransactionalBackground),
                tags.map(tag => ({ ...tag, id: tag.id.toString() }))
            );
        }
        await Container.get<PubsubService>('pubsub').publishBackgroundChanged();
    }

    public static async afterDelete(request: DataTableDeleteRequest<TransactionalBackground>,
        runner: QueryRunner,
        query: DeleteQueryBuilder<TransactionalBackground>,
        result: DeleteResult): Promise<void> {
        await Container.get<PubsubService>('pubsub').publishBackgroundChanged();
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalBackground>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalBackground>,
        result: UpdateResult): Promise<void> {
        const tags = request.values.find(value => value.column === '_tags')?.value;

        if (tags) {
            const requestId: string = request.values.find(i => i.column === 'id')?.value.toString();

            if (!Array.isArray(tags) || !tags.every(tag => isTag(tag))) {
                throw new BadRequestError('Invalid tags');
            }

            if (!requestId) {
                throw new BadRequestError('Invalid request missing id');
            }

            await queryTagObjects(
                runner,
                [({ id: requestId } as TransactionalBackground)],
                tags.map(tag => ({ ...tag, id: tag.id.toString() }))
            );
        }
        await Container.get<PubsubService>('pubsub').publishBackgroundChanged();
    }

    public static async beforeRead(request: DataTableReadRequest<TransactionalBackground>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalBackground>): Promise<void> {
        queryTagsForObjects(query, TransactionalBackground, 'background');

        if (request.filters) {
            const tagsFilter = request.filters.flat().find(filter => filter.column === '_tags');

            if (tagsFilter) {
                tagsFilter.operand[0].length === 1
                    ? queryObjectsByTag(query,
                        TransactionalBackground,
                        formatTags(tagsFilter.operand[0], 'background')[0])
                    : queryObjectsByTags(query,
                        TransactionalBackground,
                        formatTags(tagsFilter.operand[0], 'background'));
            }
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalBackground>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalBackground>): Promise<void> {
        if (request.values.find(value => value.column === 'image')) {
            const idFilter = request.filters.flat().find(filter => filter.column === 'id');
            const affected = await runner.manager.getRepository(TransactionalBackground).find({
                where: {
                    id: idFilter.operator === 'IN'
                        ? In(idFilter.operand.map(id => id.toString()))
                        : idFilter.operand.toString()
                }
            });

            const danglingAssets: AdminDanglingAsset[] = [];

            for (const background of affected) {
                const danglingAsset = new AdminDanglingAsset();

                danglingAsset.type = 'background';
                danglingAsset.path = background.image;

                danglingAssets.push(danglingAsset);
            }

            await runner.manager.getRepository(AdminDanglingAsset).save(danglingAssets);
        }
    }

    public static async overrideDelete(request: DataTableDeleteRequest<TransactionalBackground>,
        runner: QueryRunner,
        query: DeleteQueryBuilder<TransactionalBackground>)
        : Promise<DataTableOverrideResult<TransactionalBackground>> {
        const idFilter = request.filters.flat().find(filter => filter.column === 'id');
        const result = await TransactionalBackground.update({
            id: idFilter.operator === 'IN'
                ? In(idFilter.operand.map(id => id.toString()))
                : idFilter.operand.toString()
        }, {
            archived: true
        });

        return {
            operation: 'update',
            affected: result.affected
        };
    }

    /* PUBLIC */
    public static async getWithProductionIdentifier(pid: number): Promise<TransactionalBackground> {
        return TransactionalBackground.findOne({
            where: {
                production_identifier: pid
            }
        });
    }

    public static async readIdentifiers(): Promise<AllProductionIdentifier> {
        const used = await TransactionalBackground.find({
            select: ['production_identifier']
        }).then(rows => rows.map(row => row.production_identifier));
        const all = Array.from({ length: 1000 }, (_, i) => i);
        const unused = all.filter(number => !used.includes(number));

        return {
            used,
            unused
        };
    }
}
