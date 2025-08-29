import { dasherize } from '@loufa/loufairy';
import { Authorized, Body, JsonController, Post, Req } from '@loufa/routing-controllers';
import { PublicAppIntegration } from '../../../database/entities/public_app_integration';
import { TransactionalDeliveryOption } from '../../../database/entities/transactional_delivery_option';
import {
    TransactionalDeliveryOptionGroup
} from '../../../database/entities/transactional_delivery_option_group';
import {
    DataTable,
    fromCreateRequest,
    fromDeleteRequest,
    fromReadRequest,
    fromUpdateRequest
} from '../../../database/helpers/data_table';
import {
    DataTableCreateBaseRequest
} from '../../../http/shared/controllers/requests/data_table_create_base_request';
import {
    DataTableDeleteBaseRequest
} from '../../../http/shared/controllers/requests/data_table_delete_base_request';
import {
    DataTableReadBaseRequest
} from '../../../http/shared/controllers/requests/data_table_read_base_request';
import {
    DataTableUpdateBaseRequest
} from '../../../http/shared/controllers/requests/data_table_update_base_request';
import { DataTableBaseResponse } from '../../../http/shared/controllers/responses/data_table_base_response';
import { Request } from '../../../types/request';
import { Service } from 'typedi';

@Service()
@JsonController('/delivery')
export class ShippingController {
    @Authorized('create:shipping')
    @Post('/create')
    async create(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalDeliveryOption, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:shipping')
    @Post('/delete')
    async delete(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalDeliveryOption, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:shipping')
    @Post('/read')
    async read(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalDeliveryOption, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:shipping')
    @Post('/update')
    async update(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalDeliveryOption, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }

    @Authorized('read:shipping')
    @Post('/methods/read')
    public async readMethods(@Req() request: Request): Promise<any> {
        const appIntegrationsShipping = ['canada-post'];
        const appIntegration = await PublicAppIntegration.get();
        const appMethods = [];

        for (const app in appIntegration) {
            if (appIntegrationsShipping.includes(app.toLowerCase()) &&
                appIntegration[app].active) {
                appMethods.push(dasherize(app));
            }
        }

        return {
            status: 'great-success',
            results: [
                { id: 1, internal_name: 'fixed-rate' },
                { id: 2, internal_name: 'canada-post' },
                { id: 3, internal_name: 'pick-up' },
                { id: 4, internal_name: 'establishment' }
            ].filter((method) => {
                return !(appIntegrationsShipping.includes(method.internal_name) &&
                    !appMethods.includes(method.internal_name));
            }),
            resultTotal: 4
        };
    }

    @Authorized('read:shipping')
    @Post('/options/read')
    public async readOptions(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalDeliveryOption, request);
        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('create:shipping')
    @Post('/groups/create')
    async createGroup(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalDeliveryOptionGroup, request);
        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:shipping')
    @Post('/groups/delete')
    async deleteGroup(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {

        const dataTable = new DataTable(TransactionalDeliveryOptionGroup, request);
        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:shipping')
    @Post('/groups/read')
    async readGroup(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {

        const dataTable = new DataTable(TransactionalDeliveryOptionGroup, request);
        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:shipping')
    @Post('/groups/update')
    async updateGroup(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest): Promise<DataTableBaseResponse> {

        const dataTable = new DataTable(TransactionalDeliveryOptionGroup, request);
        return await dataTable.processUpdate(fromUpdateRequest(body));
    }
}
