import { IsOptional, ValidateNested } from 'class-validator';
import { FilterOption } from '../../../../http/shared/controllers/requests/data_table_read_base_request';

export class DataTableDeleteBaseRequest {
    @ValidateNested({ each: true })
    @IsOptional()
    public filters?: FilterOption[][];
}
