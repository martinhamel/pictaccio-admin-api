import { IsDefined, IsIn, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class FilterOption {
    @IsString()
    public column: string;

    @IsIn(['==', '!=', '>', '<', '<=', '>=', 'IN', 'NOT IN', '~', '~~', '!~', '!~~', '@>'])
    public operator: '==' | '!=' | '>' | '<' | '<=' | '>=' | 'IN' | 'NOT IN' | '~' | '~~' | '!~' | '!~~' | '@>';

    @IsDefined()
    public operand: string;
}

class SortOption {
    @IsString()
    public column: string;

    @IsIn(['ASC', 'DESC'])
    public order: 'ASC' | 'DESC';
}

export class DataTableReadBaseRequest {
    @IsInt()
    @IsOptional()
    public from?: number;

    @IsInt()
    @IsOptional()
    public to?: number;

    @ValidateNested({each: true})
    @IsOptional()
    public filters?: FilterOption[][];

    @ValidateNested({each: true})
    @IsOptional()
    public sort?: SortOption[];

    @IsOptional()
    public fields: string[];
}
