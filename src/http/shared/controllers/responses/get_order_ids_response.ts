import { ValidateNested } from '@loufa/class-validator';
import { OrderData } from '@pictaccio/admin-api/http/shared/controllers/nested/order_data';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { OrderDescriptor } from '@pictaccio/shared/src/types/order_descriptor';

export class GetOrderIdsResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public orders?: OrderDescriptor[];
}
