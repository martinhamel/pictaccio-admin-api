import { Authorized, BadRequestError, Get, JsonController, Param, QueryParams, Res } from '@loufa/routing-controllers';
import { ResponseSchema } from '@loufa/routing-controllers-openapi';
import { SalesReportRequest } from '@pictaccio/admin-api/http/shared/controllers/requests/sales_report_request';
import { ReportResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/report_response';
import { getFixedT } from '@pictaccio/admin-api/loaders/i18next';
import { ReportService } from '@pictaccio/admin-api/services/report_service';
import { ReportType, ReportTypes } from '@pictaccio/shared/src/types/report';
import { Inject, Service } from 'typedi';
import { Response } from 'express';

@Service()
@JsonController('/report')
export class ReportController {
    constructor(@Inject('report') private reportService: ReportService) {
    }

    @Authorized('read:report')
    @Get('/:report')
    @ResponseSchema(ReportResponse)
    public async data(@Res() response: Response,
        @Param('report') report: ReportType,
        @QueryParams() params: SalesReportRequest): Promise<void> {
        if (!ReportTypes.includes(report)) {
            throw new BadRequestError('Invalid report type');
        }

        const t = await getFixedT(params.language);

        await this.reportService
            .createReport(report, {
                view: params.view,
                dateRange: {
                    preset: params.dateRange.preset,
                    start: params.dateRange.start,
                    end: params.dateRange.end
                }
            })
            .getView(params.view)
            .render(this.reportService.createRenderer(params.renderer), response, t);
    }
}
