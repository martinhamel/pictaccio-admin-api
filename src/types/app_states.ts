export const AppStateTypes = [
    'string',
    'number',
    'boolean',
    'timestamp'
] as const;

export type AppStateValue = string | number | boolean | Date;

export const AppStateKeys = [
    'lastBackgroundStatsOrderUpdateTimestamp',
    'lastBackgroundStatsProcessedOrderId',
    'lastSalesStatsOrderUpdateTimestamp',
    'lastSalesStatsProcessedOrderId'
] as const;

export type AppStateKey = keyof AppStateKeyTypeMap;

export type AppStateKeyTypeMap = {
    lastBackgroundStatsOrderUpdateTimestamp: Date;
    lastBackgroundStatsProcessedOrderId: string;
    lastSalesStatsOrderUpdateTimestamp: Date;
    lastSalesStatsProcessedOrderId: string;
};

export const AppStateKeyTypeStringMap = {
    lastBackgroundStatsOrderUpdateTimestamp: 'timestamp',
    lastBackgroundStatsProcessedOrderId: 'string',
    lastSalesStatsOrderUpdateTimestamp: 'timestamp',
    lastSalesStatsProcessedOrderId: 'string'
};

export const AppStateKeyTypeDefaults: {[K in AppStateKey]: AppStateValueType<K>} = {
    lastBackgroundStatsOrderUpdateTimestamp: new Date(0),
    lastBackgroundStatsProcessedOrderId: '0',
    lastSalesStatsOrderUpdateTimestamp: new Date(0),
    lastSalesStatsProcessedOrderId: '0'
};

export type AppStateValueType<K extends AppStateKey> = AppStateKeyTypeMap[K];

export function isAppStateValueType<K extends AppStateKey>(key: K, value: any): value is AppStateValueType<K> {
    const expectedType = AppStateKeyTypeStringMap[key];

    switch (expectedType) {
        case 'string':
            return typeof value === 'string';

        case 'number':
            return typeof value === 'number';

        case 'boolean':
            return typeof value === 'boolean';

        case 'timestamp':
            return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));

        default:
            return false;
    }
}
