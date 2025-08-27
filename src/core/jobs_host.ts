import 'reflect-metadata';
import { bootstrap } from '../bootstrap';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';
import { configLoader } from '../loaders/config';
import { typediLoader } from '../loaders/typedi';
import { typeormLoader } from '../loaders/typeorm';
import { AsyncStoreService } from '../services/async_store_service';
import { DbQuery } from '../services/db_queries_service';
import { JobContext } from '../types/async_storage_items';
import { isPromiseLike } from '../utils/is_promise_like';
import { promises as fsPromises, Stats } from 'fs';
import { randomUUID } from 'node:crypto';
import { isMainThread, parentPort, threadId } from 'node:worker_threads';
import path from 'path';
import { Container } from 'typedi';

type JobCacheItem = {
    callable: (data: any) => Promise<void> | void;
}

// Quit process if running from main thread
if (isMainThread) {
    console.error('[JOBSHOST] Imported on main thread');
    process.exit(1);
}

// Bootstrap loader selection for worker thread
bootstrap([
    typediLoader,
    configLoader,
    typeormLoader
]).then(() => {
    const config = Container.get<ConfigSchema>('config');
    const jobCache: { [key: string]: JobCacheItem } = {};

    /**
     * Run a job in the worker thread. The first time the job is ran, the import is cached for subsequent runs
     * @param name The name of the script to run, must match the name of a file in src/jobs/*.js
     */
    async function runJob(name: string, data: any): Promise<void> {
        const scriptPath = path.join(config.env.dirs.jobs, name + '.js');
        let stat: Stats;

        try {
            stat = await fsPromises.stat(scriptPath);
        } catch (e) {
            stat = null;
        }

        if (stat !== null) {
            if (jobCache[name] === undefined) {
                jobCache[name] = {
                    callable: (await import(scriptPath)).default
                };
            }
            const asyncStore = Container.get<AsyncStoreService>('async-store');
            const job = jobCache[name];
            const jobContext: JobContext = {
                jobName: name,
                jobId: randomUUID(),
                startTime: new Date()
            };

            asyncStore.init();
            asyncStore.set('jobContext', jobContext);

            parentPort.emit('message', { type: 'job-started', name });
            logger.info(`Running '${name}' on worker thread '${threadId}'`, {
                area: 'JOBSHOST',
                jobName: name,
                threadId
            });

            try {
                const start = process.hrtime();
                const maybePromise = job.callable(data);
                if (isPromiseLike(maybePromise)) {
                    await maybePromise;
                }
                const diff = process.hrtime(start);
                const diffMs = Math.ceil(diff[0] * 1000 + diff[1] / 1000000);

                logger.info(
                    `Job '${name}' finished on worker thread '${threadId}' ` +
                    `in ${diffMs}ms`, {
                    area: 'JOBSHOST',
                    jobName: name,
                    durationInMs: diffMs,
                    threadId
                });
                parentPort.postMessage({ type: 'job-done', name });
            } catch (error) {
                logger.error(`Job '${name}' failed on worker thread '${threadId}'`, {
                    area: 'JOBSHOST',
                    jobName: name,
                    threadId,
                    error
                });

                parentPort.postMessage({ type: 'job-failed', name, error });
            }
        } else {
            logger.error(`Job '${name}' not found`, {
                area: 'JOBSHOST',
                jobName: name
            });
            parentPort.postMessage({ type: 'job-invalid', name });
        }
    }

    parentPort.on('message', (msg) => {
        switch (msg.type) {
            case 'new-job':
                runJob(msg.name, msg.data);
        }
    });
});
