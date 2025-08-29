import { ReportRenderer, SectionParams, TableParams } from '../../core/report';
import { Response } from 'express';
import { promisify } from 'node:util';

interface JsonObjectRenderer {
    create(params: any): void;
    render(): any;
}

class TableJsonRenderer implements JsonObjectRenderer {
    private _params: TableParams;

    public create(params: TableParams): void {
        this._params = params;
    }

    public render(): any {
        return this._params.entries.map(entry => Object.values(this._params.headers)
            .reduce((output, header) => ({ ...output, [header.feature]: entry[header.feature] }), {}));
    }
}

type Section = {
    id: string;
    title: string;
    objects: Record<string, JsonObjectRenderer>;
};

export class JsonRenderer implements ReportRenderer {
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

        const renderer = new TableJsonRenderer();

        renderer.create(params);
        this._sections[params.sectionId].objects[params.tableId] = renderer;
    }

    public async render(response: Response): Promise<void> {
        const output = {};

        for (const [id, section] of Object.entries(this._sections)) {
            const sectionOutput = {};

            for (const [tableId, renderer] of Object.entries(section.objects)) {
                sectionOutput[tableId] = renderer.render();
            }

            output[id] = sectionOutput;
        }

        response.status(200);
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(output));
        await promisify((callback) => {
            response.end(callback);
        })();
    }
}
