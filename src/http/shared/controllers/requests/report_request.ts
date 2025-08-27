import { IsIn, IsInt } from '@loufa/class-validator';
import { Language, Languages } from '@pictaccio/shared/src/types/language';
import {
    ReportPageSize,
    ReportPageSizes,
    ReportRendererType,
    ReportRendererTypes
} from '@pictaccio/shared/src/types/report';

export class ReportRequest {
    @IsIn(Languages)
    public language: Language;

    @IsIn(ReportRendererTypes)
    public renderer: ReportRendererType;

    @IsInt()
    public pageAt: number;

    @IsIn(ReportPageSizes)
    public pageSize: ReportPageSize;
}
