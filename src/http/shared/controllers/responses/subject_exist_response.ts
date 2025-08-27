import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class SubjectExistResponse extends BaseResponse {
    public codeExist: { [key: string]: boolean };
}
