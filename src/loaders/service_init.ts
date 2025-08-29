import { Container } from 'typedi';
import { LoaderInterface } from '../bootstrap';
import type JobsCommMainService from '../services/jobs_comm_main_service';
import type WebsocketService from '../services/websocket_service';

export const serviceInitLoader: LoaderInterface = async (): Promise<void> => {
    Container.get<WebsocketService>('websocket').init();
    Container.get<JobsCommMainService>('jobs-comm-main').init();
};
