import { IsDefined, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DataTableValues {
    @IsDefined()
    column: string;

    @IsDefined()
    value: any;
}

export class DataTableCreateBaseRequest {
    @Transform(raw => typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value)
    @ValidateNested({each: true})
    values: DataTableValues[];
}
