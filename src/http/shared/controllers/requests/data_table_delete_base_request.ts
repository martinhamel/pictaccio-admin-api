import { IsOptional, ValidateNested } from '@loufa/class-validator';
import { FilterOption } from '@pictaccio/admin-api/http/shared/controllers/requests/data_table_read_base_request';

export class DataTableDeleteBaseRequest {
    @ValidateNested({ each: true })
    @IsOptional()
    public filters?: FilterOption[][];
}
