import { ConfigSchema } from '../core/config_schema';
import { DbQueriesService } from '../services/db_queries_service';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { Inject, Service } from 'typedi';

@Service()
export default class JobsService {
    constructor(@Inject('config') private config: ConfigSchema,
        @Inject() private dbQueries: DbQueriesService) {
    }

    public run<T>(jobName: string, data: T): Promise<void> {
        return new Promise((resolve, reject) => {
            const worker = new Worker(join(this.config.env.dirs.root, `core/jobs_host.js`));

            worker.on('message', (msg) => {
                if (msg.type === '_debug-log-query') {
                    this.dbQueries.addQuery(msg.query);
                } else if (msg.type === 'job-done') {
                    resolve();
                } else if (msg.type === 'job-failed') {
                    reject(msg.error);
                } else if (msg.type === 'job-invalid') {
                    reject(new Error(`Job ${jobName} is invalid`));
                }
            });

            worker.postMessage({
                type: 'new-job',
                name: jobName,
                data
            });
        });
    }
}
