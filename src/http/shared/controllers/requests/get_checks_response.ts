import { OrderPhotoCheck } from '../../../../http/shared/controllers/nested/order_photo_check';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetChecksResponse extends BaseResponse {
    public checks?: OrderPhotoCheck[];
}
