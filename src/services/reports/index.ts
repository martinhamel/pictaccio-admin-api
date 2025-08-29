
import { ReportRenderer } from '../../core/report';
import { CsvRenderer } from '../../services/reports/csv_renderer';
import { JsonRenderer } from '../../services/reports/json_renderer';
import { ReportRendererType } from '@pictaccio/shared/types/report';

const renderers: Record<ReportRendererType, new () => ReportRenderer> = {
    'json': JsonRenderer,
    'csv': CsvRenderer
};

export function createRenderer(type: ReportRendererType): ReportRenderer {
    return new renderers[type]();
}
