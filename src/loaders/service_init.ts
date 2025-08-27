import { Container } from 'typedi';
import { LoaderInterface } from '@pictaccio/admin-api/bootstrap';
import type JobsCommMainService from '@pictaccio/admin-api/services/jobs_comm_main_service';
import type WebsocketService from '@pictaccio/admin-api/services/websocket_service';

export const serviceInitLoader: LoaderInterface = async (): Promise<void> => {
    Container.get<WebsocketService>('websocket').init();
    Container.get<JobsCommMainService>('jobs-comm-main').init();
};
