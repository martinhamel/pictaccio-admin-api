import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class DataTableBaseResponse extends BaseResponse {
    public affected?: number;
    public error?: string;
    public createdId?: number | string | (number | string)[];
    public results?: any[];
    public resultTotal?: number;
}
