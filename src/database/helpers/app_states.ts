import { logger } from '../../core/logger';
import { appDataSource } from '../../database/data_source';
import { PublicAppState } from '../../database/entities/public_app_state';
import {
    AppStateKey,
    AppStateKeyTypeDefaults,
    AppStateValueType,
    isAppStateValueType
} from '../../types/app_states';
import { QueryRunner } from 'typeorm';

export async function getAppState<K extends AppStateKey>(key: K): Promise<AppStateValueType<K>> {
    const runner = appDataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    try {
        const appStateValue = await getAppStateQuery(runner, key);

        await runner.commitTransaction();
        return appStateValue;
    } catch (error) {
        await runner.rollbackTransaction();

        logger.error(`There was an error getting app state for key: ${key}`, {
            area: 'database',
            subarea: 'app-state',
            action: 'getAppState',
            state_key: key
        });
    } finally {
        await runner.release();
    }

    return null;
}

export async function getAppStateQuery<K extends AppStateKey>
    (runner: QueryRunner, key: K): Promise<AppStateValueType<K>> {
    const appState = runner.manager.getRepository(PublicAppState);
    const result = (await appState.findOne({ where: { key } }));

    if (!result) {
        return AppStateKeyTypeDefaults[key] as AppStateValueType<K>;
    }

    if (!isAppStateValueType(key, result.value)) {
        logger.error(`App state value for key: ${key} is not of the expected type`, {
            area: 'database',
            subarea: 'app-state',
            action: 'getAppStateQuery',
            state_key: key
        });

        throw new Error(`App state value for key: ${key} is not of the expected type`);
    }

    return result.getValue(key);
}

export async function setAppState<K extends AppStateKey>(key: K, value: AppStateValueType<K>): Promise<void> {
    const runner = appDataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();

    try {
        await setAppStateQuery(runner, key, value);

        await runner.commitTransaction();
    } catch (error) {
        await runner.rollbackTransaction();

        logger.error(`There was an error setting app state for key: ${key}`, {
            area: 'database',
            subarea: 'app-state',
            action: 'setAppState',
            state_key: key
        });
    } finally {
        await runner.release();
    }
}

export async function setAppStateQuery<K extends AppStateKey>
    (runner: QueryRunner, key: K, value: AppStateValueType<K>): Promise<void> {
    const appState = runner.manager.getRepository(PublicAppState);

    await appState.save(appState.create({ key, value }));
}
