import { ReportRenderer, SectionParams, TableParams } from '../../core/report';
import { stringify } from 'csv-stringify';
import { Response } from 'express';
import { promisify } from 'node:util';

class TableCsvRenderer {
    private _params: TableParams;

    public create(params: TableParams): void {
        this._params = params;
    }

    public async render(response: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            stringify(this._params.entries.map(entry => this._params.headers.map(header => {
                const value = entry[header.feature];

                if (value instanceof Date) {
                    return value.toISOString();
                }

                return value;
            })), {
                header: true,
                columns: this._params.headers.map(header => header.text)
            }, (error, data) => {
                if (error) {
                    reject(error);
                }

                response.write(data);
                resolve();
            });
        });
    }
}

type Section = {
    id: string;
    title: string;
    objects: Record<string, TableCsvRenderer>;
};

export class CsvRenderer implements ReportRenderer {
    private _sections: Record<string, Section> = {};


    public createSection(params: SectionParams): void {
        if (this._sections[params.id]) {
            throw new Error(`Section ${params.id} already exists`);
        }

        this._sections[params.id] = {
            id: params.id,
            title: params.title,
            objects: {}
        };
    }

    public createTable(params: TableParams): void {
        if (!this._sections[params.sectionId]) {
            throw new Error(`Section ${params.sectionId} not found`);
        }

        if (this._sections[params.sectionId].objects[params.tableId]) {
            throw new Error(`Table ${params.tableId} already exists in section ${params.sectionId}`);
        }

        const renderer = new TableCsvRenderer();

        renderer.create(params);
        this._sections[params.sectionId].objects[params.tableId] = renderer;
    }

    public async render(response: Response): Promise<void> {
        response.setHeader('Content-Disposition', 'attachment; filename=data.csv');
        response.setHeader('Content-Type', 'text/csv');

        for (const [_, section] of Object.entries(this._sections)) {
            for await (const [_, renderer] of Object.entries(section.objects)) {
                await renderer.render(response);
            }
        }

        response.status(200);
        await promisify((callback) => {
            response.send();
            response.end(callback);
        })();
    }
}
