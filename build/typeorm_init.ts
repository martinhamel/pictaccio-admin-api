import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { config } from 'dotenv';
config({ path: process.env.ENV_PATH || '.env' });

import { bootstrap } from '../src/bootstrap';
import { typediLoader } from '../src/loaders/typedi';
import { configLoader } from '../src/loaders/config';

bootstrap([
    typediLoader,
    configLoader
])
    .then(async () => {
        async function importTypeOrmCli() {
            let modulePath: string;
            try {
                const stats = await stat(resolve(__dirname, '../node_modules/typeorm/cli.js'));
                if (stats.isFile()) {
                    modulePath = '../node_modules/typeorm/cli.js';
                } else {
                    throw new Error();
                }
            } catch {
                try {
                    const stats = await stat(resolve(__dirname, '../../../node_modules/typeorm/cli.js'));
                    if (stats.isFile()) {
                        modulePath = '../../../node_modules/typeorm/cli.js';
                    } else {
                        throw new Error();
                    }
                } catch {
                    throw new Error('typeorm/cli could not be found in any of the expected paths.');
                }
            } finally {
                if (modulePath) {
                    import(modulePath);
                }
            }
        }

        // Usage
        importTypeOrmCli().then(() => {
            console.log('TypeORM CLI was imported successfully.');
        }).catch(error => {
            console.error('An error occurred:', error.message);
        });
    });
