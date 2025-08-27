import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { IsString } from '@loufa/class-validator';

export class SubjectCodeGenerateResponse extends BaseResponse {
    @IsString({ each: true })
    public codes: string[];
}
