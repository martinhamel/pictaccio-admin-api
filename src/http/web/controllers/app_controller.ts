import { Authorized, Body, CurrentUser, Get, JsonController, Post } from '@loufa/routing-controllers';
import { ConfigSchema } from '../../../core/config_schema';
import { NotFoundError } from '../../../errors/not_found_error';
import { DebugRunJobRequest } from '../../../http/shared/controllers/requests/debug_run_job_request';
import { DebugGetJobsResponse } from '../../../http/shared/controllers/responses/debug_get_jobs_response';
import { PingResponse } from '../../../http/shared/controllers/responses/ping_response';
import { DbQueriesService } from '../../../services/db_queries_service';
import JobsService from '../../../services/jobs_service';
import { User } from '@pictaccio/shared/types/user';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/app')
export class AuthController {
    constructor(@Inject('config') private config: ConfigSchema,
        @Inject() private jobs: JobsService,
        @Inject() private dbQueries: DbQueriesService) {
    }

    @Authorized('read:debug')
    @Get('/debug-get-db-queries')
    public async debugGetDbQueries(): Promise<any> {
        if (!this.config.env.debug && !this.config.featureFlags._debugDbMetrics) {
            throw new NotFoundError('Not found');
        }

        return {
            status: 'great-success',
            queries: this.dbQueries.getQueries()
        };
    }

    @Authorized('read:debug')
    @Get('/debug-get-jobs')
    public async debugGetJobs(): Promise<DebugGetJobsResponse> {
        if (!this.config.env.debug) {
            throw new NotFoundError('Not found');
        }

        return {
            status: 'great-success',
            jobs: Object.values(this.config.scheduler.jobs).map(job => job.name)
        };
    }

    @Authorized('update:debug')
    @Post('/debug-run-job')
    public async debugRunJob(@Body() body: DebugRunJobRequest): Promise<any> {
        if (!this.config.env.debug) {
            throw new NotFoundError('Not found');
        }

        await this.jobs.run(body.jobName, null);

        return {
            status: 'great-success'
        };
    }

    @Get('/ping')
    public async ping(@CurrentUser() user: User): Promise<PingResponse> {
        return {
            status: 'great-success',
            authenticated: user !== null
        };
    }
}
