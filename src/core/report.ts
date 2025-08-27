import {
    ReportSeriesEntry,
    ReportSeriesName,
    ReportSeriesParams,
    ReportType,
    ReportViewName
} from '@pictaccio/shared/src/types/report';
import { Response } from 'express';
import { TFunction } from 'i18next';

export type HeaderParams = {
    feature: string;
    text: string;
}

export type SectionParams = {
    id: string;
    title: string;
}

export type TableParams = {
    tableId: string;
    sectionId: string;
    headers: HeaderParams[];
    entries: any[];
}

export abstract class Report<R extends ReportType> {
    protected _params: ReportSeriesParams;

    public constructor(params: ReportSeriesParams) {
        this._params = params;
    }

    public abstract getTimeSeries<S extends ReportSeriesName>(name: S): ReportTimeSeries<R, S>;
    public abstract getView(view: ReportViewName): ReportView;
}

export interface ReportRenderer {
    createSection(params: SectionParams): void;
    createTable(params: TableParams): void;
    render(response: Response): Promise<void> | void;
}

export abstract class ReportTimeSeries<R extends ReportType, S extends ReportSeriesName> {
    protected _params: ReportSeriesParams;

    public constructor(params: ReportSeriesParams) {
        this._params = params;
    }

    public query(params?: ReportSeriesParams): Promise<ReportSeriesEntry<R, S>> {
        return this.queryExec({ ...params, ...this._params });
    }

    public abstract queryExec(params: ReportSeriesParams): Promise<ReportSeriesEntry<R, S>>;
}

export interface ReportView {
    render(renderer: ReportRenderer, response: Response, t: TFunction): Promise<void> | void;
}

export type ReportMap = {
    sales: Report<'sales'>;
}

export type ReportMapper<R extends ReportType> = ReportMap[R];
