import { IsIn } from '@loufa/class-validator';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import Container from 'typedi';

const config = Container.get<ConfigSchema>('config');

export class DebugRunJobRequest {
    @IsIn(Object.values(config.scheduler.jobs).map(job => job.name))
    public jobName: string;
}
