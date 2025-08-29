import { logger } from '../../core/logger';
import { appDataSource } from '../../database/data_source';
import { AdminTag } from '../../database/entities/admin_tag';
import { AdminTagMap } from '../../database/entities/admin_tag_map';
import { Tag } from '../../http/shared/controllers/nested/tag';
import { TagScope } from '@pictaccio/shared/types/tags';
import { isTag } from '@pictaccio/shared/utils/guards/is_tag';
import { BaseEntity, In, QueryRunner, SelectQueryBuilder } from 'typeorm';

const FIND_TAGGABLE_OBJECTS_DEFAULT_OPTIONS: FindTaggableObjectsOptions = {
    withGlobals: true
};

type TaggableEntity = {
    id: string;
    tags: AdminTag[];
}

interface BaseEntityConstraint<T extends BaseEntity> {
    new(): T;
}

export type FindTaggableObjectsOptions = {
    withGlobals?: boolean;
}

export async function findObjectsByTag<T extends BaseEntity>(entity: BaseEntityConstraint<T>,
    tag: Tag,
    options?: FindTaggableObjectsOptions): Promise<T[]> {
    options = { ...FIND_TAGGABLE_OBJECTS_DEFAULT_OPTIONS, ...options };

    const query = appDataSource.getRepository(entity)
        .createQueryBuilder(entity.name);

    queryObjectsByTag(query, entity, tag, options);

    return await query.getMany();
}

export async function findTags(scopes: TagScope[]): Promise<AdminTag[]> {
    return await appDataSource.getRepository(AdminTag)
        .find({
            where: {
                scope: In(scopes)
            }
        });
}

export function queryObjectsByTag<T extends BaseEntity>(query: SelectQueryBuilder<T>,
    entity: BaseEntityConstraint<T>,
    tag: Tag,
    options?: FindTaggableObjectsOptions): void {
    options = { ...FIND_TAGGABLE_OBJECTS_DEFAULT_OPTIONS, ...options };

    const scopes = [tag.scope, ...[options.withGlobals ? 'global' : undefined].filter(i => i)];

    query.leftJoin(AdminTagMap, 'map_qobt', `map_qobt.foreign_id = ${entity.name}.id`)
        .leftJoin(AdminTag, 'tag_qobt', `tag_qobt.id = map_qobt.tag_id`);

    if (tag.id) {
        query.where('tag_qobt.id = :id', { id: tag.id });
    } else {
        query.where('tag_qobt.scope = :scope', { scope: In(scopes) })
            .andWhere('tag_qobt.text = :text', { text: tag.text });
    }
}

export function queryObjectsByTags<T extends BaseEntity>(query: SelectQueryBuilder<T>,
    entity: BaseEntityConstraint<T>,
    tags: Tag[],
    options?: FindTaggableObjectsOptions): void {
    options = { ...FIND_TAGGABLE_OBJECTS_DEFAULT_OPTIONS, ...options };

    const scopes = tags.map(t => t.scope);
    if (options.withGlobals) {
        scopes.push('global');
    }

    query.leftJoin(AdminTagMap, 'map_qobts', `map_qobts.foreign_id = ${entity.name}.id`)
        .leftJoin(AdminTag, 'tag_qobts', `tag_qobts.id = map_qobts.tag_id`);

    if (tags.every(t => t.id)) {
        query.where('tag_qobts.id IN (:...id)', { id: tags.map(t => t.id) });
    } else {
        query.andWhere('tag_qobts.scope = :scope', { scope: In(scopes) })
            .andWhere('tag_qobts.text IN (:...text)', { text: tags.map(t => t.text) });
    }
}

export async function queryTagObjects<T extends TaggableEntity>(runner: QueryRunner,
    entities: T | T[],
    tags: Tag[]): Promise<void> {
    if (!Array.isArray(entities)) {
        entities = [entities];
    }

    for (const tag of tags) {
        let tagEntity = await runner.manager.findOne(AdminTag, {
            where: {
                scope: tag.scope,
                text: tag.text
            }
        });

        if (!tagEntity) {
            tagEntity = new AdminTag();
            tagEntity.scope = tag.scope;
            tagEntity.text = tag.text;
            tagEntity = await runner.manager.save(tagEntity);
        }

        const tagMap = await runner.manager.find(AdminTagMap, {
            where: {
                tag: { id: tagEntity.id },
                foreign_id: In(entities.map(e => e.id))
            }
        });

        const newTagMap: AdminTagMap[] = [];

        for (const entity of entities) {
            if (tagMap.find(m => m.foreign_id === entity.id)) {
                continue;
            }

            const map = new AdminTagMap();

            map.tag = tagEntity;
            map.foreign_id = entity.id;
            newTagMap.push(map);
        }

        if (newTagMap.length === 0) {
            continue;
        }

        await runner.manager.save(newTagMap);
    }
}

export function queryTagsForObjects<T extends BaseEntity>(query: SelectQueryBuilder<T>,
    entity: BaseEntityConstraint<T>,
    scope: TagScope): void {
    query.leftJoin(AdminTagMap, 'map_qtfo', `map_qtfo.foreign_id = ${entity.name}.id`)
        .leftJoinAndMapMany(`${entity.name}.tags`,
            AdminTag,
            'tag_qtfo',
            `tag_qtfo.id = map_qtfo.tag_id AND tag_qtfo.scope = '${scope}'`);
}

export async function queryUntagObjects<T extends TaggableEntity>(runner: QueryRunner,
    entities: T | T[],
    tags: Tag[]): Promise<void> {
    if (!Array.isArray(entities)) {
        entities = [entities];
    }

    for (const tag of tags) {
        const tagEntity = await runner.manager.findOne(AdminTag, {
            where: {
                scope: tag.scope,
                text: tag.text
            }
        });

        if (!tagEntity) {
            continue;
        }

        const tagMap = await runner.manager.find(AdminTagMap, {
            where: {
                tag: {
                    id: tagEntity.id
                },
                foreign_id: In(entities.map(e => e.id))
            }
        });

        if (!tagMap) {
            continue;
        }

        await runner.manager.remove(tagMap);
    }
}

export async function tagObjects<T extends TaggableEntity>(entities: T | T[], tags: Tag[]): Promise<void> {
    const runner = appDataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    if (!Array.isArray(entities)) {
        entities = [entities];
    }

    try {
        await queryTagObjects(runner, entities, tags);

        await runner.commitTransaction();
    } catch {
        await runner.rollbackTransaction();

        logger.error(`There was an error tagging objects`, {
            area: 'database',
            subarea: 'object-tags',
            action: 'tagObjects',
            entities: entities.map(e => e.constructor.name),
            tags
        });
    } finally {
        await runner.release();
    }
}

export async function untagObjects<T extends TaggableEntity>(entities: T | T[], tags: Tag[]): Promise<void> {
    const runner = appDataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    if (!Array.isArray(entities)) {
        entities = [entities];
    }

    try {
        await queryUntagObjects(runner, entities, tags);

        await runner.commitTransaction();
    } catch {
        await runner.rollbackTransaction();

        logger.error(`There was an error untagging objects`, {
            area: 'database',
            subarea: 'object-tags',
            action: 'untagObjects',
            entities: entities.map(e => e.constructor.name),
            tags
        });
    } finally {
        await runner.release();
    }
}

export function formatTags(tags: (Tag | string)[], scope: TagScope): Tag[] {
    return tags.map(tag => {
        if (typeof tag === 'string') {
            return {
                id: tag,
                text: '',
                scope: scope
            };
        }

        if (isTag(tag)) {
            return tag;
        }

        return null;
    });
}
