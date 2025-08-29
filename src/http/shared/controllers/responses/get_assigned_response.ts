import { IsUUID } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetAssignedResponse extends BaseResponse {
    @IsUUID()
    public userId?: string;
}
