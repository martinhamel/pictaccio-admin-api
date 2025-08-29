import { checkFileMimeType, getUniqueFilename } from '@loufa/loufairy-server/src/entry';
import { ConfigSchema } from '../../core/config_schema';
import { logger } from '../../core/logger';
import { httpCommonFields } from '../../core/logger_common';
import { appDataSource } from '../../database/data_source';
import { getMetadata, ModelMetadata } from '../../database/decorators/metadata';
import { FileNotAllowedError } from '../../errors/file_not_allowed_error';
import { InvalidFormatError } from '../../errors/invalid_format_error';
import {
    DataTableCreateBaseRequest
} from '../../http/shared/controllers/requests/data_table_create_base_request';
import {
    DataTableDeleteBaseRequest
} from '../../http/shared/controllers/requests/data_table_delete_base_request';
import {
    DataTableReadBaseRequest
} from '../../http/shared/controllers/requests/data_table_read_base_request';
import {
    DataTableUpdateBaseRequest
} from '../../http/shared/controllers/requests/data_table_update_base_request';
import { Request } from '../../types/request';
import { isPromiseLike } from '../../utils/is_promise_like';
import { Operator } from '@pictaccio/shared/types/operator';
import { extname, join } from 'path';
import { Container } from 'typedi';
import {
    BaseEntity,
    Brackets,
    DeleteQueryBuilder,
    InsertQueryBuilder,
    InsertResult,
    QueryBuilder,
    QueryRunner,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { ObjectType } from 'typeorm/common/ObjectType';
import { ObjectId } from 'typeorm/driver/mongodb/typings';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { Repository } from 'typeorm/repository/Repository';
import { SaveOptions } from 'typeorm/repository/SaveOptions';

export type ColumnName<T extends BaseEntity> = keyof T | `_${string}`;

function isKeyOfT<T extends BaseEntity>(key: ColumnName<T>): key is keyof T {
    return !key.toString().startsWith('_');
}

interface BaseEntityConstraint<T extends BaseEntity> {
    new(): T;
    count<T extends BaseEntity>(this: ObjectType<T>, options?: FindManyOptions<T>): Promise<number>;
    createQueryBuilder<T extends BaseEntity>(this: ObjectType<T>, alias?: string): SelectQueryBuilder<T>;
    delete<T extends BaseEntity>(this: ObjectType<T>, criteria: string | string[] | number | number[] | Date | Date[] |
        ObjectId | ObjectId[] | FindOptionsWhere<T>, options?: RemoveOptions): Promise<DeleteResult>;
    getId<T extends BaseEntity>(this: ObjectType<T>, entity: T): any;
    getRepository<T extends BaseEntity>(this: ObjectType<T>): Repository<T>;
    find<T extends BaseEntity>(this: ObjectType<T>, options?: FindManyOptions<T>): Promise<T[]>;
    find<T extends BaseEntity>(this: ObjectType<T>, conditions?: FindOptionsWhere<T>): Promise<T[]>;
    update<T extends BaseEntity>(this: ObjectType<T>,
        criteria: string | string[] | number | number[] | Date | Date[] | ObjectId
            | ObjectId[] | FindOptionsWhere<T>,
        partialEntity: QueryDeepPartialEntity<T>,
        options?: SaveOptions): Promise<UpdateResult>;
}

export interface DataTableEntityMethods<T extends BaseEntity> {
    new(...args: any[]): T;
    afterCreate?(request: DataTableCreateRequest<T>,
        runner: QueryRunner,
        query: InsertQueryBuilder<T>,
        result: InsertResult): void | Promise<void>;
    afterDelete?(request: DataTableDeleteRequest<T>,
        runner: QueryRunner,
        query: DeleteQueryBuilder<T>,
        result: DeleteResult): void | Promise<void>;
    afterRead?(request: DataTableReadRequest<T>,
        runner: QueryRunner,
        query: SelectQueryBuilder<T>,
        results: T[],
        count: number): T[] | Promise<T[]>;
    afterUpdate?(request: DataTableUpdateRequest<T>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<T>,
        result: UpdateResult): void | Promise<void>;
    beforeCreate?(request: DataTableCreateRequest<T>,
        runner: QueryRunner,
        query: InsertQueryBuilder<T>): void | Promise<void>;
    beforeDelete?(request: DataTableDeleteRequest<T>,
        runner: QueryRunner,
        query: DeleteQueryBuilder<T>): void | Promise<void>;
    beforeRead?(request: DataTableReadRequest<T>,
        runner: QueryRunner,
        query: SelectQueryBuilder<T>): void | Promise<void>;
    beforeUpdate?(request: DataTableUpdateRequest<T>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<T>): void | Promise<void>;
    overrideCreate?(request: DataTableCreateRequest<T>,
        runner: QueryRunner,
        query: InsertQueryBuilder<T>): DataTableOverrideResult<T> | Promise<DataTableOverrideResult<T>>;
    overrideDelete?(request: DataTableDeleteRequest<T>,
        runner: QueryRunner,
        query: DeleteQueryBuilder<T>): DataTableOverrideResult<T> | Promise<DataTableOverrideResult<T>>;
    overrideRead?(request: DataTableReadRequest<T>,
        runner: QueryRunner,
        query: SelectQueryBuilder<T>): DataTableOverrideResult<T> | Promise<DataTableOverrideResult<T>>;
    overrideUpdate?(request: DataTableUpdateRequest<T>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<T>): DataTableOverrideResult<T> | Promise<DataTableOverrideResult<T>>;
}

export type DataTableOverrideResult<T extends BaseEntity> = {
    operation: 'create' | 'delete' | 'read' | 'update';
    affected?: number;
    identifiers?: ObjectLiteral[];
    results?: T[];
}

export class DataTableCreateRequest<T extends BaseEntity> {
    public values: DataTableValues<T>[];
}

export class DataTableDeleteRequest<T extends BaseEntity> {
    public filters?: DataTableFilterOption<T>[][];
}

export class DataTableFilterOption<T extends BaseEntity> {
    public column: ColumnName<T>;
    public operator: Operator;
    public operand: any;
}

export class DataTableReadSortOption<T extends BaseEntity> {
    public column: ColumnName<T>;
    public order: 'ASC' | 'DESC';
}

export class DataTableReadRequest<T extends BaseEntity> {
    public from?: number;
    public to?: number;
    public fields?: (keyof T)[];
    public filters?: DataTableFilterOption<T>[][];
    public sort?: DataTableReadSortOption<T>[];
}

export class DataTableResponse<T extends BaseEntity> {
    public status: 'great-success' | 'failed';
    public affected?: number;
    public error?: string;
    public createdId?: number | string | (number | string)[];
    public results?: T[];
    public resultTotal?: number;
}

export class DataTableUpdateRequest<T extends BaseEntity> {
    public filters: DataTableFilterOption<T>[][];
    public values: DataTableValues<T>[];
}

export class DataTableValues<T extends BaseEntity> {
    public column: ColumnName<T>;
    public value: any;
}

class CountReadFindOptions<T extends BaseEntity> {
    public countOptions: FindManyOptions<T>;
    public findOptions: FindManyOptions<T>;
}

export function fromCreateRequest<T extends BaseEntity>(
    request: DataTableCreateBaseRequest): DataTableCreateRequest<T> {
    return {
        values: request.values as DataTableValues<T>[]
    };
}

export function fromDeleteRequest<T extends BaseEntity>(
    request: DataTableDeleteBaseRequest): DataTableDeleteRequest<T> {
    const newRequest = new DataTableDeleteRequest<T>();

    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const andFilter of request.filters) {
            const newAndFilter: DataTableFilterOption<T>[] = [];
            for (const orFilter of andFilter) {
                newAndFilter.push({
                    operator: orFilter.operator as Operator,
                    operand: orFilter.operand as any,
                    column: orFilter.column as keyof T
                });
            }
            newRequest.filters.push(newAndFilter);
        }
    }

    return newRequest;
}

export function fromReadRequest<T extends BaseEntity>(
    request: DataTableReadBaseRequest): DataTableReadRequest<T> {
    const newRequest = new DataTableReadRequest<T>();

    newRequest.to = request.to;
    newRequest.from = request.from;

    if (Array.isArray(request.fields) && request.fields.length) {
        newRequest.fields = [];
        for (const field of request.fields) {
            newRequest.fields.push(field as keyof T);
        }
    }

    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const andFilter of request.filters) {
            const newAndFilter: DataTableFilterOption<T>[] = [];
            for (const orFilter of andFilter) {
                newAndFilter.push({
                    operator: orFilter.operator as Operator,
                    operand: orFilter.operand as any,
                    column: orFilter.column as keyof T
                });
            }
            newRequest.filters.push(newAndFilter);
        }
    }

    if (Array.isArray(request.sort) && request.sort.length) {
        newRequest.sort = [];
        for (const sort of request.sort) {
            newRequest.sort.push({
                column: sort.column as keyof T,
                order: sort.order
            });
        }
    }

    return newRequest;
}

export function fromUpdateRequest<T extends BaseEntity>(
    request: DataTableUpdateBaseRequest): DataTableUpdateRequest<T> {
    const newRequest = new DataTableUpdateRequest<T>();

    if (Array.isArray(request.filters) && request.filters.length) {
        newRequest.filters = [];
        for (const andFilter of request.filters) {
            const newAndFilter: DataTableFilterOption<T>[] = [];

            for (const orFilter of andFilter) {
                newAndFilter.push({
                    operator: orFilter.operator as Operator,
                    operand: orFilter.operand as any,
                    column: orFilter.column as keyof T
                });
            }

            newRequest.filters.push(newAndFilter);
        }
    }

    if (Array.isArray(request.values) && request.values.length) {
        newRequest.values = [];

        for (const value of request.values) {
            if ('value' in value) {
                newRequest.values.push({
                    column: value.column as keyof T,
                    value: value.value
                });
            }
        }
    }

    return newRequest;
}

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export class DataTable<T extends BaseEntity> {
    private readonly _model: BaseEntityConstraint<T>;
    private readonly _modelMetadata: ModelMetadata<T>;
    private readonly _request: Request;

    constructor(model: BaseEntityConstraint<T>, request: Request) {
        this._model = model;
        this._modelMetadata = getMetadata(model);
        this._request = request;
    }

    public async processCreate(request: DataTableCreateRequest<T>): Promise<DataTableResponse<T>> {
        const runner = appDataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();

        const query = await this._buildQueryForInsertFromRequest(request, runner.manager.createQueryBuilder());
        let errorMessage: string;
        let queryResult: InsertResult;

        try {
            if (typeof this._model['beforeCreate'] === 'function') {
                const result = this._model['beforeCreate'](request, runner, query);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            if (typeof this._model['overrideCreate'] === 'function') {
                const overrideResult = await this._model['overrideCreate'](request, runner, query);

                switch (overrideResult.operation) {
                    case 'create':
                        queryResult = overrideResult;
                        break;

                    case 'delete':
                    case 'read':
                    case 'update':
                        queryResult = {
                            generatedMaps: [],
                            identifiers: [],
                            raw: ''
                        };
                        break;
                }
            } else {
                queryResult = await query.execute();
            }

            if (typeof this._model['afterCreate'] === 'function') {
                const result = this._model['afterCreate'](request, runner, query, queryResult);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            await runner.commitTransaction();
        } catch (error) {
            await runner.rollbackTransaction();

            logger.error('Failed to create record', {
                area: 'database',
                subarea: 'data-table',
                action: 'processCreate',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        } finally {
            await runner.release();
        }

        return {
            status: errorMessage ? 'failed' : 'great-success',
            error: config.env.debug ? errorMessage : undefined,
            createdId: !errorMessage
                ? queryResult.identifiers.length > 1
                    ? queryResult.identifiers.map(item => item.id)
                    : queryResult.identifiers[0].id
                : null
        };
    }

    public async processDelete(request: DataTableDeleteRequest<T>): Promise<DataTableResponse<T>> {
        const runner = appDataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();

        const query = this._buildQueryForDeleteFromRequest(request, runner.manager.createQueryBuilder());
        let errorMessage: string;
        let queryResult: DeleteResult;

        try {
            if (typeof this._model['beforeDelete'] === 'function') {
                const result = this._model['beforeDelete'](request, runner, query);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            if (typeof this._model['overrideDelete'] === 'function') {
                const overrideResult = await this._model['overrideDelete'](request, runner, query);

                switch (overrideResult.operation) {
                    case 'delete':
                        queryResult = overrideResult;
                        break;

                    case 'create':
                    case 'read':
                    case 'update':
                        queryResult = {
                            affected: overrideResult.operation === 'update'
                                ? overrideResult.affected
                                : 0,
                            raw: ''
                        };
                        break;
                }
            } else {
                queryResult = await query.execute();
            }

            if (typeof this._model['afterDelete'] === 'function') {
                const result = this._model['afterDelete'](request, runner, query, queryResult);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            await runner.commitTransaction();
        } catch (error) {
            await runner.rollbackTransaction();

            logger.error('Failed to delete record', {
                area: 'database',
                subarea: 'data-table',
                action: 'processDelete',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        } finally {
            await runner.release();
        }

        return {
            status: errorMessage ? 'failed' : 'great-success',
            error: config.env.debug ? errorMessage : undefined,
            affected: queryResult?.affected
        };
    }

    public async processRead(request: DataTableReadRequest<T>): Promise<DataTableResponse<T>> {
        const runner = appDataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();

        const query = this._buildFindOptionsForReadFromRequest(request, runner.manager.createQueryBuilder());
        let errorMessage: string;
        let count: number;
        let results: T[];

        try {
            if (typeof this._model['beforeRead'] === 'function') {
                const result = this._model['beforeRead'](request, runner, query);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            if (typeof this._model['overrideRead'] === 'function') {
                const overrideResult = await this._model['overrideRead'](request, runner, query);

                switch (overrideResult.operation) {
                    case 'read':
                        results = overrideResult.results;
                        count = results.length;
                        break;

                    case 'create':
                    case 'delete':
                    case 'update':
                        results = [];
                        count = 0;
                        break;
                }
            } else {
                [results, count] = await query.getManyAndCount();
            }

            if (typeof this._model['afterRead'] === 'function') {
                const result = this._model['afterRead'](request, runner, query, results, count);

                if (isPromiseLike(result)) {
                    results = (await result) ?? results;
                } else {
                    results = result ?? results;
                }
            }

            await runner.commitTransaction();
        } catch (error) {
            await runner.rollbackTransaction();

            logger.error('Failed to read records', {
                area: 'database',
                subarea: 'data-table',
                action: 'processRead',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        } finally {
            await runner.release();
        }

        return {
            status: errorMessage ? 'failed' : 'great-success',
            error: config.env.debug ? errorMessage : undefined,
            results,
            resultTotal: count
        };
    }

    public async processUpdate(request: DataTableUpdateRequest<T>): Promise<DataTableResponse<T>> {
        const runner = appDataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();

        const query = await this._buildQueryForUpdateFromRequest(request, runner.manager.createQueryBuilder());
        let errorMessage: string;
        let queryResult: UpdateResult;

        try {
            if (typeof this._model['beforeUpdate'] === 'function') {
                const result = this._model['beforeUpdate'](request, runner, query);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            if (typeof this._model['overrideUpdate'] === 'function') {
                const overrideResult = await this._model['overrideUpdate'](request, runner, query);

                switch (overrideResult.operation) {
                    case 'update':
                        queryResult = overrideResult;
                        break;

                    case 'create':
                    case 'delete':
                    case 'read':
                        queryResult = {
                            generatedMaps: [],
                            affected: overrideResult.operation === 'delete'
                                ? overrideResult.affected
                                : 0,
                            raw: ''
                        };
                        break;
                }
            } else {
                queryResult = await query.execute();
            }

            if (typeof this._model['afterUpdate'] === 'function') {
                const result = this._model['afterUpdate'](request, runner, query, queryResult);

                if (isPromiseLike(result)) {
                    await result;
                }
            }

            await runner.commitTransaction();
        } catch (error) {
            await runner.rollbackTransaction();

            logger.error('Failed to update records', {
                area: 'database',
                subarea: 'data-table',
                action: 'processUpdate',
                result: 'error',
                error,
                ...httpCommonFields(this._request)
            });
            errorMessage = error.message;
        } finally {
            await runner.release();
        }

        return {
            status: errorMessage ? 'failed' : 'great-success',
            error: config.env.debug ? errorMessage : undefined,
            affected: queryResult?.affected
        };
    }

    /* PRIVATE */
    private _buildFindOptionsForReadFromRequest(request: DataTableReadRequest<T>,
        query: QueryBuilder<T>): SelectQueryBuilder<T> {
        const selectQuery = query.createQueryBuilder()
            .select(this._model.name)
            .from(this._model, this._model.name);

        if (request.from !== undefined && request.to !== undefined) {
            selectQuery.skip(request.from);
            selectQuery.take(request.to - request.from);
        }

        if (Array.isArray(request.fields)) {
            selectQuery.select(request.fields
                .filter(field => this._modelMetadata.allowedOnWire.includes(field))
                .filter(column => appDataSource.entityMetadatasMap
                    .get(this._model).columns.find(metadata => metadata.propertyName === column))
                .map(column => `${this._model.name}.${column.toString()}`));
        } else {
            selectQuery.select(this._modelMetadata.allowedOnWire
                .filter(column => appDataSource.entityMetadatasMap
                    .get(this._model).columns.find(metadata => metadata.propertyName === column))
                .map(column => `${this._model.name}.${column.toString()}`));
        }

        if (Array.isArray(request.filters)) {
            this._filterToQuery(selectQuery, request.filters);
        }

        if (Array.isArray(request.sort)) {
            const order = {};

            for (const sort of request.sort) {
                order[`${this._model.name}.${sort.column.toString()}`] = sort.order;
            }

            selectQuery.orderBy(order);
        }

        return selectQuery;
    }

    private async _buildQueryForInsertFromRequest(request: DataTableCreateRequest<T>,
        query: QueryBuilder<T>): Promise<InsertQueryBuilder<T>> {
        const insertQuery = query.insert().into(this._model);
        insertQuery.values(await this._buildRecordFromRequest(request));

        return insertQuery;
    }

    private _buildQueryForDeleteFromRequest(request: DataTableDeleteRequest<T>,
        query: QueryBuilder<T>): DeleteQueryBuilder<T> {
        const deleteQuery = query.delete().from(this._model);

        if (Array.isArray(request.filters)) {
            this._filterToQuery(deleteQuery, request.filters);
        }

        return deleteQuery;
    }

    private async _buildQueryForUpdateFromRequest(request: DataTableUpdateRequest<T>,
        query: QueryBuilder<T>): Promise<UpdateQueryBuilder<T>> {
        const updateQuery = query.update(this._model);
        const record = await this._buildRecordFromRequest(request);

        updateQuery.set(record);

        if (Array.isArray(request.filters)) {
            this._filterToQuery(updateQuery, request.filters);
        }

        return updateQuery;
    }

    private async _buildRecordFromRequest(
        request: DataTableCreateRequest<T> | DataTableUpdateRequest<T>): Promise<{ [Property in keyof T]: any }> {

        const ownColumns = this._model.getRepository().metadata.ownColumns.map(column => column.propertyName);
        const createRequest = request.values.reduce((record, value) => {
            if (!ownColumns.includes(value.column.toString()) || !isKeyOfT<T>(value.column)) {
                return record;
            }

            record[value.column] = value.value;
            return record;
        }, new this._model);

        return await this._sanitizeFieldData(createRequest);
    }

    private _filterToQuery(query: SelectQueryBuilder<T> | DeleteQueryBuilder<T> | UpdateQueryBuilder<T>,
        filters: DataTableFilterOption<T>[][]): void {
        const allowedColumns = this._modelMetadata.allowedOnWire;
        let index = 0;

        for (const andFilter of filters) {
            if (this._shouldSkipFilter(andFilter)) {
                continue;
            }

            query.andWhere(
                new Brackets(qb => {
                    for (const orFilter of andFilter) {
                        if ((isKeyOfT<T>(orFilter.column) &&
                            (!allowedColumns.includes(orFilter.column) || this._shouldSkipFilter(orFilter))) ||
                            !isKeyOfT<T>(orFilter.column)) {
                            continue;
                        }

                        const modelMetadata = appDataSource.getMetadata(this._model);
                        const columnMetadata = modelMetadata.columns.find(
                            column => column.propertyName === orFilter.column);
                        const parameterName = `${orFilter.column.toString()}_${index++}`;
                        const operands = Array.isArray(orFilter.operand) ? orFilter.operand : [orFilter.operand];

                        if (columnMetadata && columnMetadata.type === 'boolean' &&
                            operands.length === 1 && operands[0] === 'unset') {
                            continue;
                        }

                        qb.orWhere(this._whereString(orFilter,
                            parameterName,
                            !(query instanceof DeleteQueryBuilder || query instanceof UpdateQueryBuilder)),
                            Object.fromEntries(operands.map((operand, index) =>
                                [`${parameterName}${index > 0 ? `_${index + 1}` : ''}`, operand]))
                        );
                    }
                })
            );
        }
    }

    private _hasFileRefs(field: any): boolean {
        let hasFileRefs = false;

        hasFileRefs ||= typeof field === 'string' && field.startsWith('___DT_FILE___');
        hasFileRefs ||= Array.isArray(field) &&
            field.some(i => (typeof i === 'string' && i.startsWith('___DT_FILE___')));
        hasFileRefs ||= (!Array.isArray(field) && typeof field === 'object' && field !== null) &&
            Object.values(field).some(i => (typeof i === 'string' && i.startsWith('___DT_FILE___')));

        return hasFileRefs;
    }

    private async _sanitizeFieldData(record: { [Property in keyof T]: any }): Promise<{ [Property in keyof T]: any }> {
        for (const [columnName, field] of Object.entries(record)) {
            if (this._hasFileRefs(field)) {
                if (Object.keys(this._modelMetadata.allowedUploads).includes(columnName)) {
                    record[columnName] = await this._saveFile(columnName as keyof T, field);
                } else {
                    throw new FileNotAllowedError(`Column ${columnName} doesn't support files`);
                }
            }
        }

        return record;
    }

    private async _saveFile(columnName: keyof T, value: string | string[])
        : Promise<string | string[] | Record<string, string>> {
        const allowedMimes = this._modelMetadata.allowedUploads[columnName].allowedMimes;
        const destinationDir = this._modelMetadata.allowedUploads[columnName].path;
        const filePrefix = this._modelMetadata.allowedUploads[columnName].prefix;
        const fileNames: string[] = [];
        const objectFiles: Record<string, string> = {};
        let arrayFlag = false;
        let objectFlag = false;
        let iterator: IterableIterator<[number | string, string]> | [number | string, string][];

        if (!Array.isArray(value) && typeof value !== 'object') {
            iterator = [value].entries();
            arrayFlag = true;
        } else if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
            iterator = Object.entries(value);
            objectFlag = true;
        } else {
            iterator = value.entries();
        }

        for (const [prop, fileItemRef] of iterator) {
            if (!fileItemRef.startsWith('___DT_FILE___')) {
                if (!objectFlag) {
                    fileNames.push(fileItemRef);
                } else {
                    objectFiles[prop] = fileItemRef;
                }
            } else if (this._request.files[fileItemRef] !== undefined) {
                const fileMime = process.platform === "win32"
                    ? 'image/jpeg'
                    : await checkFileMimeType(this._request.files[fileItemRef].data);
                const fileOnDisk = await getUniqueFilename((filePrefix.length
                    ? join(destinationDir, `${filePrefix}-`)
                    : `${destinationDir}/`) + extname(this._request.files[fileItemRef].name));
                const fileRelative = fileOnDisk.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/');

                if (!allowedMimes.some(regex => regex.test(fileMime))) {
                    throw new InvalidFormatError();
                }

                await this._request.files[fileItemRef].mv(fileOnDisk);
                if (!objectFlag) {
                    fileNames.push(fileRelative);
                } else {
                    objectFiles[prop] = fileRelative;
                }
            }
        }

        return arrayFlag
            ? fileNames[0]
            : objectFlag
                ? objectFiles
                : fileNames;
    }

    private _shouldSkipFilter(filter: DataTableFilterOption<T>[] | DataTableFilterOption<T>): boolean {
        return Array.isArray(filter)
            ? filter.every(filter => ['IN', 'NOT IN'].includes(filter.operator) &&
                Array.isArray(filter.operand) &&
                filter.operand.length === 0)
            : ['IN', 'NOT IN'].includes(filter.operator) &&
            Array.isArray(filter.operand) &&
            filter.operand.length === 0;
    }

    private _whereString(filter: DataTableFilterOption<T>, parameterName: string, prefix = true): string {
        let where = `${prefix ? (this._model.name + '.') : ''}${filter.column.toString()} `;

        switch (filter.operator) {
            case '==':
                where += `= :${parameterName}`;
                break;

            case '!=':
                where += `!= :${parameterName}`;
                break;

            case '<':
                where += `< :${parameterName}`;
                break;

            case '<=':
                where += `<= :${parameterName}`;
                break;

            case '>':
                where += `> :${parameterName}`;
                break;

            case '>=':
                where += `>= :${parameterName}`;
                break;

            case '<=>':
                where += `BETWEEN :${parameterName} AND :${parameterName}_2`;
                break;

            case 'IN':
                where += `IN(:...${parameterName})`;
                break;

            case 'NOT IN':
                where += `NOT IN(:...${parameterName})`;
                break;

            case '~':
                where += `LIKE :${parameterName}`;
                break;

            case '~~':
                where += `ILIKE :${parameterName}`;
                break;

            case '~~ IN':
                where += `ILIKE ANY(:${parameterName})`;
                break;

            case '!~':
                where += `NOT LIKE :${parameterName}`;
                break;

            case '!~~':
                where += `NOT ILIKE :${parameterName}`;
                break;

            case '@>':
                where += `@> :${parameterName}`;
                break;
        }

        return where;
    }
}
