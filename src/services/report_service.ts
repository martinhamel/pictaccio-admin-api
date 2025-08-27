import { ReportMapper, ReportRenderer } from '@pictaccio/admin-api/core/report';
import { createRenderer } from '@pictaccio/admin-api/services/reports';
import { SalesReport } from '@pictaccio/admin-api/services/reports/sales_report';
import { ReportRendererType, ReportSeriesParams, ReportType } from '@pictaccio/shared/src/types/report';
import { Service } from 'typedi';

@Service('report')
export class ReportService {
    public createRenderer(type: ReportRendererType): ReportRenderer {
        return createRenderer(type);
    }

    public createReport<R extends ReportType>(name: R, params: ReportSeriesParams): ReportMapper<R> {
        switch (name) {
            case 'sales':
                return new SalesReport(params);

            default:
                throw new Error(`Report ${name} not found`);
        }
    }
}
