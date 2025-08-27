import { IsDate, IsIn, IsOptional, ValidateNested } from "@loufa/class-validator";
import { ReportRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/report_request';
import { IsNullable } from '@pictaccio/admin-api/http/shared/validators/is_nullable';
import { DateRangePreset, DateRangePresets } from '@pictaccio/shared/src/types/date_range';
import { SalesReportViewName, SalesReportViewNames } from '@pictaccio/shared/src/types/report';
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
