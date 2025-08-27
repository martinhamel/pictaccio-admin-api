import { Authorized, Body, JsonController, Post, Req } from '@loufa/routing-controllers';
import { TransactionalWorkflow } from '@pictaccio/admin-api/database/entities/transactional_workflow';
import {
    DataTable,
    fromCreateRequest,
    fromDeleteRequest,
    fromReadRequest,
    fromUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
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
import { DataTableBaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/data_table_base_response';
import { Request } from '@pictaccio/admin-api/types/request';
import { Service } from 'typedi';

@Service()
@JsonController('/workflow')
export class WorkflowController {

    @Authorized('create:session')
    @Post('/create')
    async createCategories(@Req() request: Request,
        @Body() body: DataTableCreateBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processCreate(fromCreateRequest(body));
    }

    @Authorized('delete:session')
    @Post('/delete')
    async deleteCategories(@Req() request: Request,
        @Body() body: DataTableDeleteBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processDelete(fromDeleteRequest(body));
    }

    @Authorized('read:session')
    @Post('/read')
    async readCategories(@Req() request: Request,
        @Body() body: DataTableReadBaseRequest): Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processRead(fromReadRequest(body));
    }

    @Authorized('update:session')
    @Post('/update')
    async updateCategories(@Req() request: Request,
        @Body() body: DataTableUpdateBaseRequest)
        : Promise<DataTableBaseResponse> {
        const dataTable = new DataTable(TransactionalWorkflow, request);

        return await dataTable.processUpdate(fromUpdateRequest(body));
    }
}
