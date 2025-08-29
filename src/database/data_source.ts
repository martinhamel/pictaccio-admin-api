import { ConfigSchema } from '../core/config_schema';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';

const config: ConfigSchema = Container.get<ConfigSchema>('config');

export const appDataSource = new DataSource({
    // @ts-ignore
    type: config.db[0].type,
    host: config.db[0].host,
    port: config.db[0].port,
    username: config.db[0].username,
    password: config.db[0].password,
    database: config.db[0].database,
    schema: config.db[0].schema,
    entities: config.db[0].entitiesDir,
    migrations: config.db[0].migrationsDir,
    subscribers: config.db[0].subscribersDir,
    logging: config.db[0].logging
});

function isRunningInMigrationCommand() {
    return process.argv.some(arg => arg.includes('migration:'));
}

export default new Promise<void>((resolve, reject) => {
    if (appDataSource.isInitialized || isRunningInMigrationCommand()) {
        resolve();
        return;
    }

    appDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");
            resolve();
        })
        .catch((error) => {
            console.error("Error during Data Source initialization", error);
            reject(error);
        });
});
