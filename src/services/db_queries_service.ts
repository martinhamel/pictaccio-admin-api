import { logger } from '..//core/logger';
import { HttpMethod } from '..//types/request';
import { User } from '@pictaccio/shared/types/user';
import { isMainThread, parentPort } from 'node:worker_threads';
import { Service } from 'typedi';

export type DbQueryTriggerType = 'internal-request' | 'http-request' | 'socket-request' | 'pubsub' | 'job';

export type DbQueryHttpRequestTrigger = {
    method: HttpMethod;
    url: string;
    data: any;
    user: User | 'unauthenticated';
    correlationId: string;
    timestamp: Date;
}

export type DbQueryJobContextTrigger = {
    jobName: string;
    jobId: string;
    startTime: Date;
}

export type DbQueryPubsubContextTrigger = {
    channel: string;
    startTime: Date;
}

export type DbQuerySocketContextTrigger = {
    socketId: string;
    startTime: Date;
    user: User;
}

export type DbQuery = {
    timestamp: Date;
    triggerType: DbQueryTriggerType;
    httpRequestTrigger?: DbQueryHttpRequestTrigger;
    jobContextTrigger?: DbQueryJobContextTrigger;
    pubsubContextTrigger?: DbQueryPubsubContextTrigger;
    socketContextTrigger?: DbQuerySocketContextTrigger;
    query: string;
    parameters: any[];
    executionTime: number;
    error: any;
}

@Service()
export class DbQueriesService {
    private _queries: Map<number, DbQuery> = new Map();
    private _timestamps: number[] = [];

    public addQuery(query: DbQuery): void {
        if (isMainThread) {
            this._insertSorted(query);
        } else {
            parentPort.postMessage({ type: '_debug-log-query', query });
        }
    }

    public getQueries(): DbQuery[] {
        return this._timestamps.map(timestamp => this._queries.get(timestamp));
    }

    /* PRIVATE */
    private _insertSorted(query: DbQuery): void {
        const timestamp = query.timestamp.getTime();
        const length = this._timestamps.length;

        let windowSize = Math.min(10, length);
        let left = Math.max(0, length - windowSize);
        let right = length - 1;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            while (left <= right) {
                const mid = Math.floor((left + right) / 2);
                if (this._timestamps[mid] > timestamp) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            }

            if ((left < length && this._timestamps[left] > timestamp) ||
                (right === -1 || this._timestamps[right] < timestamp)) {
                break;
            }

            if (windowSize < length) {
                windowSize = Math.min(windowSize * 2, length);
                left = Math.max(0, length - windowSize);
                right = length - 1;
            } else {
                break;
            }
        }

        if (this._queries.has(timestamp)) {
            logger.warn('Query with timestamp already exists, overwriting...');
        }

        this._timestamps.splice(left, 0, timestamp);
        this._queries.set(timestamp, query);
    }
}
