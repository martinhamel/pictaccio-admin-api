import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class VerifySubjectCodesResponse extends BaseResponse {
    public codesExist?: string[];
}
