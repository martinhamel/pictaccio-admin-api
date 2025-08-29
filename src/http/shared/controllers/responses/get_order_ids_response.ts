import { ValidateNested } from 'class-validator';
import { OrderData } from '../../../../http/shared/controllers/nested/order_data';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { OrderDescriptor } from '@pictaccio/shared/types/order_descriptor';

export class GetOrderIdsResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public orders?: OrderDescriptor[];
}
