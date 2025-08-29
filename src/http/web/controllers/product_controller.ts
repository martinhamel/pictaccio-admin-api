import { logger } from '../../../core/logger';
import { httpCommonFields } from '../../../core/logger_common';
import { TransactionalBackground } from '../../../database/entities/transactional_background';
import { TransactionalProductCrosssell } from '../../../database/entities/transactional_product_crosssell';
import { TransactionalProductThemeSet } from '../../../database/entities/transactional_product_theme_set';
import { findTags, tagObjects, untagObjects } from '../../../database/helpers/object_tags';
import { TagObjectRequest } from '../../../http/shared/controllers/requests/tag_object_request';
import { ReadTagsResponse } from '../../../http/shared/controllers/responses/read_tags_response';
import { TagObjectResponse } from '../../../http/shared/controllers/responses/tag_object_response';
import { Service } from 'typedi';
import { Authorized, Body, JsonController, Post, Req } from '@loufa/routing-controllers';
import { Request } from '../../../types/request';
import {
    DataTable,
    fromCreateRequest,
    fromDeleteRequest,
    fromReadRequest,
    fromUpdateRequest
} from '../../../database/helpers/data_table';
import { TransactionalProductCustomTemplate } from '../../../database/entities/transactional_product_custom_template';
import { TransactionalProductCategory } from '../../../database/entities/transactional_product_category';
import { TransactionalProductCatalog } from '../../../database/entities/transactional_product_catalog';
import { TransactionalProduct } from '../../../database/entities/transactional_product';
import { DataTableCreateBaseRequest } from '../../../http/shared/controllers/requests/data_table_create_base_request';
import { DataTableDeleteBaseRequest } from '../../../http/shared/controllers/requests/data_table_delete_base_request';
import { DataTableReadBaseRequest } from '../../../http/shared/controllers/requests/data_table_read_base_request';
import { DataTableUpdateBaseRequest } from '../../../http/shared/controllers/requests/data_table_update_base_request';
import { DataTableBaseResponse } from '../../../http/shared/controllers/responses/data_table_base_response';

@Service()
@JsonController('/product')
export class ProductController {
    @Authorized('create:product')
    @Post('/customProduct/create')
    public async createCustomProduct(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCustomTemplate, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/customProduct/delete')
    public async deleteCustomProduct(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCustomTemplate, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/customProduct/read')
    public async readCustomProduct(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCustomTemplate, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:product')
    @Post('/customProduct/update')
    public async updateCustomProduct(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCustomTemplate, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:product')
    @Post('/categories/create')
    public async createCategories(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCategory, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/categories/delete')
    public async deleteCategories(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCategory, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/categories/read')
    public async readCategories(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCategory, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:product')
    @Post('/categories/update')
    public async updateCategories(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCategory, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:product')
    @Post('/catalog/create')
    public async createProductCatalog(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCatalog, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/catalog/delete')
    public async deleteProductCatalog(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCatalog, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/catalog/read')
    public async readProductsCatalogs(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCatalog, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:product')
    @Post('/catalog/update')
    public async updateProductCatalog(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCatalog, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:product')
    @Post('/create')
    public async createProduct(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProduct, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/delete')
    public async deleteProducts(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProduct, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/read')
    public async readProducts(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProduct, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('read:product')
    @Post('/tags/read')
    public async readProductTags(@Req() request: Request): Promise<ReadTagsResponse> {
        logger.info(`Reading product tags`, {
            area: 'http/web',
            controller: 'controller/product',
            action: 'product:tags',
            controller_action: 'readProductTags',
            ...httpCommonFields(request)
        });

        try {
            return {
                status: 'great-success',
                tags: (await findTags(['product'])).map(tag => ({ id: tag.id, text: tag.text, scope: tag.scope }))
            };
        } catch (error) {
            logger.error('Failed to read product tags', {
                area: 'http/web',
                controller: 'controller/product',
                action: 'product:tags',
                controller_action: 'readProductTags',
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error'
            };
        }
    }

    @Authorized('update:product')
    @Post('/update')
    public async updateProducts(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProduct, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:product')
    @Post('/theme/create')
    public async createTheme(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/theme/delete')
    public async deleteTheme(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/theme/read')
    public async readTheme(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:product')
    @Post('/theme/update')
    public async updateTheme(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:product')
    @Post('/theme-group/create')
    public async createGroupTheme(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/theme-group/delete')
    public async deleteGroupTheme(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/theme-group/read')
    public async readGroupTheme(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:product')
    @Post('/theme-group/update')
    public async updateGroupTheme(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductThemeSet, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('create:product')
    @Post('/cross-sell/create')
    public async createCrosssell(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCrosssell, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:product')
    @Post('/cross-sell/delete')
    public async deleteCrosssell(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCrosssell, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:product')
    @Post('/cross-sell/read')
    public async readCrosssell(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCrosssell, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:product')
    @Post('/tag')
    public async tagProducts(@Req() request: Request,
        @Body() body: TagObjectRequest): Promise<TagObjectResponse> {
        logger.info(`User ${request.user.email} is tagging products`, {
            area: 'http/web',
            controller: 'controller/product',
            action: 'product:tag',
            controller_action: 'tagProducts',
            email: request.user.email,
            target_ids: body.ids,
            tags: body.tags
        });

        try {
            await tagObjects(body.ids.map(id => ({ id }) as TransactionalProduct), body.tags);
        } catch (error) {
            logger.error('Failed to tag products', {
                area: 'http/web',
                controller: 'controller/product',
                action: 'product:tag',
                controller_action: 'tagProducts',
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

    @Authorized('update:product')
    @Post('/untag')
    public async untagProducts(@Req() request: Request,
        @Body() body: TagObjectRequest): Promise<TagObjectResponse> {
        logger.info(`User ${request.user.email} is untagging products`, {
            area: 'http/web',
            controller: 'controller/product',
            action: 'product:untag',
            controller_action: 'untagProducts',
            email: request.user.email,
            target_ids: body.ids,
            tags: body.tags
        });

        try {
            await untagObjects(body.ids.map(id => ({ id }) as TransactionalProduct), body.tags);
        } catch (error) {
            logger.error('Failed to untag products', {
                area: 'http/web',
                controller: 'controller/product',
                action: 'product:untag',
                controller_action: 'untagProducts',
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

    @Authorized('update:product')
    @Post('/cross-sell/update')
    public async updateCrosssell(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalProductCrosssell, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }
}
