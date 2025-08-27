import { OrderPhotoCheck } from '@pictaccio/admin-api/http/shared/controllers/nested/order_photo_check';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetChecksResponse extends BaseResponse {
    public checks?: OrderPhotoCheck[];
}
