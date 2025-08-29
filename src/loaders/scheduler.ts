import cron from 'node-cron';
import path from 'path';
import { Worker } from 'node:worker_threads';
import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';
import { ConfigSchema } from '../core/config_schema';
import { logger } from '../core/logger';

type WorkerThreadInfo = {
    jobCount: number;
    thread: Worker;
}

/**
 * Encapsulate an array of worker threads
 */
class WorkerTheadArray extends Array {
    /**
     * Creates a WorkerThreadArray from a WorkerThreadInfo[]
     * @param workers A reference to a WorkerThreadInfo[]
     * @return A newly created WorkerThreadArray
     */
    public static from(workers: WorkerThreadInfo[]): WorkerTheadArray {
        const array = new WorkerTheadArray();

        for (const [index, worker] of workers.entries()) {
            array[index] = worker;
        }

        return array;
    }

    /**
     * Post a new-job message to the less busy worker thread in the pool
     * @param name The name of the job to run in the least busy worker thread
     */
    public postToLessBusyWorker(name: string): void {
        logger.debug(`Posting job '${name}'`, {
            area: 'loaders',
            subarea: 'scheduler',
            action: 'jobs:scheduling',
            jobName: name
        });
        this.sort((a, b) => a.jobCount - b.jobCount)[0].thread.postMessage({ type: 'new-job', name });
    }
}

/**
 * Create the worker threads pool to execute the jobs in the background
 * @param srcPath The path of the src directory
 * @param concurrency How many worker to create
 */
function createWorkerThreads(srcPath: string, concurrency: number): WorkerTheadArray {
    const workers: WorkerThreadInfo[] = [];

    logger.debug(`Creating ${concurrency} worker thread(s)`, {
        area: 'loaders',
        subarea: 'scheduler',
        action: 'jobs:create-worker-thread',
        concurrency
    });
    for (let i = 0; i < concurrency; i++) {
        const worker: Worker = new Worker(path.join(srcPath, 'core/jobs_host.js'));

        worker.on('message', (msg) => {
            const workerId = i;

            switch (msg.type) {
                case 'job-started':
                    workers[workerId].jobCount++;
                    break;

                case 'job-done':
                case 'job-failed':
                case 'job-invalid':
                    workers[workerId].jobCount--;
                    break;
            }
        });

        workers.push({
            jobCount: 0,
            thread: worker
        });
    }

    return WorkerTheadArray.from(workers);
}

export const schedulerLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');
    const workers: WorkerTheadArray = createWorkerThreads(config.env.dirs.root, config.scheduler.concurrency);

    logger.debug('Reading background jobs config', {
        area: 'loaders',
        subarea: 'scheduler',
        action: 'jobs:reading-config'
    });
    for (const job of config.scheduler.jobs.filter(job => job.disabled !== true)) {
        logger.debug(`Scheduling background job ${job.name}`, {
            area: 'loaders',
            subarea: 'scheduler',
            action: 'jobs:scheduling',
            jobName: job.name,
            timing: job.timing
        });

        cron.schedule(job.timing, () => workers.postToLessBusyWorker(job.name));
    }
};
