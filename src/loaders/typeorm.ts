import { LoaderInterface } from '../bootstrap';
import { ConfigSchema } from '../core/config_schema';
import { Container } from 'typedi';
import { SelectQueryBuilder } from 'typeorm';

declare module 'typeorm' {
    interface SelectQueryBuilder<Entity> {
        whereExists<T>(query: SelectQueryBuilder<T>): this;
        andWhereExists<T>(query: SelectQueryBuilder<T>): this;
        orWhereExists<T>(query: SelectQueryBuilder<T>): this;
    }
}

function installTypeormShims() {
    SelectQueryBuilder.prototype.whereExists = function (query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return this.where(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
    SelectQueryBuilder.prototype.andWhereExists = function (query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return this.andWhere(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
    SelectQueryBuilder.prototype.orWhereExists = function (query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return this.orWhere(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
}

export const typeormLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');

    const module = await import('../database/data_source');

    if (module.default) {
        await module.default;
    } else {
        throw new Error('Data Source module failed to load');
    }

    // const { appDataSourcePromise } = await import('../database/data_source_init');
    // await appDataSourcePromise;
};
