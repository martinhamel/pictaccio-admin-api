import { appDataSource } from '@pictaccio/admin-api/database/data_source';

export const appDataSourcePromise = appDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
