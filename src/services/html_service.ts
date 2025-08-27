import { readDir } from '@loufa/loufairy-server';
import { ConfigSchema } from '../core/config_schema';
import { ExpressHandlebars } from 'express-handlebars';
import { UnknownObject } from 'express-handlebars/types';
import { getFixedT } from '../loaders/i18next';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { join } from 'path';
import { Container, Inject, Service } from 'typedi';
import { HtmlOptions } from '../types/html_options';

type Partials = Record<string, (context: UnknownObject) => string>;

const TEMPLATE_EXTENSION = '.handlebars';

@Service('html')
export default class HtmlService {
    constructor(@Inject('config') private config: ConfigSchema) {
    }
    public async render(path: string, context: UnknownObject, options: HtmlOptions): Promise<string> {
        const handlebarsExpress = Container.get<ExpressHandlebars>('handlebars-express');
        context = {
            ...context,
            __internals__: [
                await getFixedT(options.lang || this.config.locales.fallbacks.lang)
            ],
            __head_title__: options.title
        };

        return await handlebarsExpress.renderView(
            path, {
            layout: join(this.config.http.servers.web.dirs.templates, 'layouts/email.handlebars'),
            ...context,
            settings: {
                views: path
            },
            partials: await this._loadPartials()
        });
    }


    private async _loadPartials(): Promise<Partials> {
        const handlebars = Container.get<typeof Handlebars>('handlebars');
        const partials: Partials = {};

        for await (const file of readDir(this.config.http.servers.web.dirs.partials, /.*\.handlebars/, true)) {
            const partialTemplate =
                (await readFile(join(this.config.http.servers.web.dirs.partials, file.name))).toString();

            partials[file.name.slice(0, -TEMPLATE_EXTENSION.length).replaceAll('\\', '/')] =
                context => handlebars.compile(partialTemplate)(context);
        }

        return partials;
    }
}
