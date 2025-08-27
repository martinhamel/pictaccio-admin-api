
import { ReportRenderer } from '@pictaccio/admin-api/core/report';
import { CsvRenderer } from '@pictaccio/admin-api/services/reports/csv_renderer';
import { JsonRenderer } from '@pictaccio/admin-api/services/reports/json_renderer';
import { ReportRendererType } from '@pictaccio/shared/src/types/report';

const renderers: Record<ReportRendererType, new () => ReportRenderer> = {
    'json': JsonRenderer,
    'csv': CsvRenderer
};

export function createRenderer(type: ReportRendererType): ReportRenderer {
    return new renderers[type]();
}
