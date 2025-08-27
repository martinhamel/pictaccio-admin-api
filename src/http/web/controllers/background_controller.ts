import { Authorized, Body, Get, JsonController, Post, Req } from '@loufa/routing-controllers';
import { logger } from '@pictaccio/admin-api/core/logger';
import { TransactionalBackground } from '@pictaccio/admin-api/database/entities/transactional_background';
import { httpCommonFields } from '@pictaccio/admin-api/core/logger_common';
import {
    TransactionalBackgroundCategory
} from '@pictaccio/admin-api/database/entities/transactional_background_category';
import {
    DataTable,
    fromCreateRequest,
    fromDeleteRequest,
    fromReadRequest,
    fromUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
import { findTags, tagObjects, untagObjects } from '@pictaccio/admin-api/database/helpers/object_tags';
import {
    DataTableCreateBaseRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_create_base_request';
import {
    DataTableDeleteBaseRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_delete_base_request';
import {
    DataTableReadBaseRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_read_base_request';
import {
    DataTableUpdateBaseRequest
} from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_update_base_request';
import { TagObjectRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/tag_object_request';
import {
    AllProductionIdentifierResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/all_production_identifier_response';
import { DataTableBaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/data_table_base_response';
import { ReadTagsResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/read_tags_response';
import {
    ReadWithProductionIdentifierResponse
} from '@pictaccio/admin-api/http/shared/controllers/responses/read_with_production_identifier_response';
import { TagObjectResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/tag_object_response';
import { Request } from '@pictaccio/admin-api/types/request';
import { Service } from 'typedi';

@Service()
@JsonController('/background')
export class BackgroundController {
    @Authorized('create:background')
    @Post('/categories/create')
    public async createCategories(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackgroundCategory, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:background')
    @Post('/categories/delete')
    public async deleteCategories(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackgroundCategory, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:background')
    @Post('/categories/read')
    public async readCategories(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackgroundCategory, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:background')
    @Post('/categories/update')
    public async updateCategories(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackgroundCategory, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:background')
    @Post('/create')
    public async createBackgrounds(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackground, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:background')
    @Post('/delete')
    public async deleteBackgrounds(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackground, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:background')
    @Post('/read')
    public async readBackgrounds(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackground, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('read:background')
    @Post('/tags/read')
    public async readBackgroundTags(@Req() request: Request): Promise<ReadTagsResponse> {
        logger.info('Reading background tags', {
            area: 'http/web',
            controller: 'controller/background',
            action: 'background:tags',
            controller_action: 'readBackgroundTags',
            ...httpCommonFields(request)
        });

        try {
            return {
                status: 'great-success',
                tags: (await findTags(['background'])).map(tag => ({ id: tag.id, text: tag.text, scope: tag.scope }))
            };
        } catch (error) {
            logger.error('Failed to read background tags', {
                area: 'http/web',
                controller: 'controller/background',
                action: 'background:tags',
                controller_action: 'readBackgroundTags',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error'
            };
        }
    }

    @Authorized('read:background')
    @Get('/readIdentifiers')
    public async readIdentifiers(): Promise<AllProductionIdentifierResponse> {
        const identifiers = await TransactionalBackground.readIdentifiers();

        if (!identifiers) {
            logger.error('Failed to read production identifiers');
            return null;
        }

        return {
            status: 'great-success',
            used: identifiers.used,
            unused: identifiers.unused
        };
    }

    @Authorized('read:background')
    @Get('/readWithProductionIdentifier')
    public async readWithProductionIdentifier(@Req() request: Request): Promise<ReadWithProductionIdentifierResponse> {
        const queryPid = request.query.pid;

        if (!queryPid) {
            logger.error('Failed to read backgrounds, No pid provided');
            return null;
        }

        const background = await TransactionalBackground.getWithProductionIdentifier(parseInt(queryPid.toString(), 10));

        return {
            status: 'great-success',
            background
        };
    }

    @Authorized('update:background')
    @Post('/tag')
    public async tagBackgrounds(@Req() request: Request,
        @Body() body: TagObjectRequest): Promise<TagObjectResponse> {
        logger.info(`User ${request.user.email} is tagging backgrounds`, {
            area: 'http/web',
            controller: 'controller/background',
            action: 'background:tag',
            controller_action: 'tagBackgrounds',
            email: request.user.email,
            target_ids: body.ids,
            tags: body.tags
        });

        try {
            await tagObjects(body.ids.map(id => ({ id }) as TransactionalBackground), body.tags);
        } catch (error) {
            logger.error('Failed to tag backgrounds', {
                area: 'http/web',
                controller: 'controller/background',
                action: 'background:tag',
                controller_action: 'tagBackgrounds',
                email: request.user.email,
                error
            });

            return {
                status: 'error'
            };
        }

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:background')
    @Post('/untag')
    public async untagBackgrounds(@Req() request: Request,
        @Body() body: TagObjectRequest): Promise<TagObjectResponse> {
        logger.info(`User ${request.user.email} is untagging backgrounds`, {
            area: 'http/web',
            controller: 'controller/background',
            action: 'background:untag',
            controller_action: 'untagBackgrounds',
            email: request.user.email,
            target_ids: body.ids,
            tags: body.tags
        });

        try {
            await untagObjects(body.ids.map(id => ({ id }) as TransactionalBackground), body.tags);
        } catch (error) {
            logger.error('Failed to untag backgrounds', {
                area: 'http/web',
                controller: 'controller/background',
                action: 'background:untag',
                controller_action: 'untagBackgrounds',
                email: request.user.email,
                error
            });

            return {
                status: 'error'
            };
        }

        return {
            status: 'great-success'
        };
    }

    @Authorized('update:background')
    @Post('/update')
    public async updateBackgrounds(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest)
        : Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalBackground, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }
}
