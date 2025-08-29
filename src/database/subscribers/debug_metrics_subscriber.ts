import { ConfigSchema } from '../../core/config_schema';
import { StoreInterface } from '../../core/store_interface';
import { DbQueriesService, DbQuery } from '../../services/db_queries_service';
import { AsyncStorageItemTypeMap } from '../../types/async_storage_items';
import Container from 'typedi';
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { AfterQueryEvent } from 'typeorm/subscriber/event/QueryEvent';

const config = Container.get<ConfigSchema>('config');

let DebugMetricsSubscriber: { new(...args: any[]): EntitySubscriberInterface };
if (config.featureFlags._debugDbMetrics) {
    @EventSubscriber()
    class DebugMetricsSubscriberImpl implements EntitySubscriberInterface {
        public afterQuery(event: AfterQueryEvent<any>): void {
            const dbQueries = Container.get(DbQueriesService);
            const asyncStore = Container.get<StoreInterface<AsyncStorageItemTypeMap>>('async-store');
            const jobContext = asyncStore.get('jobContext');
            const pubsubContext = asyncStore.get('pubsubContext');
            const socketContext = asyncStore.get('socketContext');
            const request = asyncStore.get('request');
            const internalRequest = asyncStore.get('requestInternal');
            const query: DbQuery = {
                timestamp: new Date(),
                triggerType: request
                    ? 'http-request'
                    : internalRequest
                        ? 'internal-request'
                        : socketContext
                            ? 'socket-request'
                            : pubsubContext
                                ? 'pubsub'
                                : 'job',
                httpRequestTrigger: request
                    ? {
                        method: request.method,
                        url: request.url,
                        data: request.body,
                        user: request.user,
                        correlationId: request.correlationId,
                        timestamp: request.timestamp
                    }
                    : internalRequest
                        ? {
                            method: internalRequest.method,
                            url: internalRequest.url,
                            data: internalRequest.body,
                            user: internalRequest.user,
                            correlationId: internalRequest.correlationId,
                            timestamp: internalRequest.timestamp
                        }
                        : undefined,
                jobContextTrigger: jobContext,
                pubsubContextTrigger: pubsubContext,
                socketContextTrigger: socketContext,
                query: event.query,
                parameters: event.parameters,
                executionTime: event.executionTime,
                error: event.error
            };

            dbQueries.addQuery(query);
        }
    }

    DebugMetricsSubscriber = DebugMetricsSubscriberImpl;
} else {
    DebugMetricsSubscriber = null;
}

export { DebugMetricsSubscriber };
