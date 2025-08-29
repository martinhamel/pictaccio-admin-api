import { IsDate, IsIn, IsOptional, ValidateNested } from "class-validator";
import { ReportRequest } from '../../../../http/shared/controllers/requests/report_request';
import { IsNullable } from '../../../../http/shared/validators/is_nullable';
import { DateRangePreset, DateRangePresets } from '@pictaccio/shared/types/date_range';
import { SalesReportViewName, SalesReportViewNames } from '@pictaccio/shared/types/report';
import { Transform, Type } from "class-transformer";

export class ReportDateOption {
    @IsIn(DateRangePresets)
    public preset: DateRangePreset;

    @IsNullable()
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    public start?: Date;

    @IsNullable()
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    public end?: Date;
}

export class SalesReportRequest extends ReportRequest {
    @IsIn(SalesReportViewNames)
    public view: SalesReportViewName;

    @ValidateNested()
    @Type(() => ReportDateOption)
    public dateRange: ReportDateOption;
}
