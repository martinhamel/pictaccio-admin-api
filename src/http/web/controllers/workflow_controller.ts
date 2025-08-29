import { Authorized, Body, JsonController, Post, Req } from '@loufa/routing-controllers';
import { TransactionalWorkflow } from '../../../database/entities/transactional_workflow';
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
