import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { IsString } from 'class-validator';

export class SubjectCodeGenerateResponse extends BaseResponse {
    @IsString({ each: true })
    public codes: string[];
}
