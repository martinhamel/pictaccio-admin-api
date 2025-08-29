import { ShippingPromo } from '../../../../http/shared/controllers/nested/shipping_promo';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class ReadShippingPromoResponse extends BaseResponse {
    public promo: ShippingPromo;
}
