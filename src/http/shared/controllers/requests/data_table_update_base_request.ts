import { ValidateNested } from 'class-validator';
import { Transform } from "class-transformer";
import { DataTableValues } from '../../../../http/shared/controllers/requests/data_table_create_base_request';
import { FilterOption } from '../../../../http/shared/controllers/requests/data_table_read_base_request';

export class DataTableUpdateBaseRequest {
    @Transform(raw => typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value)
    @ValidateNested({ each: true })
    public filters?: FilterOption[][];

    @Transform(raw => typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value)
    @ValidateNested({ each: true })
    public values?: DataTableValues[];
}
