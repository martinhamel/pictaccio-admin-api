import { IsBoolean } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { IsNullable } from '../../../../http/shared/validators/is_nullable';

export class GetStoreShutdownResponse extends BaseResponse {
    @IsBoolean()
    public shutdown: boolean;

    @IsNullable()
    public message: string;
}
