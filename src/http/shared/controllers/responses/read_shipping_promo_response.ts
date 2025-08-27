import { ShippingPromo } from '@pictaccio/admin-api/http/shared/controllers/nested/shipping_promo';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ReadShippingPromoResponse extends BaseResponse {
    public promo: ShippingPromo;
}
