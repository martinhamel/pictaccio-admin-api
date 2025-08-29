import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class SubjectExistResponse extends BaseResponse {
    public codeExist: { [key: string]: boolean };
}
