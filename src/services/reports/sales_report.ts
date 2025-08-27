import { Report, ReportRenderer, ReportTimeSeries, ReportView } from '@pictaccio/admin-api/core/report';
import { appDataSource } from '@pictaccio/admin-api/database/data_source';
import { AdminSalesStat } from '@pictaccio/admin-api/database/entities/admin_sales_stat';
import {
    ReportSeriesParams,
    ReportViewName,
    SalesReportSalesSeriesFeatureEntry,
    SalesReportSalesSeriesParams,
    SalesReportSeriesName
} from '@pictaccio/shared/src/types/report';
import { resolveDateRange } from '@pictaccio/shared/src/utils/date';
import { Response } from 'express';
import { TFunction } from 'i18next';
import { Between } from 'typeorm';

export class SalesReportSalesTimeSeries extends ReportTimeSeries<'sales', 'salesSeries'> {
    public async queryExec(params: SalesReportSalesSeriesParams): Promise<SalesReportSalesSeriesFeatureEntry[]> {
        const dateRange = resolveDateRange(params.dateRange);
        const entries = await appDataSource.getRepository(AdminSalesStat)
            .find({
                where: {
                    date: Between(dateRange.start.getTime() / 1000, dateRange.end.getTime() / 1000)
                },
                relations: ['products', 'products.product']
            });

        return entries.map(entry => ({
            date: entry.dateJS,
            orderId: entry.order_id,
            sessionId: entry.session_id,
            numberOfSubjects: entry.number_of_subjects,
            subtotal: entry.subtotal,
            shipping: entry.shipping,
            promoRebate: entry.promo_rebate,
            taxes: entry.taxes,
            returns: entry.returns,
            returnFees: entry.return_fees,
            total: entry.total,

            // TODO: Remove and use productSeries, just a patch for now
            products: JSON.stringify(entry.products.map(product => ({
                productId: product.sales_stats_product_id,
                productInternalName: product.product?.internal_name ?? product.sales_stats_product_id,
                quantity: product.quantity
            })))
        }));
    }
}

export class SalesReportTableView implements ReportView {
    private _report: SalesReport;

    constructor(report: SalesReport) {
        this._report = report;
    }

    public async render(renderer: ReportRenderer,
        response: Response,
        t: TFunction): Promise<void> {
        renderer.createSection({
            id: 'sales',
            title: t('report:sales.series.sales')
        });
        renderer.createTable({
            tableId: 'salesSeries',
            sectionId: 'sales',
            headers: [
                { feature: 'orderId', text: t('report:sales.features.sales.orderId') },
                { feature: 'sessionId', text: t('report:sales.features.sales.sessionId') },
                { feature: 'date', text: t('report:sales.features.sales.date') },
                { feature: 'numberOfSubjects', text: t('report:sales.features.sales.numberOfSubjects') },
                { feature: 'subtotal', text: t('report:sales.features.sales.subtotal') },
                { feature: 'shipping', text: t('report:sales.features.sales.shipping') },
                { feature: 'promoRebate', text: t('report:sales.features.sales.promoRebate') },
                { feature: 'taxes', text: t('report:sales.features.sales.taxes') },
                { feature: 'returns', text: t('report:sales.features.sales.returns') },
                { feature: 'returnFees', text: t('report:sales.features.sales.returnFees') },
                { feature: 'total', text: t('report:sales.features.sales.total') },

                // TODO: Remove and use productSeries, just a patch for now
                { feature: 'products', text: t('report:sales.features.sales.products') }
            ],
            entries: await this._report.getTimeSeries('salesSeries').query()
        });
        await renderer.render(response);
    }
}

const timeSeries: Record<SalesReportSeriesName, new (params: ReportSeriesParams) => ReportTimeSeries<any, any>> = {
    'salesSeries': SalesReportSalesTimeSeries,
    'productSeries': null,
    'aggregateSeries': null
};

export class SalesReport extends Report<'sales'> {
    public getTimeSeries<S extends SalesReportSeriesName>(name: S): ReportTimeSeries<'sales', S> {
        return new timeSeries[name](this._params);
    }

    public getView(view: ReportViewName): ReportView {
        switch (view) {
            case 'table':
                return new SalesReportTableView(this);

            default:
                throw new Error(`View '${view}' not found`);
        }
    }
}
